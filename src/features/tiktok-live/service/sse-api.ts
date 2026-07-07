import { DEFAULT_WS_URL } from "@constants/config";
import {
  buildApiUrl,
  getAuthToken,
  getRequest,
  postRequest,
} from "@utils/http/request-sse";

import { removeAt } from "@features/tiktok-live/utils/comment";

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
  return postRequest<any>(buildApiUrl("/live-stream/start"), {
    clientId,
    username: removeAt(username),
  });
}

export async function stopTikTokLiveApi(
  input: string | { clientId?: string; username?: string; silent?: boolean },
) {
  const username =
    typeof input === "string" ? "" : String(input.username || "").trim();
  const clientId =
    typeof input === "string" ? "" : String(input.clientId || "").trim();
  const silent = typeof input === "string" ? undefined : input.silent;

  if (!username) {
    return {
      ok: false,
      skipped: true,
      message: "Thiếu username để dừng collector.",
    };
  }

  return postRequest<any>(
    buildApiUrl("/live-stream/stop"),
    {
      clientId,
      username: removeAt(username),
      ...(silent ? { silent: true } : {}),
    },
    { timeout: 60_000 },
  );
}

export async function getLiveSessionStatusApi(_params?: {
  clientId?: string;
  username?: string;
}) {
  const result = await getRequest<{ session: unknown | null }>(
    "/live-stream/running-session",
  );
  return { active: result?.session != null };
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
