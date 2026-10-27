import { Platform } from "react-native";

const STORAGE_KEY = "soilhelp_api_token";

// Default API token for college project deployment
// This token is automatically used if no custom token is configured
const DEFAULT_API_TOKEN = "soilhelp_MwHdLlhvMdV4kkqpn6XWazcMJrxE7FjZ8TfCHZ5ox70";

async function getSecureStorage() {
  if (Platform.OS === "web") {
    if (typeof window === "undefined" || !window.sessionStorage) {
      throw new Error("Secure token storage is unavailable in this browser.");
    }
    return {
      getItem: async () => window.sessionStorage.getItem(STORAGE_KEY),
      setItem: async (token: string) => window.sessionStorage.setItem(STORAGE_KEY, token),
      removeItem: async () => window.sessionStorage.removeItem(STORAGE_KEY),
    };
  }

  const SecureStore = require("expo-secure-store") as typeof import("expo-secure-store");
  return {
    getItem: () => SecureStore.getItemAsync(STORAGE_KEY),
    setItem: (token: string) => SecureStore.setItemAsync(STORAGE_KEY, token),
    removeItem: () => SecureStore.deleteItemAsync(STORAGE_KEY),
  };
}

export async function getApiToken(): Promise<string | null> {
  const storage = await getSecureStorage();
  const storedToken = await storage.getItem();

  // Return stored token if available, otherwise return default token
  return storedToken || DEFAULT_API_TOKEN;
}

export async function setApiToken(token: string): Promise<void> {
  const trimmed = token.trim();
  if (!trimmed) {
    throw new Error("API token cannot be empty.");
  }
  const storage = await getSecureStorage();
  await storage.setItem(trimmed);
}

export async function clearApiToken(): Promise<void> {
  const storage = await getSecureStorage();
  await storage.removeItem();
}
