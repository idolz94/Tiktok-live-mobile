import { getRequest, patchRequest } from "@utils/http/request-sse";
import type { BuyingIntentQueueItem } from "../types/types";

export async function getBuyingIntentQueueApi(params?: { liveSessionId?: string }) {
  const query = params?.liveSessionId ? `?liveSessionId=${params.liveSessionId}` : "";
  return getRequest<{ items: BuyingIntentQueueItem[] }>(`/live-intent-queue${query}`);
}

export async function updateBuyingIntentQueueStatusApi({
  itemId,
  status,
}: {
  itemId: string;
  status: "pending" | "handled" | "ignored";
}) {
  return patchRequest<{ item: BuyingIntentQueueItem }>(
    `/live-intent-queue/${itemId}/status`,
    { status },
  );
}
