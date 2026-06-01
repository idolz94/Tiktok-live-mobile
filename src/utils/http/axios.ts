import axios, {
  AxiosError,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getSseBaseUrl } from "@utils/http/base-url";

// ────────────────────────────────────────────────
// Axios instance
// ────────────────────────────────────────────────
const httpClient = axios.create({
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
  (response: AxiosResponse) => response,
  (error: AxiosError) => {
    const status = error.response?.status;

    if (status === 401) {
      // TODO: handle unauthorised – e.g. clear session, navigate to login
      console.warn("[HTTP] 401 Unauthorized");
    } else if (status === 403) {
      console.warn("[HTTP] 403 Forbidden");
    } else if (status === 500) {
      console.error("[HTTP] 500 Internal Server Error");
    } else if (!error.response) {
      console.error("[HTTP] Network error or timeout:", error.message);
    }

    return Promise.reject(error);
  },
);

export default httpClient;
