import {
  API_URL_ENDPOINT,
  MOBILE_APP_KEY,
  WEB_URL_ORIGIN,
  WEB_URL_REFERER,
} from "@constants/config";
import { useAuthStore } from "@features/auth/stores";
import {
  extractAccessToken,
  extractRefreshToken,
  getStoredRefreshToken,
  refreshTokenApi,
  setStoredTokens,
} from "./auth-session";
import { secureStorage } from "@utils/storage";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { sessionExpiredEmitter } from "./session-event";
import { ApiError } from "./api-error";

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken() {
  const refreshToken = await getStoredRefreshToken();

  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await refreshTokenApi({ refreshToken });
      const nextAccessToken = extractAccessToken(response);
      const nextRefreshToken = extractRefreshToken(response);

      await setStoredTokens({
        accessToken: nextAccessToken,
        refreshToken: nextRefreshToken,
      });

      return nextAccessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}

function shouldSkipRefresh(url?: string) {
  return Boolean(url?.includes("/auth/login") || url?.includes("/auth/refresh"));
}

async function clearSessionAndNotify() {
  await useAuthStore.getState().logout();
  sessionExpiredEmitter.emit();
}

// ────────────────────────────────────────────────
// Axios instance for SSE
// ────────────────────────────────────────────────
export const sseClient = axios.create({
  baseURL: API_URL_ENDPOINT,
  withCredentials: true,
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
sseClient.interceptors.request.use(
  async (config) => {
    const token = await secureStorage.getAccessToken();

    config.headers["x-app-key"] = MOBILE_APP_KEY;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

sseClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      void clearSessionAndNotify();
    }

    throw error;
  },
);

// ────────────────────────────────────────────────
// Response interceptor
// ────────────────────────────────────────────────
sseClient.interceptors.response.use(
  (response) => {
    const data = response.data;

    if (
      data &&
      typeof data === "object" &&
      (("ok" in data && !data.ok) || ("success" in data && !data.success))
    ) {
      throw new ApiError(
        data.message || "Request failed",
        response.status,
        data,
      );
    }

    return response;
  },
  (error) => {
    if (error.response) {
      throw new ApiError(
        error.response.data?.message || error.message,
        error.response.status,
        error.response.data,
      );
    }

    throw error;
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

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    const url = error.config?.url || "";
    const originalRequest = error.config as (InternalAxiosRequestConfig & {
      _retry?: boolean;
    }) | undefined;

    if (
      status === 401 &&
      originalRequest &&
      !shouldSkipRefresh(url) &&
      !originalRequest._retry
    ) {
      originalRequest._retry = true;

      try {
        const newAccessToken = await refreshAccessToken();

        if (newAccessToken) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshError) {
        void clearSessionAndNotify();
        return Promise.reject(refreshError);
      }

      void clearSessionAndNotify();
    }

    return Promise.reject(error);
  },
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

    const status = error.response?.status;
    const url = error.config?.url || "";

    if (status === 401 && !url.includes("/auth/login")) {
      sessionExpiredEmitter.emit();
    }

    return Promise.reject(error);
  },
);

export default sseClient;
