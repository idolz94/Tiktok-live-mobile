import { DEFAULT_WS_URL } from "@constants/config";

/**
 * Trả về base URL HTTP/HTTPS từ biến môi trường EXPO_PUBLIC_TIKTOK_SSE_API.
 * Tự động chuyển đổi ws:// → http:// và wss:// → https://.
 */
export function getSseBaseUrl(): string {
  const rawUrl = DEFAULT_WS_URL.trim();

  try {
    const url = new URL(rawUrl);

    if (url.protocol === "ws:") url.protocol = "http:";
    if (url.protocol === "wss:") url.protocol = "https:";

    url.pathname = "";
    url.search = "";
    url.hash = "";

    return url.toString().replace(/\/$/, "");
  } catch {
    return rawUrl
      .replace(/^ws:\/\//, "http://")
      .replace(/^wss:\/\//, "https://")
      .replace(/\/$/, "");
  }
}
