import { DEFAULT_WS_URL } from "@constants/config";
import { secureStorage } from "@utils/storage";
import { AxiosResponse } from "axios";

import { sseClient } from "./axios";

export type RequestParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type RequestOptions = {
  headers?: Record<string, string>;
  /** Override the default axios timeout (ms) for this specific request */
  timeout?: number;
};

export async function getAuthToken() {
  try {
    return (await secureStorage.getAccessToken()) || "";
  } catch (error) {
    if (__DEV__) {
      console.error("[Request SSE] Lỗi khi lấy auth token:", error);
    }

    return "";
  }
}

export function setAuthToken(token?: string | null) {
  if (__DEV__) {
    console.warn(
      "[Request SSE] Không nên sử dụng setAuthToken trực tiếp trên Mobile. Hãy dùng useAuthStore.",
    );
  }
}

export function clearAuthToken() {
  if (__DEV__) {
    console.warn(
      "[Request SSE] Không nên sử dụng clearAuthToken trực tiếp trên Mobile. Hãy dùng useAuthStore.",
    );
  }
}

export function emitAuthChanged() {
  // Không dùng trên Mobile. Trạng thái auth được quản lý bằng Zustand.
}

function appendParams(url: string, params?: RequestParams) {
  if (!params) return url;

  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      searchParams.set(key, String(value));
    }
  });

  const queryString = searchParams.toString();

  if (!queryString) {
    return url;
  }

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

function joinUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) {
    return path;
  }

  const safePath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl) {
    return safePath;
  }

  return `${baseUrl.replace(/\/+$/, "")}/${safePath.replace(/^\/+/, "")}`;
}

export function buildApiUrl(path: string, params?: RequestParams) {
  return appendParams(joinUrl(DEFAULT_WS_URL, path), params);
}

function extractData<T>(response: AxiosResponse<any>): T {
  const result = response.data;

  if (
    result &&
    typeof result === "object" &&
    ("ok" in result || "success" in result) &&
    "data" in result
  ) {
    return result.data as T;
  }

  return result as T;
}

export async function getRequest<T>(
  path: string,
  params?: RequestParams,
  options?: RequestOptions,
): Promise<T> {
  const response = await sseClient.get(path, {
    params,
    headers: options?.headers,
  });

  return extractData<T>(response);
}

export async function postRequest<T>(
  path: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  // if (__DEV__) {
  //   console.log(`[postRequest] POST ${path}`, data);
  // }

  const response = await sseClient.post(path, data ?? {}, {
    headers: options?.headers,
    ...(options?.timeout !== undefined && { timeout: options.timeout }),
  });

  const result = extractData<T>(response);

  // if (__DEV__) {
  //   console.log(`[postRequest] Success ${path}`, result);
  // }

  return result;
}

export async function patchRequest<T>(
  path: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const response = await sseClient.patch(path, data ?? {}, {
    headers: options?.headers,
  });

  return extractData<T>(response);
}

export async function deleteRequest<T>(
  path: string,
  params?: RequestParams,
  options?: RequestOptions,
): Promise<T> {
  const response = await sseClient.delete(path, {
    params,
    headers: options?.headers,
  });

  return extractData<T>(response);
}
