import { Platform } from 'react-native';
import {
  apiFetchFarmers,
  apiRegisterFarmer,
  apiDeleteFarmer,
  ApiFarmer,
} from './ApiService';

export interface Farmer {
  id: string;
  name: string;
  village: string;
  farmSize: string;
  phone: string;
  date: string;
  createdAt?: string;
  primaryCrop?: string;
  soilType?: string;
}

const STORAGE_KEY = '@soilhelp_farmers_data';

// Initial seed data for fresh installs (used as offline fallback)
export const INITIAL_FARMERS: Farmer[] = [
  { id: '1', name: 'Ramesh Kumar', village: 'Hassan', farmSize: '5', phone: '9845012345', date: '2024-03-15', primaryCrop: 'Ragi' },
  { id: '2', name: 'Suresh Gowda', village: 'Mandya', farmSize: '12', phone: '9845067890', date: '2024-03-16', primaryCrop: 'Sugarcane' },
  { id: '3', name: 'Malleshappa', village: 'Tumkur', farmSize: '3', phone: '9845011223', date: '2024-03-16', primaryCrop: 'Groundnut' },
  { id: '4', name: 'Basavaraj Patil', village: 'Belagavi', farmSize: '8', phone: '9880012345', date: '2024-04-02', primaryCrop: 'Cotton' },
  { id: '5', name: 'Chennamma Hiremath', village: 'Dharwad', farmSize: '4.5', phone: '9880054321', date: '2024-04-10', primaryCrop: 'Soybean' },
];

let cachedFarmers: Farmer[] = [...INITIAL_FARMERS];
let isLoaded = false;
const listeners = new Set<(farmers: Farmer[]) => void>();

// ---------------------------------------------------------------------------
// Storage helpers (AsyncStorage / localStorage)
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

async function persistLocally(farmers: Farmer[]) {
  try {
    const storage = await getStorage();
    await storage.setItem(STORAGE_KEY, JSON.stringify(farmers));
  } catch (err) {
    console.warn('[FarmerData] Local persist error:', err);
  }
}

/** Convert API farmer shape to local Farmer interface */
function fromApi(f: ApiFarmer): Farmer {
  return {
    id: f.id,
    name: f.name,
    village: f.village,
    farmSize: f.farmSize,
    phone: f.phone,
    date: f.date ?? new Date().toISOString().split('T')[0],
    primaryCrop: f.primaryCrop,
    soilType: f.soilType,
  };
}

function notifyListeners() {
  listeners.forEach((callback) => {
    try {
      callback([...cachedFarmers]);
    } catch (err) {
      console.error('[FarmerData] Listener callback error:', err);
    }
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Fetch farmers — tries server first, falls back to local AsyncStorage.
 */
export async function getFarmersAsync(): Promise<Farmer[]> {
  // Try server API first
  try {
    const serverFarmers = await apiFetchFarmers();
    const mapped = serverFarmers.map(fromApi);
    cachedFarmers = mapped;
    isLoaded = true;
    // Sync to local storage as offline cache
    persistLocally(mapped);
    return cachedFarmers;
  } catch (serverErr) {
    console.warn('[FarmerData] Server unavailable, falling back to local storage:', serverErr);
  }

  // Fallback: load from local storage
  if (isLoaded) return cachedFarmers;

  try {
    const storage = await getStorage();
    const stored = await storage.getItem(STORAGE_KEY);
    if (stored) {
      cachedFarmers = JSON.parse(stored);
      isLoaded = true;
      return cachedFarmers;
    }
  } catch (err) {
    console.warn('[FarmerData] Error reading stored farmers:', err);
  }

  cachedFarmers = [...INITIAL_FARMERS];
  isLoaded = true;
  return cachedFarmers;
}

/**
 * Synchronous read of currently cached farmers (for backward compatibility)
 */
export function getFarmers(): Farmer[] {
  if (!isLoaded) {
    getFarmersAsync();
  }
  return cachedFarmers;
}

/**
 * Register a new farmer — saves to server first, caches locally as backup.
 */
export async function addFarmerAsync(farmer: Omit<Farmer, 'id' | 'date'>): Promise<Farmer> {
  // Try server API first
  try {
    const created = await apiRegisterFarmer({
      name: farmer.name,
      village: farmer.village,
      farmSize: farmer.farmSize,
      phone: farmer.phone,
      primaryCrop: farmer.primaryCrop,
      soilType: farmer.soilType,
    });
    const newFarmer = { ...fromApi(created), createdAt: new Date().toISOString() };
    cachedFarmers = [newFarmer, ...cachedFarmers.filter((f) => f.id !== newFarmer.id)];
    persistLocally(cachedFarmers);
    notifyListeners();
    return newFarmer;
  } catch (serverErr) {
    console.warn('[FarmerData] Server unavailable for registration, saving locally:', serverErr);
  }

  // Fallback: local-only save
  await getFarmersAsync();
  const newFarmer: Farmer = {
    ...farmer,
    id: String(Date.now()),
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
  cachedFarmers = [newFarmer, ...cachedFarmers];
  persistLocally(cachedFarmers);
  notifyListeners();
  return newFarmer;
}

/**
 * Backward-compatible synchronous add (triggers async background persistence)
 */
export function addFarmer(farmer: Omit<Farmer, 'id' | 'date'>): Farmer {
  const newFarmer: Farmer = {
    ...farmer,
    id: String(Date.now()),
    date: new Date().toISOString().split('T')[0],
    createdAt: new Date().toISOString(),
  };
  cachedFarmers = [newFarmer, ...cachedFarmers];

  // Persist in background (server + local)
  (async () => {
    try {
      await apiRegisterFarmer({
        name: farmer.name,
        village: farmer.village,
        farmSize: farmer.farmSize,
        phone: farmer.phone,
        primaryCrop: farmer.primaryCrop,
        soilType: farmer.soilType,
      });
    } catch {
      // Server unavailable — local cache already updated
    }
    persistLocally(cachedFarmers);
    notifyListeners();
  })();

  return newFarmer;
}

/**
 * Delete a farmer — removes from server and local cache.
 */
export async function deleteFarmerAsync(id: string): Promise<boolean> {
  await getFarmersAsync();
  const initialLen = cachedFarmers.length;
  cachedFarmers = cachedFarmers.filter((f) => f.id !== id);

  if (cachedFarmers.length === initialLen) return false;

  // Delete from server (best effort)
  try {
    await apiDeleteFarmer(id);
  } catch (serverErr) {
    console.warn('[FarmerData] Server delete failed (removed locally):', serverErr);
  }

  persistLocally(cachedFarmers);
  notifyListeners();
  return true;
}

/**
 * Subscribe to farmer list changes
 */
export function onFarmersChange(callback: (farmers: Farmer[]) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

// Export MOCK_FARMERS alias for backwards compatibility
export const MOCK_FARMERS = cachedFarmers;
