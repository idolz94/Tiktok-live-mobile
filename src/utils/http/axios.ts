import {
  API_URL_ENDPOINT,
  MOBILE_APP_KEY,
  WEB_URL_ORIGIN,
  WEB_URL_REFERER,
} from "@constants/config";
import { useAuthStore } from "@features/auth/stores";
import { refreshAccessToken } from "./auth-session";
import { secureStorage } from "@utils/storage";
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { sessionExpiredEmitter } from "./session-event";
import { ApiError } from "./api-error";

function shouldSkipRefresh(url?: string) {
  return Boolean(url?.includes("/auth/login") || url?.includes("/auth/refresh"));
}

async function clearSessionAndNotify() {
  await useAuthStore.getState().logout();
  sessionExpiredEmitter.emit();
}

// START 401 retry interceptor
// Khi gặp 401, thử refresh token một lần; nếu refresh thành công thì retry request gốc.
// Chỉ khi refresh token cũng thất bại mới gọi clearSessionAndNotify() để logout user.
function attach401RetryInterceptor(client: ReturnType<typeof axios.create>) {
  client.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      const status = error.response?.status;
      const url = error.config?.url || "";
      const originalRequest = error.config as
        | (InternalAxiosRequestConfig & { _retry?: boolean })
        | undefined;

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
            return client(originalRequest);
          }
        } catch {
          void clearSessionAndNotify();
          return Promise.reject(error);
        }

        void clearSessionAndNotify();
      }

      return Promise.reject(error);
    },
  );
}
// END 401 retry interceptor

// ────────────────────────────────────────────────
// Axios instance for API
// ────────────────────────────────────────────────

export const apiClient = axios.create({
  baseURL: API_URL_ENDPOINT,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    "x-app-key": MOBILE_APP_KEY,
    Origin: WEB_URL_ORIGIN,
    Referer: WEB_URL_REFERER,
  },
});

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

attach401RetryInterceptor(apiClient);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.log("===== API ERROR =====");
      console.log("URL:", error.config?.url);
      console.log("STATUS:", error.response?.status);
      console.log("RESPONSE:", JSON.stringify(error.response?.data, null, 2));
      console.log("=====================");
    }

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

export default apiClient;
