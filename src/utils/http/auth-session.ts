import { API_URL_ENDPOINT } from "@constants/config";
import { secureStorage } from "@utils/storage";
import axios from "axios";

const authSessionClient = axios.create({
  baseURL: API_URL_ENDPOINT,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
  },
});

const readResponseData = (response: any) => response?.data?.data ?? response?.data;

export const extractAccessToken = (response: any): string | null => {
  const data = readResponseData(response);

  if (!data) return null;

  const token =
    data.accessToken ??
    data.access_token ??
    data.token ??
    data?.session?.accessToken ??
    data?.session?.access_token ??
    data?.data?.accessToken ??
    data?.data?.access_token ??
    data?.data?.token;

  return typeof token === "string" && token.trim() ? token.trim() : null;
};

export const extractRefreshToken = (response: any): string | null => {
  const data = readResponseData(response);

  if (!data) return null;

  const token =
    data.refreshToken ??
    data.refresh_token ??
    data?.session?.refreshToken ??
    data?.session?.refresh_token ??
    data?.data?.refreshToken ??
    data?.data?.refresh_token;

  return typeof token === "string" && token.trim() ? token.trim() : null;
};

export type AuthRefreshPayload = {
  refreshToken: string;
};

export const refreshTokenApi = async (payload: AuthRefreshPayload) => {
  return authSessionClient.post("/auth/refresh", payload);
};

export const getStoredRefreshToken = async () => {
  return secureStorage.getRefreshToken();
};

export const setStoredTokens = async ({
  accessToken,
  refreshToken,
}: {
  accessToken?: string | null;
  refreshToken?: string | null;
}) => {
  if (accessToken) {
    await secureStorage.setAccessToken(accessToken);
  }

  if (refreshToken) {
    await secureStorage.setRefreshToken(refreshToken);
  }
};

let refreshPromise: Promise<string | null> | null = null;

export async function refreshAccessToken() {
  const refreshToken = await secureStorage.getRefreshToken();

  if (!refreshToken) return null;

  if (!refreshPromise) {
    refreshPromise = (async () => {
      const response = await refreshTokenApi({ refreshToken });
      const nextAccessToken = extractAccessToken(response);
      const nextRefreshToken = extractRefreshToken(response);

      if (nextAccessToken) {
        await secureStorage.setAccessToken(nextAccessToken);
      }

      if (nextRefreshToken) {
        await secureStorage.setRefreshToken(nextRefreshToken);
      }

      return nextAccessToken;
    })().finally(() => {
      refreshPromise = null;
    });
  }

  return refreshPromise;
}
