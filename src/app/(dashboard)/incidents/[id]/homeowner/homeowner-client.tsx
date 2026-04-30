"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { IncidentHomeownerSkeleton } from "@/components/incidents/incident-detail-skeleton";
import { useAuthContext } from "@/contexts/auth-context";
import { auth } from "@/lib/firebase";
import { useIncident } from "@/hooks/use-incidents";
import {
  createChangeRequestAction,
  approveChangeRequestAction,
  rejectChangeRequestAction,
  type ChangeRequestField,
} from "@/actions/change-requests";
import { subscribeToPendingChangeRequests } from "@/services/change-requests";
import { toast } from "sonner";
import {
  InfoIcon,
  PencilSimpleIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  ArrowRightIcon,
} from "@phosphor-icons/react";
import type { ChangeRequest, WithId } from "@/lib/db";

async function getCurrentUserToken() {
  const token = await auth.currentUser?.getIdToken();
  if (!token) {
    throw new Error("Authentication required");
  }

  return token;
}

interface FieldConfig {
  key: ChangeRequestField;
  label: string;
  type: "text" | "email" | "textarea";
  getValue: (
    incident: NonNullable<ReturnType<typeof useIncident>["incident"]>,
  ) => string;
}

const FIELDS: FieldConfig[] = [
  {
    key: "name",
    label: "Homeowner Name",
    type: "text",
    getValue: (i) => i.homeowner?.name || "",
  },
  {
    key: "contact",
    label: "Contact Person",
    type: "text",
    getValue: (i) => i.homeowner?.contact || "",
  },
  {
    key: "phone",
    label: "Phone",
    type: "text",
    getValue: (i) => i.homeowner?.phone || "",
  },
  {
    key: "email",
    label: "Email",
    type: "email",
    getValue: (i) => i.homeowner?.email || "",
  },
  {
    key: "address",
    label: "Property Address",
    type: "text",
    getValue: (i) => i.homeowner?.address || "",
  },
  {
    key: "policyNumber",
    label: "Policy Number",
    type: "text",
    getValue: (i) => i.homeowner?.insurance?.policyNumber || "",
  },
  {
    key: "carrier",
    label: "Carrier Name",
    type: "text",
    getValue: (i) => i.homeowner?.insurance?.carrier || "",
  },
  {
    key: "claimsPhone",
    label: "Claims Phone",
    type: "text",
    getValue: (i) => i.homeowner?.insurance?.claimsPhone || "",
  },
  {
    key: "description",
    label: "Damage Description",
    type: "textarea",
    getValue: (i) => i.homeowner?.description || "",
  },
  {
    key: "adjusterName",
    label: "Adjuster Name",
    type: "text",
    getValue: (i) => i.homeowner?.adjuster?.name || "",
  },
  {
    key: "adjusterPhone",
    label: "Adjuster Phone",
    type: "text",
    getValue: (i) => i.homeowner?.adjuster?.phone || "",
  },
  {
    key: "notes",
    label: "Additional Notes",
    type: "textarea",
    getValue: (i) => i.homeowner?.notes || "",
  },
];

export default function HomeownerClient({
  incidentId,
}: {
  incidentId: string;
}) {
  const { incident, loading, updateHomeowner } = useIncident(incidentId);
  const { profile } = useAuthContext();

  const isSupe = profile?.role === "supe" || profile?.role === "admin";

  const [formData, setFormData] = useState<Record<string, string>>({});
  const [editField, setEditField] = useState<FieldConfig | null>(null);
  const [proposedValue, setProposedValue] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [pendingRequests, setPendingRequests] = useState<
    WithId<ChangeRequest>[]
  >([]);
  const [reviewingId, setReviewingId] = useState<string | null>(null);

  useEffect(() => {
    if (incident) {
      const data: Record<string, string> = {};
      FIELDS.forEach((f) => {
        data[f.key] = f.getValue(incident);
      });
      setFormData(data);
    }
  }, [incident]);

  useEffect(() => {
    if (!isSupe) return;
    const unsub = subscribeToPendingChangeRequests(
      setPendingRequests,
      incidentId,
    );
    return unsub;
  }, [isSupe, incidentId]);

  const handleSupeSave = async () => {
    try {
      await updateHomeowner({
        name: formData.name,
        contact: formData.contact,
        phone: formData.phone,
        email: formData.email,
        address: formData.address,
        insurance: {
          policyNumber: formData.policyNumber,
          carrier: formData.carrier,
          claimsPhone: formData.claimsPhone,
        },
        description: formData.description,
        adjuster: {
          name: formData.adjusterName,
          phone: formData.adjusterPhone,
        },
        notes: formData.notes,
      });
      toast.success("Homeowner info updated");
    } catch {
      toast.error("Failed to update homeowner info");
    }
  };

  const handleApprove = async (request: WithId<ChangeRequest>) => {
    if (!profile) return;
    setReviewingId(request._id);
    try {
      const token = await getCurrentUserToken();
      await approveChangeRequestAction(request._id, token);
      toast.success("Change approved and applied");
    } catch {
      toast.error("Failed to approve change");
    } finally {
      setReviewingId(null);
    }
  };

  const handleReject = async (request: WithId<ChangeRequest>) => {
    if (!profile) return;
    setReviewingId(request._id);
    try {
      const token = await getCurrentUserToken();
      await rejectChangeRequestAction(request._id, token);
      toast.success("Change rejected");
    } catch {
      toast.error("Failed to reject change");
    } finally {
      setReviewingId(null);
    }
  };

  const handleRequestChange = async () => {
    if (!editField || !profile) return;

    const currentValue = formData[editField.key] || "";
    if (proposedValue === currentValue) {
      toast.error("Proposed value is same as current");
      return;
    }

    setSubmitting(true);
    try {
      const token = await getCurrentUserToken();
      await createChangeRequestAction({
        incidentId,
        field: editField.key,
        fieldLabel: editField.label,
        currentValue,
        proposedValue,
        authToken: token,
      });
      toast.success("Change request submitted for supe approval");
      setEditField(null);
      setProposedValue("");
    } catch {
      toast.error("Failed to submit change request");
    } finally {
      setSubmitting(false);
    }
  };

  const openChangeDialog = (field: FieldConfig) => {
    setEditField(field);
    setProposedValue(formData[field.key] || "");
  };

  if (loading) {
    return <IncidentHomeownerSkeleton />;
  }

  if (isSupe) {
    return (
      <div className="space-y-4">
        {pendingRequests.length > 0 && (
          <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <ClockIcon className="h-5 w-5 text-amber-600" weight="fill" />
                Pending Change Requests ({pendingRequests.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request._id}
                  className="p-3 rounded-lg bg-white border border-amber-200"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-medium">
                        {request.fieldLabel}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        by {request.requesterName}
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="text-amber-700 border-amber-300"
                    >
                      Pending
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2 text-sm mb-3">
                    <span className="px-2 py-1 rounded bg-red-50 text-red-700 line-through max-w-[40%] truncate">
                      {request.currentValue || "(empty)"}
                    </span>
                    <ArrowRightIcon className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="px-2 py-1 rounded bg-green-50 text-green-700 max-w-[40%] truncate">
                      {request.proposedValue || "(empty)"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-green-600 border-green-300 hover:bg-green-50"
                      onClick={() => handleApprove(request)}
                      disabled={reviewingId === request._id}
                    >
                      <CheckIcon className="h-4 w-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 text-red-600 border-red-300 hover:bg-red-50"
                      onClick={() => handleReject(request)}
                      disabled={reviewingId === request._id}
                    >
                      <XIcon className="h-4 w-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Homeowner Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-6">
              {FIELDS.map((field) => (
                <div key={field.key} className="space-y-2">
                  <Label className="text-sm font-medium">{field.label}</Label>
                  {field.type === "textarea" ? (
                    <Textarea
                      value={formData[field.key] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                      className="min-h-24"
                    />
                  ) : (
                    <Input
                      type={field.type}
                      value={formData[field.key] || ""}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          [field.key]: e.target.value,
                        })
                      }
                      className="h-11"
                    />
                  )}
                </div>
              ))}
              <Button onClick={handleSupeSave} className="w-full h-11">
                Save Changes
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Homeowner Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-blue-50 border border-blue-200">
            <InfoIcon
              className="h-5 w-5 text-blue-600 shrink-0 mt-0.5"
              weight="fill"
            />
            <div className="text-sm text-blue-800">
              <p className="font-medium">View Only</p>
              <p className="text-blue-700 mt-0.5">
                You can request changes to any field. A supe must approve before
                changes are saved.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {FIELDS.map((field) => {
              const value = formData[field.key];
              return (
                <div
                  key={field.key}
                  className="flex items-start justify-between gap-3 py-3 border-b border-border last:border-0"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-muted-foreground">
                      {field.label}
                    </p>
                    <p className="text-sm mt-1 break-words">
                      {value || (
                        <span className="text-muted-foreground italic">
                          Not set
                        </span>
                      )}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="shrink-0 h-8 w-8 p-0"
                    onClick={() => openChangeDialog(field)}
                  >
                    <PencilSimpleIcon className="h-4 w-4" />
                  </Button>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!editField} onOpenChange={() => setEditField(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Change: {editField?.label}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-sm text-muted-foreground">
                Current Value
              </Label>
              <div className="p-3 rounded-md bg-muted text-sm">
                {formData[editField?.key || ""] || (
                  <span className="italic text-muted-foreground">Not set</span>
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Proposed Value</Label>
              {editField?.type === "textarea" ? (
                <Textarea
                  value={proposedValue}
                  onChange={(e) => setProposedValue(e.target.value)}
                  className="min-h-24"
                  placeholder="Enter new value..."
                />
              ) : (
                <Input
                  type={editField?.type || "text"}
                  value={proposedValue}
                  onChange={(e) => setProposedValue(e.target.value)}
                  className="h-11"
                  placeholder="Enter new value..."
                />
              )}
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setEditField(null)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button onClick={handleRequestChange} disabled={submitting}>
              {submitting ? "Submitting..." : "Submit Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
