import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getSseBaseUrl } from "@utils/http/base-url";
import { SUPABASE_ANON_KEY, SUPABASE_URL_ENDPOINT } from "@constants/config";

// ────────────────────────────────────────────────
// Axios instance for SSE
// ────────────────────────────────────────────────
export const httpClient = axios.create({
  baseURL: getSseBaseUrl(),
  timeout: 15_000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ────────────────────────────────────────────────
// Request interceptor
// ────────────────────────────────────────────────
httpClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // TODO: attach auth token if needed
    // const token = getAuthToken();
    // if (token) config.headers.Authorization = `Bearer ${token}`;
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

export const supabaseClient = axios.create({
  baseURL: SUPABASE_URL_ENDPOINT,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    apikey: SUPABASE_ANON_KEY,
    Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
  },
});

// ────────────────────────────────────────────────
// Request interceptor
// ────────────────────────────────────────────────

// Request Interceptor: Tự động đính kèm Token nếu user đã đăng nhập
supabaseClient.interceptors.request.use(
  async (config) => {
    // Giả sử bạn lưu token trong auth store hoặc AsyncStorage/MMKV
    // const token = await getAccessToken();
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // } else {
    //   config.headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
    // }
    config.headers.Authorization = `Bearer ${SUPABASE_ANON_KEY}`;
    return config;
  },
  (error) => Promise.reject(error),
);

export default httpClient;
