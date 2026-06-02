import httpClient from "@utils/http/axios";
import { getSseBaseUrl } from "@utils/http/base-url";

export { getSseBaseUrl };

export async function subscribeTikTokLiveApi({
  clientId,
  username,
}: {
  clientId: string;
  username: string;
}) {
  const { data } = await httpClient.post("/subscribe", { clientId, username });
  return data;
}

export async function stopTikTokLiveApi(clientId: string) {
  const { data } = await httpClient.post("/stop", { clientId });
  return data;
}
