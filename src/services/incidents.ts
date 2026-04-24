import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  collectionGroup,
  query,
  where,
  getDocs,
  onSnapshot,
  orderBy,
  limit,
  arrayUnion,
  arrayRemove,
  runTransaction,
  increment,
} from "firebase/firestore";
import { db, auth } from "@/lib/firebase";
import {
  Incident,
  Note,
  Document,
  IncidentActivity,
  UserIncident,
} from "@/lib/db";

const INCIDENTS = "incidents";
const USER_INCIDENTS = "userIncidents";
const COUNTERS = "counters";
const DEFAULT_QUERY_LIMIT = 50;

export async function getIncident(id: string) {
  const ref = doc(db, INCIDENTS, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { _id: snap.id, ...snap.data() } as Incident & { _id: string };
}

export async function listIncidents(options?: {
  status?: "active" | "closed";
  limit?: number;
}) {
  let q = query(collection(db, INCIDENTS), orderBy("createdAt", "desc"));

  if (options?.status) {
    q = query(q, where("status", "==", options.status));
  }

  q = query(q, limit(options?.limit || DEFAULT_QUERY_LIMIT));

  const snap = await getDocs(q);
  return snap.docs.map(
    (d) => ({ _id: d.id, ...d.data() }) as Incident & { _id: string },
  );
}

export async function createIncident(
  data: Omit<Incident, "createdAt" | "updatedAt" | "displayId">,
) {
  try {
    const counterRef = doc(db, COUNTERS, "incidents");

    const displayId = await runTransaction(db, async (tx) => {
      const counterSnap = await tx.get(counterRef);
      let nextVal = 1;
      if (counterSnap.exists()) {
        nextVal = (counterSnap.data().value || 0) + 1;
      }
      tx.set(
        counterRef,
        { name: "incidents", value: nextVal },
        { merge: true },
      );
      return `INC-${String(nextVal).padStart(6, "0")}`;
    });

    const incidentRef = doc(collection(db, INCIDENTS));
    const now = Date.now();
    await setDoc(incidentRef, {
      ...data,
      displayId,
      status: "active",
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, id: incidentRef.id, displayId };
  } catch (error) {
    console.error("Failed to create incident:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function respondToIncident(incidentId: string, note?: string) {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("Not authenticated");

    const ref = doc(db, INCIDENTS, incidentId);
    await updateDoc(ref, {
      responderIds: arrayUnion(user.uid),
      responderCount: increment(1),
      respondedAt: Date.now(),
      updatedAt: Date.now(),
    });

    if (note) {
      await addNote(incidentId, note);
    }

    await addIncidentActivity(incidentId, {
      type: "custom",
      description: "Responded to incident",
      profileId: user.uid,
    });

    return { success: true };
  } catch (error) {
    console.error("Failed to respond to incident:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function addNote(incidentId: string, text: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(collection(db, INCIDENTS, incidentId, "notes"));
  await setDoc(ref, {
    text,
    authorId: user.uid,
    createdAt: Date.now(),
  });
  return { success: true, id: ref.id };
}

export async function getNotes(incidentId: string) {
  const snap = await getDocs(
    query(
      collection(db, INCIDENTS, incidentId, "notes"),
      orderBy("createdAt", "desc"),
    ),
  );
  return snap.docs.map(
    (d) => ({ _id: d.id, ...d.data() }) as Note & { _id: string },
  );
}

export async function updateHomeowner(
  incidentId: string,
  homeowner: Incident["homeowner"],
) {
  const ref = doc(db, INCIDENTS, incidentId);
  await updateDoc(ref, {
    homeowner,
    updatedAt: Date.now(),
  });
  return { success: true };
}

export async function awardSecured(incidentId: string, chaserId: string) {
  const ref = doc(db, INCIDENTS, incidentId);
  await updateDoc(ref, {
    securedById: chaserId,
    securedAt: Date.now(),
    updatedAt: Date.now(),
  });

  await addIncidentActivity(incidentId, {
    type: "custom",
    description: "Job assigned",
    profileId: auth.currentUser?.uid,
  });

  return { success: true };
}

export async function removeSecured(incidentId: string) {
  const ref = doc(db, INCIDENTS, incidentId);
  await updateDoc(ref, {
    securedById: null,
    securedAt: null,
    updatedAt: Date.now(),
  });
  return { success: true };
}

export async function closeIncident(incidentId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, INCIDENTS, incidentId);
  await updateDoc(ref, {
    status: "closed",
    closedAt: Date.now(),
    closedById: user.uid,
    updatedAt: Date.now(),
  });

  await addIncidentActivity(incidentId, {
    type: "custom",
    description: "Incident closed",
    profileId: user.uid,
  });

  return { success: true };
}

export async function reopenIncident(incidentId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const ref = doc(db, INCIDENTS, incidentId);
  await updateDoc(ref, {
    status: "active",
    closedAt: null,
    closedById: null,
    updatedAt: Date.now(),
  });

  await addIncidentActivity(incidentId, {
    type: "custom",
    description: "Incident reopened",
    profileId: user.uid,
  });

  return { success: true };
}

export async function removeResponder(incidentId: string, responderId: string) {
  const ref = doc(db, INCIDENTS, incidentId);
  await updateDoc(ref, {
    responderIds: arrayRemove(responderId),
    updatedAt: Date.now(),
  });

  await addIncidentActivity(incidentId, {
    type: "custom",
    description: "Responder removed",
    profileId: auth.currentUser?.uid,
  });

  return { success: true };
}

async function getUserIncidentDoc(
  profileId: string,
  incidentId: string,
  action: UserIncident["odm_action"],
) {
  const q = query(
    collection(db, USER_INCIDENTS),
    where("odm_profileId", "==", profileId),
    where("odm_incidentId", "==", incidentId),
    where("odm_action", "==", action),
  );
  const snap = await getDocs(q);
  return snap.docs[0] || null;
}

export async function toggleFavorite(incidentId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const existing = await getUserIncidentDoc(user.uid, incidentId, "favorite");
  if (existing) {
    await deleteDoc(existing.ref);
    return { success: true, favorited: false };
  }

  const ref = doc(collection(db, USER_INCIDENTS));
  await setDoc(ref, {
    odm_profileId: user.uid,
    odm_incidentId: incidentId,
    odm_action: "favorite",
    createdAt: Date.now(),
  });
  return { success: true, favorited: true };
}

export async function toggleBookmark(incidentId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const existing = await getUserIncidentDoc(user.uid, incidentId, "bookmark");
  if (existing) {
    await deleteDoc(existing.ref);
    return { success: true, bookmarked: false };
  }

  const ref = doc(collection(db, USER_INCIDENTS));
  await setDoc(ref, {
    odm_profileId: user.uid,
    odm_incidentId: incidentId,
    odm_action: "bookmark",
    createdAt: Date.now(),
  });
  return { success: true, bookmarked: true };
}

export async function toggleHide(incidentId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const existing = await getUserIncidentDoc(user.uid, incidentId, "hide");
  if (existing) {
    await deleteDoc(existing.ref);
    return { success: true, hidden: false };
  }

  const ref = doc(collection(db, USER_INCIDENTS));
  await setDoc(ref, {
    odm_profileId: user.uid,
    odm_incidentId: incidentId,
    odm_action: "hide",
    createdAt: Date.now(),
  });
  return { success: true, hidden: true };
}

export async function toggleMute(incidentId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const existing = await getUserIncidentDoc(user.uid, incidentId, "mute");
  if (existing) {
    await deleteDoc(existing.ref);
    return { success: true, muted: false };
  }

  const ref = doc(collection(db, USER_INCIDENTS));
  await setDoc(ref, {
    odm_profileId: user.uid,
    odm_incidentId: incidentId,
    odm_action: "mute",
    createdAt: Date.now(),
  });
  return { success: true, muted: true };
}

export async function markViewed(incidentId: string) {
  const user = auth.currentUser;
  if (!user) throw new Error("Not authenticated");

  const existing = await getUserIncidentDoc(user.uid, incidentId, "view");
  if (existing) return { success: true };

  const ref = doc(collection(db, USER_INCIDENTS));
  await setDoc(ref, {
    odm_profileId: user.uid,
    odm_incidentId: incidentId,
    odm_action: "view",
    createdAt: Date.now(),
  });
  return { success: true };
}

export async function getUserIncidentFlags(incidentId: string) {
  const user = auth.currentUser;
  if (!user)
    return {
      favorited: false,
      bookmarked: false,
      hidden: false,
      muted: false,
      viewed: false,
    };

  const q = query(
    collection(db, USER_INCIDENTS),
    where("odm_profileId", "==", user.uid),
    where("odm_incidentId", "==", incidentId),
  );
  const snap = await getDocs(q);

  const flags = {
    favorited: false,
    bookmarked: false,
    hidden: false,
    muted: false,
    viewed: false,
  };

  snap.docs.forEach((d) => {
    const data = d.data() as UserIncident;
    if (data.odm_action === "favorite") flags.favorited = true;
    if (data.odm_action === "bookmark") flags.bookmarked = true;
    if (data.odm_action === "hide") flags.hidden = true;
    if (data.odm_action === "mute") flags.muted = true;
    if (data.odm_action === "view") flags.viewed = true;
  });

  return flags;
}

export type IncidentFlags = {
  favorited: boolean;
  bookmarked: boolean;
  hidden: boolean;
  muted: boolean;
  viewed: boolean;
};

export async function getAllUserIncidentFlags(): Promise<
  Map<string, IncidentFlags>
> {
  const user = auth.currentUser;
  const flagsMap = new Map<string, IncidentFlags>();

  if (!user) return flagsMap;

  const q = query(
    collection(db, USER_INCIDENTS),
    where("odm_profileId", "==", user.uid),
  );
  const snap = await getDocs(q);

  snap.docs.forEach((d) => {
    const data = d.data() as UserIncident;
    const incidentId = data.odm_incidentId;

    if (!flagsMap.has(incidentId)) {
      flagsMap.set(incidentId, {
        favorited: false,
        bookmarked: false,
        hidden: false,
        muted: false,
        viewed: false,
      });
    }

    const flags = flagsMap.get(incidentId)!;
    if (data.odm_action === "favorite") flags.favorited = true;
    if (data.odm_action === "bookmark") flags.bookmarked = true;
    if (data.odm_action === "hide") flags.hidden = true;
    if (data.odm_action === "mute") flags.muted = true;
    if (data.odm_action === "view") flags.viewed = true;
  });

  return flagsMap;
}

export async function getFavorites() {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, USER_INCIDENTS),
    where("odm_profileId", "==", user.uid),
    where("odm_action", "==", "favorite"),
  );
  const snap = await getDocs(q);

  const incidentIds = snap.docs.map(
    (d) => (d.data() as UserIncident).odm_incidentId,
  );
  if (incidentIds.length === 0) return [];

  const incidents = await Promise.all(incidentIds.map(getIncident));
  return incidents.filter(Boolean) as (Incident & { _id: string })[];
}

export async function getBookmarks() {
  const user = auth.currentUser;
  if (!user) return [];

  const q = query(
    collection(db, USER_INCIDENTS),
    where("odm_profileId", "==", user.uid),
    where("odm_action", "==", "bookmark"),
  );
  const snap = await getDocs(q);

  const incidentIds = snap.docs.map(
    (d) => (d.data() as UserIncident).odm_incidentId,
  );
  if (incidentIds.length === 0) return [];

  const incidents = await Promise.all(incidentIds.map(getIncident));
  return incidents.filter(Boolean) as (Incident & { _id: string })[];
}

export async function getIncidentsWithNotes() {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const notesQuery = query(
      collectionGroup(db, "notes"),
      where("authorId", "==", user.uid),
    );
    const notesSnap = await getDocs(notesQuery);

    const incidentIds = new Set<string>();
    notesSnap.docs.forEach((noteDoc) => {
      const pathSegments = noteDoc.ref.path.split("/");
      const incidentIdIndex = pathSegments.indexOf("incidents") + 1;
      if (incidentIdIndex > 0 && incidentIdIndex < pathSegments.length) {
        incidentIds.add(pathSegments[incidentIdIndex]);
      }
    });

    if (incidentIds.size === 0) return [];

    const incidents = await Promise.all(
      Array.from(incidentIds).map(getIncident),
    );
    return incidents.filter(Boolean) as (Incident & { _id: string })[];
  } catch (error) {
    console.error("Failed to get incidents with notes:", error);
    return [];
  }
}

export async function addIncidentActivity(
  incidentId: string,
  activity: Omit<IncidentActivity, "createdAt">,
) {
  const ref = doc(collection(db, INCIDENTS, incidentId, "activities"));
  await setDoc(ref, {
    ...activity,
    createdAt: Date.now(),
  });

  const incidentRef = doc(db, INCIDENTS, incidentId);
  await updateDoc(incidentRef, {
    activityCount: increment(1),
  });

  return { success: true, id: ref.id };
}

export async function getIncidentActivities(incidentId: string) {
  const snap = await getDocs(
    query(
      collection(db, INCIDENTS, incidentId, "activities"),
      orderBy("createdAt", "desc"),
    ),
  );
  return snap.docs.map(
    (d) => ({ _id: d.id, ...d.data() }) as IncidentActivity & { _id: string },
  );
}

export function subscribeToIncidents(
  callback: (incidents: (Incident & { _id: string })[]) => void,
) {
  const q = query(
    collection(db, INCIDENTS),
    orderBy("createdAt", "desc"),
    limit(DEFAULT_QUERY_LIMIT),
  );
  return onSnapshot(q, (snap) => {
    callback(
      snap.docs.map(
        (d) => ({ _id: d.id, ...d.data() }) as Incident & { _id: string },
      ),
    );
  });
}

export function subscribeToIncident(
  id: string,
  callback: (incident: (Incident & { _id: string }) | null) => void,
) {
  const ref = doc(db, INCIDENTS, id);
  return onSnapshot(ref, (snap) => {
    if (snap.exists()) {
      callback({ _id: snap.id, ...snap.data() } as Incident & { _id: string });
    } else {
      callback(null);
    }
  });
}

export async function getDocuments(incidentId: string, chaserId?: string) {
  const userId = chaserId || auth.currentUser?.uid;
  if (!userId) return [];

  const snap = await getDocs(
    query(
      collection(
        db,
        INCIDENTS,
        incidentId,
        "chaserSubmissions",
        userId,
        "documents",
      ),
      orderBy("createdAt", "desc"),
    ),
  );
  return snap.docs.map(
    (d) => ({ _id: d.id, ...d.data() }) as Document & { _id: string },
  );
}

export async function getAllChaserDocuments(
  incidentId: string,
  responderIds: string[],
) {
  const promises = responderIds.map(async (chaserId) => {
    const docs = await getDocuments(incidentId, chaserId);
    return { chaserId, documents: docs };
  });

  const results = await Promise.all(promises);
  return results.filter((r) => r.documents.length > 0);
}

export async function getSignedDocuments(
  incidentId: string,
  chaserId?: string,
) {
  const userId = chaserId || auth.currentUser?.uid;
  if (!userId) return { signedDocs: {} };

  const snap = await getDocs(
    collection(
      db,
      INCIDENTS,
      incidentId,
      "chaserSubmissions",
      userId,
      "signedDocuments",
    ),
  );
  const signedDocs: Record<
    string,
    { homeownerSignature: string; chaserSignature: string; signedAt: number }
  > = {};
  snap.docs.forEach((d) => {
    const data = d.data();
    signedDocs[data.documentId] = {
      homeownerSignature: data.homeownerSignature,
      chaserSignature: data.chaserSignature,
      signedAt: data.signedAt,
    };
  });
  return { signedDocs };
}

export async function getAllChaserSignedDocuments(
  incidentId: string,
  responderIds: string[],
) {
  const promises = responderIds.map(async (chaserId) => {
    const { signedDocs } = await getSignedDocuments(incidentId, chaserId);
    return { chaserId, signedDocs };
  });

  const results = await Promise.all(promises);
  return results.filter((r) => Object.keys(r.signedDocs).length > 0);
}

export async function saveSignedDocument(
  incidentId: string,
  documentId: string,
  documentTitle: string,
  homeownerSignature: string,
  chaserSignature: string,
) {
  const userId = auth.currentUser?.uid;
  if (!userId) throw new Error("Not authenticated");

  const ref = doc(
    collection(
      db,
      INCIDENTS,
      incidentId,
      "chaserSubmissions",
      userId,
      "signedDocuments",
    ),
  );
  await setDoc(ref, {
    documentId,
    documentTitle,
    homeownerSignature,
    chaserSignature,
    signedAt: Date.now(),
    signerId: userId,
  });

  await addIncidentActivity(incidentId, {
    type: "signature",
    description: `Collected signature for ${documentTitle}`,
    profileId: userId,
  });

  return { success: true };
}

export async function getSignedDocument(
  incidentId: string,
  documentId: string,
  chaserId?: string,
) {
  const userId = chaserId || auth.currentUser?.uid;
  if (!userId) return null;

  const snap = await getDocs(
    query(
      collection(
        db,
        INCIDENTS,
        incidentId,
        "chaserSubmissions",
        userId,
        "signedDocuments",
      ),
      where("documentId", "==", documentId),
    ),
  );
  if (snap.empty) return null;
  const data = snap.docs[0].data();
  return {
    _id: snap.docs[0].id,
    documentId: data.documentId,
    documentTitle: data.documentTitle,
    homeownerSignature: data.homeownerSignature,
    chaserSignature: data.chaserSignature,
    signedAt: data.signedAt,
    signerId: data.signerId,
  };
}

export async function getResponderProfiles(responderIds: string[]) {
  if (!responderIds.length) return [];

  const profiles: Array<{
    _id: string;
    name?: string;
    avatarUrl?: string;
    email?: string;
    phone?: string;
  }> = [];

  const chunks = [];
  for (let i = 0; i < responderIds.length; i += 30) {
    chunks.push(responderIds.slice(i, i + 30));
  }

  for (const chunk of chunks) {
    const q = query(collection(db, "profiles"), where("__name__", "in", chunk));
    const snap = await getDocs(q);
    snap.docs.forEach((doc) => {
      const data = doc.data();
      profiles.push({
        _id: doc.id,
        name: data.name,
        avatarUrl: data.avatarUrl,
        email: data.email,
        phone: data.phone,
      });
    });
  }

  return profiles;
}

export async function getRespondedIncidents() {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(db, INCIDENTS),
      where("responderIds", "array-contains", user.uid),
      where("status", "==", "active"),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map(
      (d) => ({ _id: d.id, ...d.data() }) as Incident & { _id: string },
    );
  } catch (error) {
    console.error("Failed to get responded incidents:", error);
    const q = query(
      collection(db, INCIDENTS),
      where("responderIds", "array-contains", user.uid),
    );
    const snap = await getDocs(q);
    const active = snap.docs
      .map((d) => ({ _id: d.id, ...d.data() }) as Incident & { _id: string })
      .filter((i) => i.status === "active")
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    return active;
  }
}
