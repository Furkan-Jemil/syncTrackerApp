import axios, {
  AxiosInstance,
  InternalAxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import * as SecureStore from "expo-secure-store";

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:3000/api";
const TOKEN_KEY =
  process.env.EXPO_PUBLIC_AUTH_TOKEN_STORAGE_KEY ?? "sync_tracker_token";

// ── Axios Instance ───────────────────────────
const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    apikey: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || "",
  },
});

// ── Request Interceptor — attach token ───────
apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await SecureStore.getItemAsync(TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

import useAuthStore from "@/stores/authStore";

// ── Response Interceptor — normalize errors ──
apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    // ── Diagnostic Logging ───────────────────────
    const url = error.config?.url || "";
    const status = error.response?.status;

    // suppress expected 400s on time_entries (RLS policy may deny non‑participant access)
    if (status === 400 && url.includes("/time_entries")) {
      // nothing - swallow quietly
    } else if (error.code === "ERR_NETWORK") {
      console.error(
        `[Axios Network Error] Check your connectivity or IP. Target: ${url}`,
      );
    } else {
      console.error(
        `[Axios API Error] ${error.config?.method?.toUpperCase()} ${url} -> Status: ${status}`,
      );
    }

    if (status === 401) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  },
);

export { TOKEN_KEY };
export default apiClient;
