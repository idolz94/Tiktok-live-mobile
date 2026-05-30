import { DEFAULT_WS_URL } from "@/constants/config";

export function getSseBaseUrl() {
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
    return rawUrl.replace(/^ws:\/\//, "http://").replace(/^wss:\/\//, "https://").replace(/\/$/, "");
  }
}

export async function subscribeTikTokLiveApi({ clientId, username }: { clientId: string; username: string }) {
  const baseUrl = getSseBaseUrl();
  const res = await fetch(`${baseUrl}/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId, username })
  });

  if (!res.ok) throw new Error(`Subscribe failed: ${res.status}`);
  return res.json();
}

export async function stopTikTokLiveApi(clientId: string) {
  const baseUrl = getSseBaseUrl();
  const res = await fetch(`${baseUrl}/stop`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ clientId })
  });

  if (!res.ok) throw new Error(`Stop failed: ${res.status}`);
  return res.json();
}
