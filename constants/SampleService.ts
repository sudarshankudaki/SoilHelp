import { Platform } from 'react-native';
import {
  apiFetchSamples,
  apiRegisterSample,
  ApiSample,
} from './ApiService';

export interface SampleRecord {
  id: string;
  sampleId: string; // e.g. "SH-2026-892"
  farmerId?: string;
  farmerName: string;
  acres: string;
  village: string;
  collectionDate: string;
  createdAt?: string;
  status: 'collected' | 'in_transit' | 'lab_analysis' | 'completed';
  statusLabel: string;
  timeline: {
    collectedDate: string;
    dispatchedDate?: string;
    labAnalysisDate?: string;
    completedDate?: string;
  };
  qrData?: string;
}

const STORAGE_KEY = '@soilhelp_samples_data';

// Default seed records for offline use
export const INITIAL_SAMPLES: SampleRecord[] = [
  {
    id: '1',
    sampleId: 'SH-2026-892',
    farmerName: 'Ramesh Kumar',
    acres: '2.5',
    village: 'Hassan',
    collectionDate: '25 Apr 2026',
    status: 'in_transit',
    statusLabel: 'In Transit',
    timeline: {
      collectedDate: '25 Apr 2026',
      dispatchedDate: '25 Apr 2026',
    },
  },
  {
    id: '2',
    sampleId: 'SH-2026-885',
    farmerName: 'Suresh Reddy',
    acres: '4.0',
    village: 'Mandya',
    collectionDate: '24 Apr 2026',
    status: 'completed',
    statusLabel: 'Completed',
    timeline: {
      collectedDate: '22 Apr 2026',
      dispatchedDate: '23 Apr 2026',
      labAnalysisDate: '24 Apr 2026',
      completedDate: '24 Apr 2026',
    },
  },
  {
    id: '3',
    sampleId: 'SH-2026-751',
    farmerName: 'Malleshappa',
    acres: '3.0',
    village: 'Tumkur',
    collectionDate: '20 Apr 2026',
    status: 'lab_analysis',
    statusLabel: 'Lab Analysis',
    timeline: {
      collectedDate: '20 Apr 2026',
      dispatchedDate: '21 Apr 2026',
      labAnalysisDate: '23 Apr 2026',
    },
  },
];

let cachedSamples: SampleRecord[] | null = null;

// ---------------------------------------------------------------------------
// Storage helpers
// ---------------------------------------------------------------------------

async function getStorage() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: async (k: string) => window.localStorage.getItem(k),
      setItem: async (k: string, v: string) => window.localStorage.setItem(k, v),
    };
  }

  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  } catch {
    return {
      getItem: async () => null,
      setItem: async () => {},
    };
  }
}

async function persistLocally(samples: SampleRecord[]) {
  try {
    const storage = await getStorage();
    await storage.setItem(STORAGE_KEY, JSON.stringify(samples));
  } catch (err) {
    console.warn('[SampleService] Local persist error:', err);
  }
}

/** Map server ApiSample to local SampleRecord interface */
function fromApi(s: ApiSample): SampleRecord {
  return {
    id: s.id,
    sampleId: s.sampleId,
    farmerId: s.farmerId,
    farmerName: s.farmerName,
    acres: s.acres,
    village: s.village,
    collectionDate: s.collectionDate ?? '',
    status: s.status as SampleRecord['status'],
    statusLabel: s.statusLabel,
    timeline: {
      collectedDate: s.timeline.collectedDate ?? '',
      dispatchedDate: s.timeline.dispatchedDate,
      labAnalysisDate: s.timeline.labAnalysisDate,
      completedDate: s.timeline.completedDate,
    },
    qrData: s.qrData,
  };
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch all sample records — tries server first, falls back to local cache.
 */
export async function getSamples(): Promise<SampleRecord[]> {
  // Try server API first
  try {
    const serverSamples = await apiFetchSamples();
    const mapped = serverSamples.map(fromApi);
    cachedSamples = mapped;
    persistLocally(mapped);
    return cachedSamples;
  } catch (serverErr) {
    console.warn('[SampleService] Server unavailable, using local cache:', serverErr);
  }

  // Fallback: local storage
  if (cachedSamples) return cachedSamples;

  try {
    const storage = await getStorage();
    const stored = await storage.getItem(STORAGE_KEY);
    if (stored) {
      cachedSamples = JSON.parse(stored);
      return cachedSamples!;
    }
  } catch (err) {
    console.warn('[SampleService] Error reading local samples:', err);
  }

  cachedSamples = [...INITIAL_SAMPLES];
  return cachedSamples;
}

/**
 * Register a newly scanned or collected sample — saves to server first.
 * If requireServer is true (default), throws readable error on network failure.
 */
export async function addSample(
  sample: Omit<SampleRecord, 'id'>,
  options: { requireServer?: boolean } = { requireServer: true }
): Promise<SampleRecord> {
  if (options.requireServer) {
    const created = await apiRegisterSample({
      sampleId: sample.sampleId,
      farmerId: sample.farmerId,
      farmerName: sample.farmerName,
      acres: sample.acres,
      village: sample.village,
      status: sample.status,
      collectionDate: sample.collectionDate,
      qrData: sample.qrData,
    });
    const newRecord = { ...fromApi(created), createdAt: new Date().toISOString() };

    // Update cache
    const currentList = cachedSamples ?? [...INITIAL_SAMPLES];
    const existingIdx = currentList.findIndex((s) => s.sampleId.toUpperCase() === newRecord.sampleId.toUpperCase());
    if (existingIdx !== -1) {
      cachedSamples = [
        newRecord,
        ...currentList.filter((_, i) => i !== existingIdx),
      ];
    } else {
      cachedSamples = [newRecord, ...currentList];
    }
    persistLocally(cachedSamples);
    notifySampleListeners();
    return newRecord;
  }

  // Optional offline fallback mode
  try {
    const created = await apiRegisterSample({
      sampleId: sample.sampleId,
      farmerId: sample.farmerId,
      farmerName: sample.farmerName,
      acres: sample.acres,
      village: sample.village,
      status: sample.status,
      collectionDate: sample.collectionDate,
      qrData: sample.qrData,
    });
    const newRecord = { ...fromApi(created), createdAt: new Date().toISOString() };

    const currentList = cachedSamples ?? [...INITIAL_SAMPLES];
    const existingIdx = currentList.findIndex((s) => s.sampleId.toUpperCase() === newRecord.sampleId.toUpperCase());
    if (existingIdx !== -1) {
      cachedSamples = [
        newRecord,
        ...currentList.filter((_, i) => i !== existingIdx),
      ];
    } else {
      cachedSamples = [newRecord, ...currentList];
    }
    persistLocally(cachedSamples);
    notifySampleListeners();
    return newRecord;
  } catch (serverErr) {
    console.warn('[SampleService] Server unavailable, saving locally:', serverErr);
  }

  // Local fallback
  const currentList = cachedSamples ?? await getSamples();
  const existingIdx = currentList.findIndex(
    (s) => s.sampleId.toUpperCase() === sample.sampleId.toUpperCase()
  );
  if (existingIdx !== -1) return currentList[existingIdx];

  const newRecord: SampleRecord = { ...sample, id: String(Date.now()), createdAt: new Date().toISOString() };
  const updatedList = [newRecord, ...currentList];
  cachedSamples = updatedList;
  persistLocally(updatedList);
  notifySampleListeners();
  return newRecord;
}

const sampleListeners = new Set<(samples: SampleRecord[]) => void>();

function notifySampleListeners() {
  if (!cachedSamples) return;
  sampleListeners.forEach((callback) => {
    try {
      callback([...cachedSamples!]);
    } catch (err) {
      console.error('[SampleService] Listener callback error:', err);
    }
  });
}

export function onSamplesChange(callback: (samples: SampleRecord[]) => void): () => void {
  sampleListeners.add(callback);
  return () => sampleListeners.delete(callback);
}

/**
 * Look up a sample by ID or QR code
 */
export async function findSampleById(sampleId: string): Promise<SampleRecord | undefined> {
  const samples = await getSamples();
  const cleanId = sampleId.trim().toUpperCase();
  return samples.find(
    (s) => s.sampleId.toUpperCase() === cleanId || s.id === cleanId
  );
}

/**
 * Parse structured or plain QR code content
 */
export function parseQrData(rawData: string): {
  sampleId: string;
  farmerName: string;
  acres: string;
  village: string;
} {
  const trimmed = rawData.trim();

  // Try parsing JSON payload (e.g. {"sampleId":"SH-2026-102","farmer":"Ramesh Kumar","acres":"3","village":"Hassan"})
  try {
    if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
      const parsed = JSON.parse(trimmed);
      return {
        sampleId: parsed.sampleId || parsed.id || `SH-2026-${Math.floor(100 + Math.random() * 900)}`,
        farmerName: parsed.farmer || parsed.farmerName || 'Registered Farmer',
        acres: parsed.acres || '3.0',
        village: parsed.village || 'Karnataka',
      };
    }
  } catch {
    // Ignore JSON parse error, treat as raw text
  }

  // Check if it already has sample code pattern
  const match = trimmed.match(/SH[-_]?\d{4}[-_]?\d+/i);
  if (match) {
    return {
      sampleId: match[0].toUpperCase().replace(/_/g, '-'),
      farmerName: 'Ramesh Kumar',
      acres: '2.5',
      village: 'Hassan',
    };
  }

  // Generic QR string or barcode
  const sanitized = trimmed.replace(/[^a-zA-Z0-9-]/g, '').slice(0, 16);
  const sampleId = sanitized.startsWith('SH-')
    ? sanitized
    : `SH-2026-${sanitized || Math.floor(100 + Math.random() * 900)}`;

  return {
    sampleId,
    farmerName: 'Ramesh Kumar',
    acres: '2.5',
    village: 'Hassan',
  };
}
