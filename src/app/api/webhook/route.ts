import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { parseNotification } from "@/lib/webhook/parser";
import { geocodeAddress } from "@/lib/webhook/geocoder";
import { GeocodingError, ParsingError } from "@/lib/webhook/errors";

function sanitizeInput(text: string): string {
  return text
    .replace(/[\u0000-\u001F\u007F-\u009F]/g, "")
    .trim()
    .slice(0, 10000);
}

const PROMO_FD_CODES = [
  "BNN",
  "BNDESK",
  "BNNDESK",
  "BNN DESK",
  "BNNDSK",
  "BN DESK",
];

function filterPromoCodes(codes: string[] | null | undefined): string[] {
  if (!codes) return [];
  return codes.filter(
    (code) =>
      !PROMO_FD_CODES.some(
        (promo) =>
          code.toUpperCase().replace(/\s+/g, "") === promo.replace(/\s+/g, ""),
      ),
  );
}

async function getNextIncidentNumber(): Promise<string> {
  if (!adminDb) throw new Error("Firebase Admin not configured");
  const counterRef = adminDb.collection("counters").doc("incidents");
  const result = await adminDb.runTransaction(async (tx) => {
    const snap = await tx.get(counterRef);
    const nextVal = (snap.exists ? snap.data()?.value || 0 : 0) + 1;
    tx.set(counterRef, { name: "incidents", value: nextVal }, { merge: true });
    return nextVal;
  });
  return `INC-${String(result).padStart(6, "0")}`;
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();
  const ip = request.headers.get("x-forwarded-for") || "unknown";

  console.log("[WEBHOOK] Received request from IP:", ip);

  try {
    const authHeader = request.headers.get("Authorization");
    const expectedToken = process.env.WEBHOOK_AUTH_TOKEN;

    if (!expectedToken) {
      console.error("[WEBHOOK] WEBHOOK_AUTH_TOKEN not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    if (!authHeader || authHeader !== `Bearer ${expectedToken}`) {
      console.warn("[WEBHOOK] Unauthorized request - invalid token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!adminDb) {
      console.error("[WEBHOOK] Firebase Admin not configured");
      return NextResponse.json(
        { error: "Server configuration error" },
        { status: 500 },
      );
    }

    const body = await request.json();
    console.log("[WEBHOOK] Request body:", body);

    const message = body.message || "";
    if (!message || message.trim().length < 10) {
      console.log("[WEBHOOK] Empty or too short message, skipping");
      return NextResponse.json(
        { success: false, error: "Empty or invalid message" },
        { status: 400 },
      );
    }

    const bodyText = JSON.stringify(body);
    console.log("[WEBHOOK] Stringified body length:", bodyText.length);

    const sanitized = sanitizeInput(bodyText);
    console.log("[WEBHOOK] Sanitized text:", {
      originalLength: bodyText.length,
      sanitizedLength: sanitized.length,
    });

    console.log("[WEBHOOK] Starting notification parsing...");
    const parsed = await parseNotification(sanitized);
    console.log(
      "[WEBHOOK] Parsed notification:",
      JSON.stringify(parsed, null, 2),
    );

    let coords: { lat: number; lng: number };
    try {
      console.log("[WEBHOOK] Starting geocoding:", {
        address: parsed.location.address,
        city: parsed.location.city,
        state: parsed.location.state,
      });
      coords = await geocodeAddress(
        parsed.location.address,
        parsed.location.city,
        parsed.location.state,
      );
      console.log("[WEBHOOK] Geocoding result:", coords);
    } catch (error) {
      console.error(
        "[WEBHOOK] Geocoding failed:",
        error instanceof Error ? error.message : String(error),
      );
      return NextResponse.json(
        {
          error: "Geocoding failed",
          details: error instanceof Error ? error.message : String(error),
          location: {
            address: parsed.location.address,
            city: parsed.location.city,
            state: parsed.location.state,
          },
        },
        { status: 422 },
      );
    }

    let existingIncident = null;
    if (parsed.alertId) {
      console.log(
        "[WEBHOOK] Checking for existing incident with alertId:",
        parsed.alertId,
      );
      const snap = await adminDb
        .collection("incidents")
        .where("alertId", "==", parsed.alertId)
        .limit(1)
        .get();
      if (!snap.empty) {
        existingIncident = { _id: snap.docs[0].id, ...snap.docs[0].data() };
      }
      console.log("[WEBHOOK] Found existing incident:", existingIncident?._id);
    }

    if (existingIncident && parsed.isUpdate) {
      const activityType = parsed.activityType ?? "custom";
      console.log(
        "[WEBHOOK] Adding activity to existing incident:",
        existingIncident._id,
        "type:",
        activityType,
      );

      await adminDb
        .collection("incidents")
        .doc(existingIncident._id)
        .collection("activities")
        .add({
          type: activityType,
          description: parsed.activityDescription || parsed.description,
          metadata: { source: parsed.source },
          createdAt: Date.now(),
        });

      const alarmActivityMap: Record<string, string> = {
        alarm_all_hands: "all_hands",
        alarm_2nd: "2nd_alarm",
        alarm_3rd: "3rd_alarm",
        alarm_4th: "4th_alarm",
        alarm_5th: "5th_alarm",
      };

      console.log(
        "[WEBHOOK] Updating incident with new information from update...",
      );
      const updateData: Record<string, unknown> = {
        updatedAt: Date.now(),
        activityCount: FieldValue.increment(1),
      };

      const filteredDepts = filterPromoCodes(parsed.departmentNumber);
      if (filteredDepts.length > 0) {
        updateData.departmentNumber = FieldValue.arrayUnion(...filteredDepts);
      }
      if (parsed.alarmLevel || activityType in alarmActivityMap) {
        updateData.alarmLevel =
          parsed.alarmLevel ?? alarmActivityMap[activityType];
      }
      if (parsed.location.county) {
        updateData["location.county"] = parsed.location.county;
      }

      await adminDb
        .collection("incidents")
        .doc(existingIncident._id)
        .update(updateData);

      await adminDb.collection("webhookLogs").add({
        rawText: bodyText,
        sanitizedText: sanitized,
        parsedData: parsed,
        incidentId: existingIncident._id,
        action: "activity_added",
        success: true,
        processingTimeMs: Date.now() - startTime,
        sourceIp: ip,
        createdAt: Date.now(),
      });

      console.log(
        "[WEBHOOK] Activity added successfully - total time:",
        Date.now() - startTime,
        "ms",
      );
      return NextResponse.json({
        success: true,
        action: "activity_added",
        incidentId: existingIncident._id,
        source: parsed.source,
      });
    }

    if (existingIncident) {
      console.log(
        "[WEBHOOK] Incident exists but no activity to add - returning existing",
      );
      await adminDb.collection("webhookLogs").add({
        rawText: bodyText,
        sanitizedText: sanitized,
        parsedData: parsed,
        incidentId: existingIncident._id,
        action: "incident_exists",
        success: true,
        processingTimeMs: Date.now() - startTime,
        sourceIp: ip,
        createdAt: Date.now(),
      });
      return NextResponse.json({
        success: true,
        action: "incident_exists",
        incidentId: existingIncident._id,
        source: parsed.source,
      });
    }

    console.log("[WEBHOOK] Creating new incident...");
    const displayId = await getNextIncidentNumber();
    const now = Date.now();

    const incidentRef = await adminDb.collection("incidents").add({
      alertId: parsed.alertId ?? null,
      displayId,
      type: parsed.incidentType,
      description: parsed.description,
      departmentNumber: filterPromoCodes(parsed.departmentNumber),
      alarmLevel: parsed.alarmLevel ?? null,
      location: {
        ...coords,
        address: parsed.location.address,
        city: parsed.location.city,
        county: parsed.location.county ?? null,
        state: parsed.location.state,
      },
      status: "active",
      responderIds: [],
      createdAt: now,
      updatedAt: now,
    });

    console.log("[WEBHOOK] Created incident:", incidentRef.id);

    await adminDb.collection("webhookLogs").add({
      rawText: bodyText,
      sanitizedText: sanitized,
      parsedData: parsed,
      incidentId: incidentRef.id,
      action: "incident_created",
      success: true,
      processingTimeMs: Date.now() - startTime,
      sourceIp: ip,
      createdAt: Date.now(),
    });

    console.log(
      "[WEBHOOK] Incident created successfully - total time:",
      Date.now() - startTime,
      "ms",
    );
    return NextResponse.json({
      success: true,
      action: "incident_created",
      incidentId: incidentRef.id,
      source: parsed.source,
    });
  } catch (error) {
    console.error("Webhook error:", error);

    if (error instanceof GeocodingError) {
      return NextResponse.json(
        { error: "Geocoding failed", details: error.message },
        { status: 422 },
      );
    }

    if (error instanceof ParsingError) {
      return NextResponse.json(
        { error: "AI parsing failed", details: error.message },
        { status: 422 },
      );
    }

    if (error instanceof Error && error.name === "ZodError") {
      return NextResponse.json(
        { error: "Validation failed", details: error.message },
        { status: 422 },
      );
    }

    return NextResponse.json(
      {
        error: "Failed to process notification",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    );
  }
}
