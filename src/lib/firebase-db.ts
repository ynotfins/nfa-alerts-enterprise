import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  arrayUnion,
  arrayRemove,
  runTransaction,
  writeBatch,
} from "firebase/firestore";
import {
  ref,
  uploadBytes,
  uploadString,
  getDownloadURL,
} from "firebase/storage";
import { db, storage, auth } from "./firebase";

export { db, storage, auth, collection, doc, query, where, orderBy, limit, onSnapshot };

export type WithId<T> = T & { _id: string };

export async function getDocument<T>(path: string, id: string): Promise<WithId<T> | null> {
  const snap = await getDoc(doc(db, path, id));
  return snap.exists() ? { _id: snap.id, ...(snap.data() as T) } : null;
}

export async function listDocuments<T>(
  path: string,
  constraints?: Parameters<typeof query>[1][]
): Promise<WithId<T>[]> {
  const q = constraints
    ? query(collection(db, path), ...constraints)
    : collection(db, path);
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ _id: d.id, ...(d.data() as T) }));
}

export async function createDocument<T extends object>(
  path: string,
  data: T,
  id?: string
): Promise<string> {
  const ref = id ? doc(db, path, id) : doc(collection(db, path));
  await setDoc(ref, { ...data, createdAt: Date.now(), updatedAt: Date.now() });
  return ref.id;
}

export async function updateDocument(
  path: string,
  id: string,
  data: object
): Promise<void> {
  await updateDoc(doc(db, path, id), { ...data, updatedAt: Date.now() });
}

export async function deleteDocument(path: string, id: string): Promise<void> {
  await deleteDoc(doc(db, path, id));
}

export function subscribeToDocument<T>(
  path: string,
  id: string,
  cb: (data: WithId<T> | null) => void
) {
  return onSnapshot(doc(db, path, id), (snap) => {
    cb(snap.exists() ? { _id: snap.id, ...(snap.data() as T) } : null);
  });
}

export function subscribeToCollection<T>(
  path: string,
  cb: (data: WithId<T>[]) => void,
  constraints?: Parameters<typeof query>[1][]
) {
  const q = constraints
    ? query(collection(db, path), ...constraints)
    : collection(db, path);
  return onSnapshot(q, (snap) => {
    cb(snap.docs.map((d) => ({ _id: d.id, ...(d.data() as T) })));
  });
}

export function getCurrentUserId(): string | null {
  return auth.currentUser?.uid ?? null;
}

export function requireAuth(): string {
  const uid = getCurrentUserId();
  if (!uid) throw new Error("Not authenticated");
  return uid;
}

export async function uploadFile(path: string, file: File): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export async function uploadBase64(path: string, base64: string): Promise<string> {
  const storageRef = ref(storage, path);
  await uploadString(storageRef, base64, "data_url");
  return getDownloadURL(storageRef);
}

export async function incrementCounter(name: string): Promise<number> {
  const counterRef = doc(db, "counters", name);
  return runTransaction(db, async (tx) => {
    const snap = await tx.get(counterRef);
    const nextVal = (snap.exists() ? snap.data().value : 0) + 1;
    tx.set(counterRef, { name, value: nextVal }, { merge: true });
    return nextVal;
  });
}

export { arrayUnion, arrayRemove, writeBatch };
