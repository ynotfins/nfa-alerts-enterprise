import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const expectedToken = process.env.WEBHOOK_AUTH_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not configured" },
        { status: 500 }
      );
    }

    const incidentsSnap = await adminDb
      .collection("incidents")
      .where("alertId", "!=", null)
      .get();

    const alertIdGroups = new Map<string, { id: string; createdAt: number }[]>();

    incidentsSnap.docs.forEach((doc) => {
      const data = doc.data();
      const alertId = data.alertId;
      if (!alertId) return;

      if (!alertIdGroups.has(alertId)) {
        alertIdGroups.set(alertId, []);
      }
      alertIdGroups.get(alertId)!.push({
        id: doc.id,
        createdAt: data.createdAt || 0,
      });
    });

    const duplicates = Array.from(alertIdGroups.entries())
      .filter(([, incidents]) => incidents.length > 1)
      .map(([alertId, incidents]) => ({
        alertId,
        count: incidents.length,
        incidents: incidents.sort((a, b) => a.createdAt - b.createdAt),
      }));

    if (duplicates.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No duplicates found",
        merged: 0,
      });
    }

    const results = [];
    for (const dup of duplicates) {
      const [keep, ...toDelete] = dup.incidents;

      for (const incident of toDelete) {
        await adminDb.collection("incidents").doc(incident.id).delete();
      }

      results.push({
        alertId: dup.alertId,
        kept: keep.id,
        merged: toDelete.length,
      });
    }

    return NextResponse.json({
      success: true,
      totalDuplicateGroups: duplicates.length,
      results,
      totalMerged: results.reduce((sum, r) => sum + r.merged, 0),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to merge duplicates",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const expectedToken = process.env.WEBHOOK_AUTH_TOKEN;

    if (!expectedToken) {
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 }
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminDb) {
      return NextResponse.json(
        { error: "Firebase Admin not configured" },
        { status: 500 }
      );
    }

    const incidentsSnap = await adminDb
      .collection("incidents")
      .where("alertId", "!=", null)
      .get();

    const alertIdGroups = new Map<string, number>();

    incidentsSnap.docs.forEach((doc) => {
      const alertId = doc.data().alertId;
      if (!alertId) return;
      alertIdGroups.set(alertId, (alertIdGroups.get(alertId) || 0) + 1);
    });

    const duplicates = Array.from(alertIdGroups.entries())
      .filter(([, count]) => count > 1)
      .map(([alertId, count]) => ({ alertId, count }));

    return NextResponse.json({
      success: true,
      duplicateGroups: duplicates,
      totalGroups: duplicates.length,
      totalDuplicates: duplicates.reduce((sum, d) => sum + (d.count - 1), 0),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to find duplicates",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
