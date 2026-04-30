"use server";

import { adminDb } from "@/lib/firebase-admin";
import { getAuthenticatedProfile, requireSupe } from "@/lib/server-auth";
import { sendNotificationToSupes, sendAppNotification } from "./notifications";

const HOMEOWNER_FIELD_UPDATES: Record<
  string,
  (value: string) => Record<string, unknown>
> = {
  name: (v) => ({ "homeowner.name": v }),
  contact: (v) => ({ "homeowner.contact": v }),
  phone: (v) => ({ "homeowner.phone": v }),
  email: (v) => ({ "homeowner.email": v }),
  address: (v) => ({ "homeowner.address": v }),
  policyNumber: (v) => ({ "homeowner.insurance.policyNumber": v }),
  carrier: (v) => ({ "homeowner.insurance.carrier": v }),
  claimsPhone: (v) => ({ "homeowner.insurance.claimsPhone": v }),
  description: (v) => ({ "homeowner.description": v }),
  adjusterName: (v) => ({ "homeowner.adjuster.name": v }),
  adjusterPhone: (v) => ({ "homeowner.adjuster.phone": v }),
  notes: (v) => ({ "homeowner.notes": v }),
};

interface CreateChangeRequestParams {
  authToken: string;
  incidentId: string;
  field: string;
  fieldLabel: string;
  currentValue: string;
  proposedValue: string;
}

export async function createChangeRequestAction(
  params: CreateChangeRequestParams,
) {
  if (!adminDb) {
    throw new Error("Database not initialized");
  }

  const {
    authToken,
    incidentId,
    field,
    fieldLabel,
    currentValue,
    proposedValue,
  } = params;
  const requester = await getAuthenticatedProfile(authToken);
  const requesterName =
    requester.name || requester.email || requester.firstName || "Unknown";

  // Create the change request
  const ref = adminDb.collection("changeRequests").doc();
  await ref.set({
    incidentId,
    requesterId: requester._id,
    requesterName,
    field,
    fieldLabel,
    currentValue,
    proposedValue,
    status: "pending",
    createdAt: Date.now(),
  });

  // Get incident display ID for notification
  const incidentSnap = await adminDb
    .collection("incidents")
    .doc(incidentId)
    .get();
  const incident = incidentSnap.data();
  const displayId = incident?.displayId || incidentId;

  // Notify all supes
  await sendNotificationToSupes({
    type: "change_request",
    title: "Change Request",
    body: `${requesterName} requested to change ${fieldLabel} on incident #${displayId}`,
    url: `/incidents/${incidentId}/homeowner?review=${ref.id}`,
    metadata: {
      changeRequestId: ref.id,
      incidentId,
      field,
    },
  });

  return { success: true, id: ref.id };
}

export async function approveChangeRequestAction(
  requestId: string,
  authToken: string,
) {
  if (!adminDb) {
    throw new Error("Database not initialized");
  }

  const reviewer = await getAuthenticatedProfile(authToken);
  requireSupe(reviewer);
  const reviewerName =
    reviewer.name || reviewer.email || reviewer.firstName || "Supe";

  // Get the change request
  const requestRef = adminDb.collection("changeRequests").doc(requestId);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new Error("Change request not found");
  }

  const request = requestSnap.data()!;

  // Update the change request status
  await requestRef.update({
    status: "approved",
    reviewedBy: reviewer._id,
    reviewedAt: Date.now(),
  });

  // Apply the change to the incident
  const incidentRef = adminDb.collection("incidents").doc(request.incidentId);
  const incidentSnap = await incidentRef.get();
  const incident = incidentSnap.data();

  if (incident) {
    const updateFn = HOMEOWNER_FIELD_UPDATES[request.field];
    if (updateFn) {
      await incidentRef.update({
        ...updateFn(request.proposedValue),
        updatedAt: Date.now(),
      });
    }
  }

  // Notify the requester
  await sendAppNotification({
    profileId: request.requesterId,
    type: "change_request_approved",
    title: "Change Approved",
    body: `Your request to change ${request.fieldLabel} was approved by ${reviewerName}`,
    url: `/incidents/${request.incidentId}/homeowner`,
    metadata: {
      changeRequestId: requestId,
      incidentId: request.incidentId,
    },
  });

  return { success: true };
}

export async function rejectChangeRequestAction(
  requestId: string,
  authToken: string,
) {
  if (!adminDb) {
    throw new Error("Database not initialized");
  }

  const reviewer = await getAuthenticatedProfile(authToken);
  requireSupe(reviewer);
  const reviewerName =
    reviewer.name || reviewer.email || reviewer.firstName || "Supe";

  // Get the change request
  const requestRef = adminDb.collection("changeRequests").doc(requestId);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new Error("Change request not found");
  }

  const request = requestSnap.data()!;

  // Update the change request status
  await requestRef.update({
    status: "rejected",
    reviewedBy: reviewer._id,
    reviewedAt: Date.now(),
  });

  // Notify the requester
  await sendAppNotification({
    profileId: request.requesterId,
    type: "change_request_rejected",
    title: "Change Rejected",
    body: `Your request to change ${request.fieldLabel} was rejected by ${reviewerName}`,
    url: `/incidents/${request.incidentId}/homeowner`,
    metadata: {
      changeRequestId: requestId,
      incidentId: request.incidentId,
    },
  });

  return { success: true };
}
