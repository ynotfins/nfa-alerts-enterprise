import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadString,
  deleteObject,
} from "firebase/storage";
import { doc, setDoc, collection } from "firebase/firestore";
import { storage, db, auth } from "@/lib/firebase";

export async function uploadProfilePhoto(file: File) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const storageRef = ref(storage, `profiles/${user.uid}/avatar.jpg`);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return { success: true, url };
}

export async function uploadProfilePhotoBase64(base64: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const storageRef = ref(storage, `profiles/${user.uid}/avatar.jpg`);
  await uploadString(storageRef, base64, "data_url");
  const url = await getDownloadURL(storageRef);

  return { success: true, url };
}

export async function uploadSignature(base64: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const storageRef = ref(storage, `profiles/${user.uid}/signature.png`);
  await uploadString(storageRef, base64, "data_url");
  const url = await getDownloadURL(storageRef);

  return { success: true, url };
}

export async function uploadIncidentDocument(
  incidentId: string,
  file: File,
  name: string
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const fileName = `${Date.now()}-${file.name}`;
  const storagePath = `incidents/${incidentId}/${user.uid}/documents/${fileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  const docRef = doc(collection(db, "incidents", incidentId, "chaserSubmissions", user.uid, "documents"));
  await setDoc(docRef, {
    name: name || file.name,
    storagePath,
    type: file.type,
    size: file.size,
    uploaderId: user.uid,
    createdAt: Date.now(),
  });

  return { success: true, id: docRef.id, url };
}

export async function uploadIncidentSignature(
  incidentId: string,
  base64: string,
  type: "homeowner" | "employee"
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const fileName = `${type}-${Date.now()}.png`;
  const storagePath = `incidents/${incidentId}/signatures/${fileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadString(storageRef, base64, "data_url");
  const url = await getDownloadURL(storageRef);

  const sigRef = doc(collection(db, "incidents", incidentId, "signatures"));
  await setDoc(sigRef, {
    type,
    storagePath,
    signerId: user.uid,
    createdAt: Date.now(),
  });

  return { success: true, id: sigRef.id, url };
}

export async function uploadVoiceMessage(
  threadId: string,
  blob: Blob,
  duration: number
) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const fileName = `${Date.now()}.webm`;
  const storagePath = `voice/${threadId}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, blob);
  const url = await getDownloadURL(storageRef);

  return { success: true, storagePath, url, duration };
}

export async function uploadAttachment(threadId: string, file: File) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const fileName = `${Date.now()}-${file.name}`;
  const storagePath = `attachments/${threadId}/${fileName}`;
  const storageRef = ref(storage, storagePath);

  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  return {
    success: true,
    storagePath,
    url,
    name: file.name,
    type: file.type,
    size: file.size,
  };
}

export async function getFileUrl(storagePath: string) {
  const storageRef = ref(storage, storagePath);
  return getDownloadURL(storageRef);
}

export async function deleteFile(storagePath: string) {
  const storageRef = ref(storage, storagePath);
  await deleteObject(storageRef);
  return { success: true };
}
