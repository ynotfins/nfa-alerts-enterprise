import { Client } from "@googlemaps/google-maps-services-js";
import { GeocodingError } from "./errors";

const client = new Client({});

export async function geocodeAddress(
  address: string,
  city: string,
  state: string
): Promise<{ lat: number; lng: number }> {
  const fullAddress = `${address}, ${city}, ${state}`;

  try {
    const response = await client.geocode({
      params: {
        address: fullAddress,
        key: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      },
      timeout: 5000,
    });

    if (!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) {
      throw new GeocodingError("Google Maps API key not configured");
    }

    if (response.data.status !== "OK") {
      throw new GeocodingError(
        `Geocoding API error: ${response.data.status} for ${fullAddress}`
      );
    }

    const result = response.data.results[0];
    if (!result) {
      throw new GeocodingError(`No results for: ${fullAddress}`);
    }

    const { lat, lng } = result.geometry.location;

    if (lat === 0 && lng === 0 && !fullAddress.toLowerCase().includes("null island")) {
      throw new GeocodingError("Invalid coordinates: (0,0)");
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      throw new GeocodingError(`Invalid coordinate range: (${lat}, ${lng})`);
    }

    return { lat, lng };
  } catch (error) {
    if (error instanceof GeocodingError) {
      throw error;
    }

    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response?: { data?: { error_message?: string, status?: string } } };
      const errorMsg = axiosError.response?.data?.error_message || axiosError.response?.data?.status;
      if (errorMsg) {
        throw new GeocodingError(`Google Maps API: ${errorMsg}`);
      }
    }

    throw new GeocodingError(
      `Geocoding failed: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
