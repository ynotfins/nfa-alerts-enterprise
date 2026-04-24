import { db, auth } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";

const INCIDENTS = "incidents";

export interface LocationVerification {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  distanceFromIncident: number;
}

export interface PhotoVerification {
  dataUrl: string;
  timestamp: number;
  hasGPSExif: boolean;
}

export interface DeviceAttestation {
  credentialId: string;
  attestation: string;
  timestamp: number;
}

export interface VerificationProof {
  location: LocationVerification;
  photo?: PhotoVerification;
  deviceAttestation?: DeviceAttestation;
  timestamp: number;
  hash: string;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

async function sha256(message: string): Promise<string> {
  const msgBuffer = new TextEncoder().encode(message);
  const hashBuffer = await crypto.subtle.digest("SHA-256", msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getCurrentLocation(): Promise<LocationVerification & { lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
          distanceFromIncident: 0,
        });
      },
      (error) => reject(error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

export async function validateLocation(
  incidentLat: number,
  incidentLng: number,
  maxDistance: number = 200
): Promise<LocationVerification> {
  const location = await getCurrentLocation();
  const distance = calculateDistance(location.lat, location.lng, incidentLat, incidentLng);

  if (distance > maxDistance) {
    throw new Error(`Too far from incident. Distance: ${Math.round(distance)}m (max: ${maxDistance}m)`);
  }

  return {
    ...location,
    distanceFromIncident: distance,
  };
}

export async function captureVerificationPhoto(): Promise<PhotoVerification> {
  return new Promise((resolve, reject) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.capture = "environment";

    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) {
        reject(new Error("No photo selected"));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          dataUrl: reader.result as string,
          timestamp: Date.now(),
          hasGPSExif: false,
        });
      };
      reader.onerror = () => reject(new Error("Failed to read photo"));
      reader.readAsDataURL(file);
    };

    input.click();
  });
}

export async function createDeviceAttestation(): Promise<DeviceAttestation | null> {
  if (!window.PublicKeyCredential) {
    return null;
  }

  try {
    const challenge = new Uint8Array(32);
    crypto.getRandomValues(challenge);

    const credential = (await navigator.credentials.get({
      publicKey: {
        challenge,
        timeout: 60000,
        userVerification: "required",
        rpId: window.location.hostname,
      },
    })) as PublicKeyCredential | null;

    if (!credential) return null;

    return {
      credentialId: credential.id,
      attestation: btoa(String.fromCharCode(...new Uint8Array(credential.rawId))),
      timestamp: Date.now(),
    };
  } catch (error) {
    console.error("Device attestation failed:", error);
    return null;
  }
}

export async function createVerificationProof(
  incidentLat: number,
  incidentLng: number,
  options: {
    requirePhoto?: boolean;
    requireDeviceAttestation?: boolean;
    maxDistance?: number;
  } = {}
): Promise<VerificationProof> {
  const location = await validateLocation(incidentLat, incidentLng, options.maxDistance);

  let photo: PhotoVerification | undefined;
  if (options.requirePhoto) {
    photo = await captureVerificationPhoto();
  }

  let deviceAttestation: DeviceAttestation | undefined;
  if (options.requireDeviceAttestation) {
    const attestation = await createDeviceAttestation();
    if (attestation) {
      deviceAttestation = attestation;
    }
  }

  const timestamp = Date.now();
  const dataToHash = JSON.stringify({
    location,
    photo: photo ? { timestamp: photo.timestamp } : null,
    deviceAttestation: deviceAttestation ? { credentialId: deviceAttestation.credentialId } : null,
    timestamp,
  });

  const hash = await sha256(dataToHash);

  return {
    location,
    photo,
    deviceAttestation,
    timestamp,
    hash,
  };
}

export async function saveVerificationProof(
  incidentId: string,
  proof: VerificationProof
): Promise<{ success: boolean }> {
  try {
    const userId = auth.currentUser?.uid;
    if (!userId) throw new Error("Not authenticated");

    const ref = doc(db, INCIDENTS, incidentId, "chaserSubmissions", userId);
    await setDoc(
      ref,
      {
        chaserId: userId,
        verification: proof,
        updatedAt: Date.now(),
      },
      { merge: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to save verification proof:", error);
    return { success: false };
  }
}
