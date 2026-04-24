import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = process.env.WEBHOOK_AUTH_TOKEN;

  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!adminDb) {
      return NextResponse.json(
        { error: "Admin DB not initialized" },
        { status: 500 },
      );
    }

    const incidentsSnap = await adminDb.collection("incidents").get();
    let updated = 0;

    for (const incidentDoc of incidentsSnap.docs) {
      const activitiesSnap = await adminDb
        .collection("incidents")
        .doc(incidentDoc.id)
        .collection("activities")
        .get();

      const data = incidentDoc.data();
      const responderIds = data.responderIds || [];

      await incidentDoc.ref.update({
        activityCount: activitiesSnap.size,
        responderCount: responderIds.length,
      });

      updated++;
    }

    return NextResponse.json({ success: true, updated });
  } catch (error) {
    console.error("Backfill error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 },
    );
  }
}
