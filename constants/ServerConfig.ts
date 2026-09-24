import { Platform } from 'react-native';

const STORAGE_KEY = '@soilhelp_server_url';
export const DEFAULT_WEB_URL = 'http://localhost:8000';
export const DEFAULT_DEVICE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://10.70.2.26:8000';

export function getDefaultServerUrl(): string {
  return Platform.OS === 'web' ? DEFAULT_WEB_URL : DEFAULT_DEVICE_URL;
}

// In-memory cache for fast synchronous reads when needed
let cachedServerUrl: string | null = null;
const listeners = new Set<(newUrl: string) => void>();

/**
 * Get the storage adapter safely across Native and Web
 */
async function getStorage(): Promise<{
  getItem: (k: string) => Promise<string | null>;
  setItem: (k: string, v: string) => Promise<void>;
  removeItem: (k: string) => Promise<void>;
}> {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
    return {
      getItem: async (k) => window.localStorage.getItem(k),
      setItem: async (k, v) => window.localStorage.setItem(k, v),
      removeItem: async (k) => window.localStorage.removeItem(k),
    };
  }

  try {
    const AsyncStorage = require('@react-native-async-storage/async-storage').default;
    return AsyncStorage;
  } catch {
    return {
      getItem: async () => null,
      setItem: async () => {},
      removeItem: async () => {},
    };
  }
}

/**
 * Get current configured backend base URL
 */
export async function getServerBaseUrl(): Promise<string> {
  if (cachedServerUrl) {
    return cachedServerUrl;
  }

  try {
    const storage = await getStorage();
    const saved = await storage.getItem(STORAGE_KEY);
    if (saved && saved.trim()) {
      cachedServerUrl = sanitizeUrl(saved.trim());
      return cachedServerUrl;
    }
  } catch (err) {
    console.warn('[ServerConfig] Failed to read saved server URL:', err);
  }

  cachedServerUrl = getDefaultServerUrl();
  return cachedServerUrl;
}

/**
 * Synchronous read of currently cached URL (falls back to default)
 */
export function getCachedServerUrl(): string {
  return cachedServerUrl || getDefaultServerUrl();
}

/**
 * Persist and update active server URL
 */
export async function setServerBaseUrl(newUrl: string): Promise<string> {
  const sanitized = sanitizeUrl(newUrl);
  cachedServerUrl = sanitized;

  try {
    const storage = await getStorage();
    await storage.setItem(STORAGE_KEY, sanitized);
  } catch (err) {
    console.warn('[ServerConfig] Failed to save server URL:', err);
  }

  listeners.forEach((listener) => {
    try {
      listener(sanitized);
    } catch (e) {
      console.error('[ServerConfig] Error in URL change listener:', e);
    }
  });

  return sanitized;
}

/**
 * Reset server URL back to system default
 */
export async function resetServerBaseUrl(): Promise<string> {
  const defaultUrl = getDefaultServerUrl();
  cachedServerUrl = defaultUrl;

  try {
    const storage = await getStorage();
    await storage.removeItem(STORAGE_KEY);
  } catch (err) {
    console.warn('[ServerConfig] Failed to reset server URL:', err);
  }

  listeners.forEach((listener) => listener(defaultUrl));
  return defaultUrl;
}

/**
 * Subscribe to server URL changes
 */
export function onServerUrlChange(callback: (newUrl: string) => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

/**
 * Clean URL formatting (removes trailing slash, adds http:// if missing)
 */
export function sanitizeUrl(url: string): string {
  let clean = url.trim();
  if (!clean.startsWith('http://') && !clean.startsWith('https://')) {
    clean = `http://${clean}`;
  }
  if (clean.endsWith('/')) {
    clean = clean.slice(0, -1);
  }
  return clean;
}

/**
 * Test connectivity against a target server URL
 */
export async function testServerConnection(targetUrl?: string): Promise<{
  ok: boolean;
  latencyMs: number;
  message: string;
}> {
  const urlToTest = sanitizeUrl(targetUrl || (await getServerBaseUrl()));
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);

    const response = await fetch(`${urlToTest}/health`, {
      method: 'GET',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const latencyMs = Date.now() - startTime;

    if (response.ok) {
      return {
        ok: true,
        latencyMs,
        message: `Connected successfully (${latencyMs}ms)`,
      };
    } else {
      return {
        ok: false,
        latencyMs,
        message: `Server returned HTTP ${response.status}`,
      };
    }
  } catch (err: any) {
    const latencyMs = Date.now() - startTime;
    let message = 'Could not reach server';

    if (err?.name === 'AbortError') {
      message = 'Connection timed out (>4s)';
    } else if (err?.message) {
      message = err.message;
    }

    return {
      ok: false,
      latencyMs,
      message,
    };
  }
}

/**
 * Common presets for quick developer/user setup
 */
export const PRESET_SERVER_URLS = [
  { label: 'Localhost (Web / iOS Sim)', url: 'http://localhost:8000' },
  { label: 'Android Emulator (10.0.2.2)', url: 'http://10.0.2.2:8000' },
  { label: 'This PC (10.70.2.26)', url: 'http://10.70.2.26:8000' },
  { label: 'Custom LAN IP', url: 'http://192.168.1.10:8000' },
];
