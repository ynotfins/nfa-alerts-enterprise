"use server";

import { z } from "zod";
import { adminDb } from "@/lib/firebase-admin";
import {
  type AuthenticatedProfile,
  isPrivilegedRole,
  verifyFirebaseBearerToken,
} from "@/lib/server-auth";
import { sendNotificationToSupes, sendAppNotification } from "./notifications";

export const changeRequestFields = [
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
] as const;

export type ChangeRequestField = (typeof changeRequestFields)[number];

const changeRequestFieldMap: Record<
  ChangeRequestField,
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
  field: z.enum(changeRequestFields),
  fieldLabel: z.string().min(1).max(80),
  currentValue: z.string().max(5000),
  proposedValue: z.string().min(1).max(5000),
  authToken: z.string().min(1),
});

type CreateChangeRequestParams = z.input<typeof createChangeRequestSchema>;
type ProfileNameFields = Pick<AuthenticatedProfile, "name" | "email">;
type ReviewableChangeRequest = {
  incidentId: string;
  requesterId: string;
  field: ChangeRequestField;
  fieldLabel: string;
  proposedValue: string;
  status?: string;
};

function getProfileName(profile: ProfileNameFields) {
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
  const db = adminDb;
  const reviewer = await requirePrivilegedActionUser(authToken);
  const reviewerName = getProfileName(reviewer);

  const requestRef = db.collection("changeRequests").doc(requestId);
  const reviewedAt = Date.now();
  const request = await db.runTransaction(async (tx) => {
    const requestSnap = await tx.get(requestRef);

    if (!requestSnap.exists) {
      throw new Error("Change request not found");
    }

    const currentRequest = requestSnap.data() as ReviewableChangeRequest;
    if (currentRequest.status !== "pending") {
      throw new Error("Change request already reviewed");
    }

    const incidentRef = db
      .collection("incidents")
      .doc(currentRequest.incidentId);
    const incidentSnap = await tx.get(incidentRef);
    const updateFn = changeRequestFieldMap[currentRequest.field];

    tx.update(requestRef, {
      status: "approved",
      reviewedBy: reviewer._id,
      reviewedAt,
    });

    if (incidentSnap.exists && updateFn) {
      tx.update(incidentRef, {
        ...updateFn(currentRequest.proposedValue),
        updatedAt: reviewedAt,
      });
    }

    return currentRequest;
  });

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
  const db = adminDb;
  const reviewer = await requirePrivilegedActionUser(authToken);
  const reviewerName = getProfileName(reviewer);

  const requestRef = db.collection("changeRequests").doc(requestId);
  const reviewedAt = Date.now();
  const request = await db.runTransaction(async (tx) => {
    const requestSnap = await tx.get(requestRef);

    if (!requestSnap.exists) {
      throw new Error("Change request not found");
    }

    const currentRequest = requestSnap.data() as ReviewableChangeRequest;
    if (currentRequest.status !== "pending") {
      throw new Error("Change request already reviewed");
    }

    tx.update(requestRef, {
      status: "rejected",
      reviewedBy: reviewer._id,
      reviewedAt,
    });

    return currentRequest;
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
