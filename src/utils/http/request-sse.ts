import {
  DEFAULT_WS_URL,
  MOBILE_APP_KEY,
  WEB_URL_ORIGIN,
} from "@constants/config";
import { secureStorage } from "@utils/storage";

export type RequestParams = Record<
  string,
  string | number | boolean | null | undefined
>;

export type RequestOptions = {
  token?: string | null;
  headers?: Record<string, string>;
  includeAuth?: boolean;
  credentials?: RequestCredentials;
};

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

export async function getAuthToken() {
  // Đọc accessToken từ secure store
  try {
    const token = await secureStorage.getAccessToken();
    return token;
  } catch (error) {
    if (__DEV__) {
      console.error(
        "[Request SSE] Lỗi khi lấy auth token từ secure store:",
        error,
      );
    }
    return "";
  }
}

export function setAuthToken(token?: string | null) {
  // Tránh ghi đè trực tiếp để không làm lệch trạng thái của Zustand useAuthStore.
  // Nếu cần thay đổi token, hãy sử dụng store login/logout.
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
  // Không dùng trên Mobile. Trạng thái auth được quản lý đồng bộ/reactive qua Zustand useAuthStore.
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
  if (!queryString) return url;

  return `${url}${url.includes("?") ? "&" : "?"}${queryString}`;
}

function joinUrl(baseUrl: string, path: string) {
  if (/^https?:\/\//i.test(path)) return path;

  const safePath = path.startsWith("/") ? path : `/${path}`;

  if (!baseUrl) return safePath;

  return `${baseUrl.replace(/\/+$/, "")}/${safePath.replace(/^\/+/, "")}`;
}

export function buildApiUrl(path: string, params?: RequestParams) {
  return appendParams(joinUrl(DEFAULT_WS_URL, path), params);
}

function buildUrl(path: string, params?: RequestParams) {
  return buildApiUrl(path, params);
}

function getErrorMessage(result: any, fallback: string) {
  return String(
    result?.message ||
      result?.error?.message ||
      result?.error ||
      result?.detail ||
      fallback,
  );
}

async function parseResponse(response: Response) {
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type") || "";

  if (contentType.includes("application/json")) {
    return response.json().catch(() => null);
  }

  const text = await response.text().catch(() => "");
  return text || null;
}

async function handleResponse<T>(response: Response): Promise<T> {
  const result = await parseResponse(response);

  if (!response.ok) {
    throw new ApiError(
      getErrorMessage(result, `API request failed: ${response.status}`),
      response.status,
      result,
    );
  }

  if (result && typeof result === "object") {
    if ("ok" in result && !result.ok) {
      throw new ApiError(
        getErrorMessage(result, "API request failed"),
        response.status,
        result,
      );
    }

    if ("success" in result && !result.success) {
      throw new ApiError(
        getErrorMessage(result, "API request failed"),
        response.status,
        result,
      );
    }

    if (("ok" in result || "success" in result) && "data" in result) {
      return result.data as T;
    }
  }

  return result as T;
}

async function buildHeaders(options?: RequestOptions, hasBody = false) {
  const token =
    options?.token ??
    (options?.includeAuth === false ? "" : await getAuthToken());

  return {
    ...(hasBody ? { "Content-Type": "application/json" } : {}),
    ...(MOBILE_APP_KEY ? { "x-app-key": MOBILE_APP_KEY } : {}),
    ...(WEB_URL_ORIGIN ? { Origin: WEB_URL_ORIGIN } : {}),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options?.headers,
  };
}

export async function getRequest<T>(
  path: string,
  params?: RequestParams,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    method: "GET",
    headers: await buildHeaders(options),
    cache: "no-store",
    credentials: options?.credentials || "include",
  });

  return handleResponse<T>(response);
}

export async function postRequest<T>(
  path: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "POST",
    headers: await buildHeaders(options, true),
    body: JSON.stringify(data || {}),
    credentials: options?.credentials || "include",
  });

  return handleResponse<T>(response);
}

export async function patchRequest<T>(
  path: string,
  data?: unknown,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(buildUrl(path), {
    method: "PATCH",
    headers: await buildHeaders(options, true),
    body: JSON.stringify(data || {}),
    credentials: options?.credentials || "include",
  });

  return handleResponse<T>(response);
}

export async function deleteRequest<T>(
  path: string,
  params?: RequestParams,
  options?: RequestOptions,
): Promise<T> {
  const response = await fetch(buildUrl(path, params), {
    method: "DELETE",
    headers: await buildHeaders(options),
    credentials: options?.credentials || "include",
  });

  return handleResponse<T>(response);
}
