import { DEFAULT_WS_URL } from "@constants/config";
import {
  buildApiUrl,
  getAuthToken,
  postRequest,
} from "@utils/http/request-sse";

import { removeAt } from "@utils/comment";

function appendParams(url: string, params: Record<string, string | undefined>) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });

  const query = searchParams.toString();
  if (!query) return url;

  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
}

export function getSseBaseUrl() {
  return DEFAULT_WS_URL.trim().replace(/\/+$/, "");
}

export function buildLiveStreamEventsUrl(clientId: string) {
  const url = buildApiUrl("/live-stream/events");

  return appendParams(url, {
    clientId,
  });
}

export async function subscribeTikTokLiveApi({
  clientId,
  username,
}: {
  clientId?: string;
  username: string;
}) {
  return postRequest<any>("/live-stream/start", {
    clientId,
    username: removeAt(username),
  });
}

export async function stopTikTokLiveApi(
  input: string | { clientId?: string; username?: string },
) {
  const username =
    typeof input === "string" ? "" : String(input.username || "").trim();
  const clientId =
    typeof input === "string" ? "" : String(input.clientId || "").trim();

  if (!username) {
    return {
      ok: false,
      skipped: true,
      message: "Thiếu username để dừng collector.",
    };
  }

  return postRequest<any>("/live-stream/stop", {
    clientId,
    username: removeAt(username),
  });
}

export async function sendStopBeacon({
  username,
}: {
  clientId?: string;
  username?: string;
}) {
  if (typeof navigator === "undefined") return;

  const accessToken = await getAuthToken();
  const url = appendParams(buildApiUrl("/live-stream/stop"), {
    accessToken: accessToken || undefined,
  });

  const data = JSON.stringify({ username });

  navigator.sendBeacon(
    url,
    new Blob([data], {
      type: "application/json",
    }),
  );
}
