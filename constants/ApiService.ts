/**
 * SoilHelp API Service
 * Handles all communication with the Python FastAPI backend
 */

import { Platform } from "react-native";
import { getServerBaseUrl, getCachedServerUrl, testServerConnection } from "./ServerConfig";

// Dynamic base URL accessor - backwards-compatible with code that imports API_BASE_URL
export const getApiBaseUrl = getServerBaseUrl;
export const API_BASE_URL = getCachedServerUrl();

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
    // On web, expo-image-picker returns a blob: URL or data: URI.
    let blob: Blob;
    try {
      if (imageUri.startsWith("data:")) {
        // data URI — decode base64 directly, no network call needed
        const [header, base64] = imageUri.split(",");
        const mime = header.match(/:(.*?);/)?.[1] || detectedType;
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        blob = new Blob([bytes], { type: mime });
      } else if (imageUri.startsWith("blob:")) {
        // blob: URL — same origin fetch, always works
        const blobResponse = await fetch(imageUri);
        blob = await blobResponse.blob();
      } else {
        // fallback — try fetching as-is
        const blobResponse = await fetch(imageUri);
        blob = await blobResponse.blob();
      }
    } catch (imgErr: any) {
      throw new Error(`Could not read image: ${imgErr?.message || imgErr}`);
    }
    const file = new File([blob], filename, { type: blob.type || detectedType });
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

  const baseUrl = await getServerBaseUrl();
  let response: Response;
  try {
    response = await fetch(`${baseUrl}/analyze`, {
      method: "POST",
      body: formData,
    });
  } catch (netErr: any) {
    console.error("[ApiService] fetch failed at:", baseUrl, netErr);
    throw new Error(
      `Cannot connect to server at ${baseUrl}. Ensure backend is running and check IP in Profile > Server Settings.`
    );
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

export async function checkBackendHealth(): Promise<{ ok: boolean; url: string }> {
  const baseUrl = await getServerBaseUrl();
  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4000);
    const response = await fetch(`${baseUrl}/health`, {
      signal: controller.signal,
    });
    clearTimeout(timer);
    return { ok: response.ok, url: baseUrl };
  } catch {
    return { ok: false, url: baseUrl };
  }
}

// ---------------------------------------------------------------------------
// Farmer API Methods
// ---------------------------------------------------------------------------

export interface ApiFarmer {
  id: string;
  name: string;
  village: string;
  farmSize: string;
  phone: string;
  primaryCrop?: string;
  soilType?: string;
  date?: string;
}

export interface ApiFarmerCreate {
  name: string;
  village: string;
  farmSize: string;
  phone: string;
  primaryCrop?: string;
  soilType?: string;
}

/** Fetch all farmers from the server database. Throws on network failure. */
export async function apiFetchFarmers(search?: string): Promise<ApiFarmer[]> {
  const baseUrl = await getServerBaseUrl();
  const url = new URL(`${baseUrl}/farmers`);
  if (search) url.searchParams.set("search", search);
  const resp = await fetch(url.toString(), { method: "GET" });
  if (!resp.ok) throw new Error(`GET /farmers failed: ${resp.status}`);
  return resp.json();
}

/** Register a new farmer on the server and return the persisted record. */
export async function apiRegisterFarmer(data: ApiFarmerCreate): Promise<ApiFarmer> {
  const baseUrl = await getServerBaseUrl();
  const resp = await fetch(`${baseUrl}/farmers`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `POST /farmers failed: ${resp.status}`);
  }
  return resp.json();
}

/** Delete a farmer from the server database. */
export async function apiDeleteFarmer(id: string): Promise<void> {
  const baseUrl = await getServerBaseUrl();
  const resp = await fetch(`${baseUrl}/farmers/${id}`, { method: "DELETE" });
  if (!resp.ok && resp.status !== 404) {
    throw new Error(`DELETE /farmers/${id} failed: ${resp.status}`);
  }
}

// ---------------------------------------------------------------------------
// Sample API Methods
// ---------------------------------------------------------------------------

export interface ApiSampleTimeline {
  collectedDate?: string;
  dispatchedDate?: string;
  labAnalysisDate?: string;
  completedDate?: string;
}

export interface ApiSample {
  id: string;
  sampleId: string;
  farmerId?: string;
  farmerName: string;
  acres: string;
  village: string;
  collectionDate?: string;
  status: string;
  statusLabel: string;
  timeline: ApiSampleTimeline;
  qrData?: string;
}

export interface ApiSampleCreate {
  sampleId: string;
  farmerName: string;
  acres: string;
  village: string;
  status?: string;
  collectionDate?: string;
  qrData?: string;
  farmerId?: string;
}

/** Fetch all samples from the server database. */
export async function apiFetchSamples(farmerId?: string): Promise<ApiSample[]> {
  const baseUrl = await getServerBaseUrl();
  const url = new URL(`${baseUrl}/samples`);
  if (farmerId) url.searchParams.set("farmer_id", farmerId);
  const resp = await fetch(url.toString(), { method: "GET" });
  if (!resp.ok) throw new Error(`GET /samples failed: ${resp.status}`);
  return resp.json();
}

/** Register a new sample (idempotent by sampleId). */
export async function apiRegisterSample(data: ApiSampleCreate): Promise<ApiSample> {
  const baseUrl = await getServerBaseUrl();
  let resp: Response;
  try {
    resp = await fetch(`${baseUrl}/samples`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
  } catch (netErr: any) {
    throw new Error(`Cannot reach server at ${baseUrl}. Ensure backend is running.`);
  }
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `POST /samples failed: ${resp.status}`);
  }
  return resp.json();
}

/** Advance a sample's tracking status. */
export async function apiUpdateSampleStatus(
  sampleId: string,
  status: "collected" | "in_transit" | "lab_analysis" | "completed"
): Promise<ApiSample> {
  const baseUrl = await getServerBaseUrl();
  const resp = await fetch(`${baseUrl}/samples/${sampleId}/status`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status }),
  });
  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(err.detail || `PATCH /samples/${sampleId}/status failed: ${resp.status}`);
  }
  return resp.json();
}
