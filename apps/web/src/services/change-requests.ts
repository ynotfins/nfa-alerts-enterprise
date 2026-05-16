import {
  collection,
  doc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ChangeRequest, WithId } from "@/lib/db";

const CHANGE_REQUESTS = "changeRequests";

export async function createChangeRequest(
  data: Omit<ChangeRequest, "status" | "createdAt">
) {
  const ref = collection(db, CHANGE_REQUESTS);
  const docRef = await addDoc(ref, {
    ...data,
    status: "pending",
    createdAt: Date.now(),
  });
  return docRef.id;
}

export async function approveChangeRequest(
  requestId: string,
  reviewerId: string
) {
  const ref = doc(db, CHANGE_REQUESTS, requestId);
  await updateDoc(ref, {
    status: "approved",
    reviewedBy: reviewerId,
    reviewedAt: Date.now(),
  });
}

export async function rejectChangeRequest(
  requestId: string,
  reviewerId: string
) {
  const ref = doc(db, CHANGE_REQUESTS, requestId);
  await updateDoc(ref, {
    status: "rejected",
    reviewedBy: reviewerId,
    reviewedAt: Date.now(),
  });
}

export async function getChangeRequest(requestId: string) {
  const ref = doc(db, CHANGE_REQUESTS, requestId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { _id: snap.id, ...snap.data() } as WithId<ChangeRequest>;
}

export async function getPendingChangeRequests(incidentId?: string) {
  const ref = collection(db, CHANGE_REQUESTS);
  const q = incidentId
    ? query(
        ref,
        where("status", "==", "pending"),
        where("incidentId", "==", incidentId),
        orderBy("createdAt", "desc")
      )
    : query(ref, where("status", "==", "pending"), orderBy("createdAt", "desc"));

  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ _id: d.id, ...d.data() }) as WithId<ChangeRequest>
  );
}

export function subscribeToPendingChangeRequests(
  callback: (requests: WithId<ChangeRequest>[]) => void,
  incidentId?: string
) {
  const ref = collection(db, CHANGE_REQUESTS);
  const q = incidentId
    ? query(
        ref,
        where("status", "==", "pending"),
        where("incidentId", "==", incidentId),
        orderBy("createdAt", "desc")
      )
    : query(ref, where("status", "==", "pending"), orderBy("createdAt", "desc"));

  return onSnapshot(q, (snap) => {
    const requests = snap.docs.map(
      (d) => ({ _id: d.id, ...d.data() }) as WithId<ChangeRequest>
    );
    callback(requests);
  });
}
