"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Incident, Profile } from "@/lib/db";
import {
  listIncidents,
  getIncident,
  subscribeToIncidents,
  subscribeToIncident,
  getUserIncidentFlags,
  respondToIncident as respondToIncidentService,
  addNote as addNoteService,
  toggleFavorite as toggleFavoriteService,
  toggleBookmark as toggleBookmarkService,
  toggleHide as toggleHideService,
  toggleMute as toggleMuteService,
  markViewed as markViewedService,
  updateHomeowner as updateHomeownerService,
  awardSecured as awardSecuredService,
  removeSecured as removeSecuredService,
  closeIncident as closeIncidentService,
  reopenIncident as reopenIncidentService,
  removeResponder as removeResponderService,
  getResponderProfiles,
  getNotes,
  getIncidentActivities,
  getDocuments,
  getSignedDocuments,
  saveSignedDocument as saveSignedDocumentService,
  getSignedDocument,
  getAllChaserDocuments,
  getAllChaserSignedDocuments,
} from "@/services/incidents";

type IncidentWithId = Incident & { _id: string };

export function useIncidents() {
  const [incidents, setIncidents] = useState<IncidentWithId[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToIncidents((data) => {
      setIncidents(data);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { incidents, loading };
}

export function useIncident(id: string | undefined) {
  const [incident, setIncident] = useState<IncidentWithId | null>(null);
  const [fetchedId, setFetchedId] = useState<string | null>(null);
  const [flags, setFlags] = useState({
    favorited: false,
    bookmarked: false,
    hidden: false,
    muted: false,
    viewed: false,
  });

  useEffect(() => {
    if (!id) {
      return;
    }

    const unsubscribe = subscribeToIncident(id, (data) => {
      setIncident(data);
      setFetchedId(id);
    });

    getUserIncidentFlags(id).then(setFlags);

    return () => unsubscribe();
  }, [id]);

  // Derive loading: we're loading if we have an id but haven't fetched it yet
  const loading = id ? fetchedId !== id : false;

  const respondToIncident = useCallback(
    async (note?: string) => {
      if (!id) return;
      await respondToIncidentService(id, note);
    },
    [id]
  );

  const addNote = useCallback(
    async (text: string) => {
      if (!id) return;
      await addNoteService(id, text);
    },
    [id]
  );

  const toggleFavorite = useCallback(async () => {
    if (!id) return;
    const result = await toggleFavoriteService(id);
    setFlags((f) => ({ ...f, favorited: result.favorited ?? !f.favorited }));
  }, [id]);

  const toggleBookmark = useCallback(async () => {
    if (!id) return;
    const result = await toggleBookmarkService(id);
    setFlags((f) => ({ ...f, bookmarked: result.bookmarked ?? !f.bookmarked }));
  }, [id]);

  const toggleHide = useCallback(async () => {
    if (!id) return;
    const result = await toggleHideService(id);
    setFlags((f) => ({ ...f, hidden: result.hidden ?? !f.hidden }));
  }, [id]);

  const toggleMute = useCallback(async () => {
    if (!id) return;
    const result = await toggleMuteService(id);
    setFlags((f) => ({ ...f, muted: result.muted ?? !f.muted }));
  }, [id]);

  const markViewed = useCallback(async () => {
    if (!id) return;
    await markViewedService(id);
    setFlags((f) => ({ ...f, viewed: true }));
  }, [id]);

  const updateHomeowner = useCallback(
    async (homeowner: Incident["homeowner"]) => {
      if (!id) return;
      await updateHomeownerService(id, homeowner);
    },
    [id]
  );

  const awardSecured = useCallback(
    async (chaserId: string) => {
      if (!id) return;
      await awardSecuredService(id, chaserId);
    },
    [id]
  );

  const removeSecured = useCallback(async () => {
    if (!id) return;
    await removeSecuredService(id);
  }, [id]);

  const closeIncident = useCallback(async () => {
    if (!id) return;
    await closeIncidentService(id);
  }, [id]);

  const reopenIncident = useCallback(async () => {
    if (!id) return;
    await reopenIncidentService(id);
  }, [id]);

  const removeResponder = useCallback(
    async (responderId: string) => {
      if (!id) return;
      await removeResponderService(id, responderId);
    },
    [id]
  );

  return {
    incident,
    loading,
    flags,
    respondToIncident,
    addNote,
    toggleFavorite,
    toggleBookmark,
    toggleHide,
    toggleMute,
    markViewed,
    updateHomeowner,
    awardSecured,
    removeSecured,
    closeIncident,
    reopenIncident,
    removeResponder,
  };
}

export function useIncidentNotes(incidentId: string | undefined) {
  const [notes, setNotes] = useState<
    Array<{ _id: string; text: string; authorId: string; createdAt: number }>
  >([]);
  const [fetchedId, setFetchedId] = useState<string | null>(null);

  useEffect(() => {
    if (!incidentId) {
      return;
    }

    getNotes(incidentId)
      .then((data) => {
        setNotes(data);
        setFetchedId(incidentId);
      })
      .catch((error) => {
        console.error("Failed to load incident notes:", error);
        setNotes([]);
        setFetchedId(incidentId);
      });
  }, [incidentId]);

  const refresh = useCallback(async () => {
    if (!incidentId) return;
    const data = await getNotes(incidentId);
    setNotes(data);
  }, [incidentId]);

  // Derive loading: we're loading if we have an id but haven't fetched it yet
  const loading = incidentId ? fetchedId !== incidentId : false;

  return { notes, loading, refresh };
}

export function useIncidentActivities(incidentId: string | undefined) {
  const [activities, setActivities] = useState<
    Array<{
      _id: string;
      type: string;
      description: string;
      profileId?: string;
      createdAt: number;
    }>
  >([]);
  const [fetchedId, setFetchedId] = useState<string | null>(null);

  useEffect(() => {
    if (!incidentId) {
      return;
    }

    getIncidentActivities(incidentId)
      .then((data) => {
        setActivities(data);
        setFetchedId(incidentId);
      })
      .catch((error) => {
        console.error("Failed to load incident activities:", error);
        setActivities([]);
        setFetchedId(incidentId);
      });
  }, [incidentId]);

  const refresh = useCallback(async () => {
    if (!incidentId) return;
    const data = await getIncidentActivities(incidentId);
    setActivities(data);
  }, [incidentId]);

  // Derive loading: we're loading if we have an id but haven't fetched it yet
  const loading = incidentId ? fetchedId !== incidentId : false;

  return { activities, loading, refresh };
}

export function useIncidentDocuments(incidentId: string | undefined) {
  const [documents, setDocuments] = useState<
    Array<{ _id: string; name: string; type: string; uploaderId: string; createdAt: number; storagePath: string; size: number }>
  >([]);
  const [fetchedId, setFetchedId] = useState<string | null>(null);

  useEffect(() => {
    if (!incidentId) {
      return;
    }

    getDocuments(incidentId)
      .then((data) => {
        setDocuments(data);
        setFetchedId(incidentId);
      })
      .catch((error) => {
        console.error("Failed to load incident documents:", error);
        setDocuments([]);
        setFetchedId(incidentId);
      });
  }, [incidentId]);

  const refresh = useCallback(async () => {
    if (!incidentId) return;
    const data = await getDocuments(incidentId);
    setDocuments(data);
  }, [incidentId]);

  // Derive loading: we're loading if we have an id but haven't fetched it yet
  const loading = incidentId ? fetchedId !== incidentId : false;

  return { documents, loading, refresh };
}

export function useSignedDocuments(incidentId: string | undefined) {
  const [signedDocs, setSignedDocs] = useState<Record<string, { homeownerSignature: string; chaserSignature: string }>>({});
  const [fetchedId, setFetchedId] = useState<string | null>(null);

  useEffect(() => {
    if (!incidentId) {
      return;
    }

    getSignedDocuments(incidentId)
      .then((data) => {
        setSignedDocs(data.signedDocs);
        setFetchedId(incidentId);
      })
      .catch((error) => {
        console.error("Failed to load signed documents:", error);
        setSignedDocs({});
        setFetchedId(incidentId);
      });
  }, [incidentId]);

  // Derive loading: we're loading if we have an id but haven't fetched it yet
  const loading = incidentId ? fetchedId !== incidentId : false;

  const saveSignedDocument = useCallback(
    async (
      documentId: string,
      documentTitle: string,
      homeownerSignature: string,
      chaserSignature: string
    ) => {
      if (!incidentId) return;
      await saveSignedDocumentService(
        incidentId,
        documentId,
        documentTitle,
        homeownerSignature,
        chaserSignature
      );
      const data = await getSignedDocuments(incidentId);
      setSignedDocs(data.signedDocs);
    },
    [incidentId]
  );

  const getDocument = useCallback(
    async (documentId: string) => {
      if (!incidentId) return null;
      return getSignedDocument(incidentId, documentId);
    },
    [incidentId]
  );

  return { signedDocs, loading, saveSignedDocument, getDocument };
}

export function useIncidentResponders(responderIds: string[] | undefined) {
  const [responders, setResponders] = useState<
    Array<{
      _id: string;
      name?: string;
      avatarUrl?: string;
      email?: string;
      phone?: string;
    }>
  >([]);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);

  const responderIdsKey = useMemo(
    () => responderIds?.join(",") ?? "",
    [responderIds]
  );

  useEffect(() => {
    if (!responderIds || !responderIds.length) {
      return;
    }

    getResponderProfiles(responderIds)
      .then((data) => {
        setResponders(data);
        setFetchedKey(responderIdsKey);
      })
      .catch((error) => {
        console.error("Failed to load responder profiles:", error);
        setResponders([]);
        setFetchedKey(responderIdsKey);
      });
  }, [responderIdsKey, responderIds]);

  // Derive loading: we're loading if we have responderIds but haven't fetched them yet
  const loading = responderIds && responderIds.length > 0 ? fetchedKey !== responderIdsKey : false;

  return { responders, loading };
}

export function useAllChaserSubmissions(
  incidentId: string | undefined,
  responderIds: string[] | undefined
) {
  const [allDocuments, setAllDocuments] = useState<
    Array<{ chaserId: string; documents: Array<{ _id: string; name: string; type: string; storagePath: string; createdAt: number }> }>
  >([]);
  const [allSignedDocs, setAllSignedDocs] = useState<
    Array<{ chaserId: string; signedDocs: Record<string, { homeownerSignature: string; chaserSignature: string; signedAt: number }> }>
  >([]);
  const [fetchedKey, setFetchedKey] = useState<string | null>(null);

  const responderIdsKey = useMemo(
    () => responderIds?.join(",") ?? "",
    [responderIds]
  );

  // Create a composite key for tracking what we've fetched
  const compositeKey = incidentId && responderIds?.length ? `${incidentId}:${responderIdsKey}` : null;

  const refresh = useCallback(async () => {
    if (!incidentId || !responderIds?.length) return;

    try {
      const [docs, signedDocs] = await Promise.all([
        getAllChaserDocuments(incidentId, responderIds),
        getAllChaserSignedDocuments(incidentId, responderIds),
      ]);

      setAllDocuments(docs);
      setAllSignedDocs(signedDocs);
      setFetchedKey(`${incidentId}:${responderIdsKey}`);
    } catch (error) {
      console.error("Failed to load chaser submissions:", error);
      setAllDocuments([]);
      setAllSignedDocs([]);
      setFetchedKey(`${incidentId}:${responderIdsKey}`);
    }
  }, [incidentId, responderIds, responderIdsKey]);

  useEffect(() => {
    if (!incidentId || !responderIds?.length) {
      return;
    }

    // Inline the fetch logic to avoid calling a function that sets state
    Promise.all([
      getAllChaserDocuments(incidentId, responderIds),
      getAllChaserSignedDocuments(incidentId, responderIds),
    ])
      .then(([docs, signedDocs]) => {
        setAllDocuments(docs);
        setAllSignedDocs(signedDocs);
        setFetchedKey(`${incidentId}:${responderIdsKey}`);
      })
      .catch((error) => {
        console.error("Failed to load chaser submissions:", error);
        setAllDocuments([]);
        setAllSignedDocs([]);
        setFetchedKey(`${incidentId}:${responderIdsKey}`);
      });
  }, [incidentId, responderIds, responderIdsKey]);

  // Derive loading: we're loading if we have valid inputs but haven't fetched them yet
  const loading = compositeKey ? fetchedKey !== compositeKey : false;

  return { allDocuments, allSignedDocs, loading, refresh };
}
