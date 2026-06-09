import {
  API_URL_ENDPOINT,
  MOBILE_APP_KEY,
  WEB_URL_ORIGIN,
  WEB_URL_REFERER,
} from "@constants/config";
import { getSseBaseUrl } from "@modules/tiktok-live/service/sse-api";
import { secureStorage } from "@utils/storage";
import axios, { InternalAxiosRequestConfig } from "axios";

// ────────────────────────────────────────────────
// Axios instance for SSE
// ────────────────────────────────────────────────
export const httpClient = axios.create({
  baseURL: getSseBaseUrl(),
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    "x-app-key": MOBILE_APP_KEY,
    Origin: WEB_URL_ORIGIN,
  },
});

// ────────────────────────────────────────────────
// Request interceptor
// ────────────────────────────────────────────────
httpClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await secureStorage.getAccessToken();

    config.headers.Accept = "text/event-stream";

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  async function (error) {
    console.log("🚀 ~ httpClient.interceptors.request: ~ error:", error);
    return Promise.reject(error);
  },
);

// ────────────────────────────────────────────────
// Response interceptor
// ────────────────────────────────────────────────
httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.message ?? "";

    if (
      message === "React Native Runtime is shutting down" ||
      message.includes("Runtime is shutting down")
    ) {
      return Promise.reject(error);
    }

    const status = error.response?.status;

    if (status === 401) {
      console.warn("[HTTP] 401 Unauthorized");
    } else if (status === 403) {
      console.warn("[HTTP] 403 Forbidden");
    } else if (status === 500) {
      console.error("[HTTP] 500 Internal Server Error");
    } else if (!error.response) {
      console.error("[HTTP] Network error or timeout:", message);
    }

    return Promise.reject(error);
  },
);

// ────────────────────────────────────────────────
// Axios instance for Supabase
// ────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_URL_ENDPOINT,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Origin: WEB_URL_ORIGIN,
    Referer: WEB_URL_REFERER,
  },
});

// ────────────────────────────────────────────────
// Request interceptor
// ────────────────────────────────────────────────

// Request Interceptor: Tự động đính kèm Token nếu user đã đăng nhập
apiClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

// ────────────────────────────────────────────────
// Response interceptor
// ────────────────────────────────────────────────

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.log("===== ERROR =====");
    console.log("URL:", error.config?.url);
    console.log("STATUS:", error.response?.status);
    console.log("RESPONSE:", JSON.stringify(error.response?.data, null, 2));
    console.log("HEADERS:", JSON.stringify(error.response?.headers, null, 2));
    console.log("=================");

    return Promise.reject(error);
  },
);

export default httpClient;
