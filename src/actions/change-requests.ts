"use server";

import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import {
  isPrivilegedRole,
  verifyFirebaseBearerToken,
} from "@/lib/server-auth";
import { sendNotificationToSupes, sendAppNotification } from "./notifications";

interface CreateChangeRequestParams {
  incidentId: string;
  field: string;
  fieldLabel: string;
  currentValue: string;
  proposedValue: string;
  authToken: string;
}

const changeRequestFieldMap: Record<
  string,
  (value: string) => Record<string, unknown>
> = {
  name: (value) => ({ "homeowner.name": value }),
  contact: (value) => ({ "homeowner.contact": value }),
  phone: (value) => ({ "homeowner.phone": value }),
  email: (value) => ({ "homeowner.email": value }),
  address: (value) => ({ "homeowner.address": value }),
  policyNumber: (value) => ({ "homeowner.insurance.policyNumber": value }),
  carrier: (value) => ({ "homeowner.insurance.carrier": value }),
  claimsPhone: (value) => ({ "homeowner.insurance.claimsPhone": value }),
  description: (value) => ({ "homeowner.description": value }),
  adjusterName: (value) => ({ "homeowner.adjuster.name": value }),
  adjusterPhone: (value) => ({ "homeowner.adjuster.phone": value }),
  notes: (value) => ({ "homeowner.notes": value }),
};

const createChangeRequestSchema = z.object({
  incidentId: z.string().min(1),
  field: z.enum([
    "name",
    "contact",
    "phone",
    "email",
    "address",
    "policyNumber",
    "carrier",
    "claimsPhone",
    "description",
    "adjusterName",
    "adjusterPhone",
    "notes",
  ]),
  fieldLabel: z.string().min(1).max(80),
  currentValue: z.string().max(5000),
  proposedValue: z.string().min(1).max(5000),
  authToken: z.string().min(1),
});

function getProfileName(profile: { name?: string; email?: string }) {
  return profile.name || profile.email || "Unknown";
}

async function requireActionUser(authToken: string) {
  return verifyFirebaseBearerToken(`Bearer ${authToken}`);
}

async function requirePrivilegedActionUser(authToken: string) {
  const profile = await requireActionUser(authToken);
  if (!isPrivilegedRole(profile.role)) {
    throw new Error("Forbidden");
  }

  return profile;
}

export async function createChangeRequestAction(
  params: CreateChangeRequestParams,
) {
  if (!adminDb) {
    throw new Error("Database not initialized");
  }

  const { incidentId, field, fieldLabel, currentValue, proposedValue, authToken } =
    createChangeRequestSchema.parse(params);
  const requester = await requireActionUser(authToken);
  const requesterName = getProfileName(requester);

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

  const incidentSnap = await adminDb
    .collection("incidents")
    .doc(incidentId)
    .get();
  const incident = incidentSnap.data();
  const displayId = incident?.displayId || incidentId;

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
  const reviewer = await requirePrivilegedActionUser(authToken);
  const reviewerName = getProfileName(reviewer);

  const requestRef = adminDb.collection("changeRequests").doc(requestId);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new Error("Change request not found");
  }

  const request = requestSnap.data()!;
  if (request.status !== "pending") {
    throw new Error("Change request already reviewed");
  }

  await requestRef.update({
    status: "approved",
    reviewedBy: reviewer._id,
    reviewedAt: Date.now(),
  });

  const incidentRef = adminDb.collection("incidents").doc(request.incidentId);
  const incidentSnap = await incidentRef.get();
  const incident = incidentSnap.data();

  if (incident) {
    const updateFn = changeRequestFieldMap[request.field];
    if (updateFn) {
      await incidentRef.update({
        ...updateFn(request.proposedValue),
        updatedAt: Date.now(),
      });
    }
  }

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
  const reviewer = await requirePrivilegedActionUser(authToken);
  const reviewerName = getProfileName(reviewer);

  const requestRef = adminDb.collection("changeRequests").doc(requestId);
  const requestSnap = await requestRef.get();

  if (!requestSnap.exists) {
    throw new Error("Change request not found");
  }

  const request = requestSnap.data()!;
  if (request.status !== "pending") {
    throw new Error("Change request already reviewed");
  }

  await requestRef.update({
    status: "rejected",
    reviewedBy: reviewer._id,
    reviewedAt: Date.now(),
  });

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
