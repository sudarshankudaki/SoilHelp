/**
 * SoilHelp API Service
 * Handles all communication with the Python FastAPI backend
 */

import { Platform } from "react-native";

const LOCAL_BACKEND_URL = "http://localhost:8000";
const DEVICE_BACKEND_URL = "http://192.168.0.9:8000";

// Web runs from the browser, so it must hit localhost on the same machine.
// Native apps need the LAN IP of the machine running the backend.
export const API_BASE_URL =
  Platform.OS === "web"
    ? (typeof window !== "undefined" ? `http://${window.location.hostname}:8000` : LOCAL_BACKEND_URL)
    : DEVICE_BACKEND_URL;

export interface NutrientInfo {
  value: number;
  unit: string;
  label: string;
  optimal_min: number;
  optimal_max: number;
}

export interface CropInfo {
  name: string;
  icon: string;
  season: string;
  water: string;
}

export interface SoilAnalysisResult {
  success: boolean;
  analysis_time_seconds: number;
  soil_type: string;
  soil_confidence: number;
  all_probabilities: Record<string, number>;
  nutrients: {
    nitrogen: NutrientInfo;
    phosphorus: NutrientInfo;
    potassium: NutrientInfo;
    ph: NutrientInfo;
  };
  recommended_crops: CropInfo[];
  fertilizer_advice: string[];
  ph_advice: string;
  summary: string;
  image_validation: {
    is_valid: boolean;
    confidence: number;
    labels: string[];
  };
}

export async function analyzeSoilImage(
  imageUri: string,
  mimeType?: string,
  soilMetadata?: {
    texture?: string;
    moisture_pct?: number;
    organic_carbon_pct?: number;
    ec_ds_m?: number;
    temperature_c?: number;
    rainfall_mm?: number;
    ph?: number;
    slope?: number;
    water_logging?: number;
  }
): Promise<SoilAnalysisResult> {
  const formData = new FormData();

  const rawFilename = imageUri.split("/").pop() || "soil_sample.jpg";
  const cleanFilename = rawFilename.includes("?") ? rawFilename.split("?")[0] : rawFilename;
  const extMatch = /\.(\w+)$/.exec(cleanFilename);
  const ext = extMatch ? extMatch[1].toLowerCase() : "jpg";
  const detectedType = mimeType || (ext === "png" ? "image/png" : "image/jpeg");
  const filename = cleanFilename.endsWith(`.${ext}`) ? cleanFilename : `${cleanFilename}.${ext}`;

  if (Platform.OS === "web") {
    // On web, fetch the image URI as a blob and append a real File object.
    // The React Native { uri, name, type } trick does not work in browsers.
    const blobResponse = await fetch(imageUri);
    const blob = await blobResponse.blob();
    const file = new File([blob], filename, { type: detectedType });
    formData.append("file", file);
  } else {
    // On native (iOS / Android), React Native's FormData accepts { uri, name, type }.
    const normalizedUri =
      imageUri.startsWith("file://") ||
      imageUri.startsWith("content://") ||
      imageUri.startsWith("http")
        ? imageUri
        : `file://${imageUri}`;

    formData.append("file", {
      uri: normalizedUri,
      name: filename,
      type: detectedType,
    } as any);
  }

  const metadata = soilMetadata || {
    texture: "Loam",
    moisture_pct: 28,
    organic_carbon_pct: 1.2,
    ec_ds_m: 1.5,
    temperature_c: 28,
    rainfall_mm: 750,
    ph: 6.5,
    slope: 0.5,
    water_logging: 0,
  };

  Object.entries(metadata).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/analyze`, {
      method: "POST",
      body: formData,
      headers: {
        "bypass-tunnel-reminder": "true",
      },
    });
  } catch (netErr: any) {
    throw new Error(`Network request failed: ${netErr?.message || netErr}`);
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    let msg = `Server error ${response.status}`;
    if (errorData.detail) {
      if (typeof errorData.detail === "string") {
        msg = errorData.detail;
      } else if (Array.isArray(errorData.detail)) {
        msg = errorData.detail.map((e: any) => e.msg || JSON.stringify(e)).join(", ");
      } else {
        msg = JSON.stringify(errorData.detail);
      }
    }
    throw new Error(msg);
  }

  return response.json();
}

export async function checkBackendHealth(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/health`, {
      headers: {
        "bypass-tunnel-reminder": "true",
      },
      signal: AbortSignal.timeout(5000),
    });
    return response.ok;
  } catch {
    return false;
  }
}
