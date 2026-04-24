import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";

const PROMO_FD_CODES = [
  "BNN",
  "BNDESK",
  "BNNDESK",
  "BNNDESK",
  "BNNDSK",
  "BNDESK",
];

function isPromoCode(code: string): boolean {
  const normalized = code.toUpperCase().replace(/\s+/g, "");
  return PROMO_FD_CODES.some(
    (promo) => normalized === promo.replace(/\s+/g, "")
  );
}

export async function POST(request: Request) {
  const authHeader = request.headers.get("authorization");
  const token = process.env.WEBHOOK_AUTH_TOKEN;

  if (!token || authHeader !== `Bearer ${token}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Admin DB not initialized" }, { status: 500 });
    }

    const incidentsSnap = await adminDb.collection("incidents").get();
    let updated = 0;
    let cleaned = 0;

    for (const doc of incidentsSnap.docs) {
      const data = doc.data();
      const depts = data.departmentNumber as string[] | undefined;

      if (!depts || depts.length === 0) continue;

      const filteredDepts = depts.filter((code) => !isPromoCode(code));
      const removedCount = depts.length - filteredDepts.length;

      if (removedCount > 0) {
        await doc.ref.update({ departmentNumber: filteredDepts });
        updated++;
        cleaned += removedCount;
      }
    }

    return NextResponse.json({ success: true, incidentsUpdated: updated, codesRemoved: cleaned });
  } catch (error) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
