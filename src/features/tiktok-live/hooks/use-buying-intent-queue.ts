import { useCallback, useMemo } from "react";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import type {
  BuyingIntentQueueItem,
  BuyingIntentQueueStatus,
} from "@features/tiktok-live/types/types";
import { updateBuyingIntentQueueStatusApi } from "@features/tiktok-live/service/buying-intent-queue-api";
import { createOrderFromCommentApi } from "@features/orders/service/api";
import type { LiveComment } from "@app-types/index";

const priorityWeight: Record<string, number> = {
  high: 3,
  medium: 2,
  low: 1,
  normal: 0,
};

export function useBuyingIntentQueue() {
  const { buyingIntentQueueItems, setBuyingIntentQueueItems } =
    useTikTokLiveSocketContext();

  const queueItems = useMemo(
    () =>
      [...buyingIntentQueueItems]
        .filter((item) => item.status === "pending")
        .sort((a, b) => {
          const priorityDiff =
            (priorityWeight[b.priorityLevel] ?? 0) -
            (priorityWeight[a.priorityLevel] ?? 0);

          if (priorityDiff !== 0) return priorityDiff;

          return (
            new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
          );
        }),
    [buyingIntentQueueItems],
  );

  const updateLocalItemStatus = useCallback(
    (itemId: string, status: BuyingIntentQueueStatus) => {
      setBuyingIntentQueueItems((current) =>
        current.map((item) =>
          item.id === itemId
            ? {
                ...item,
                status,
                handledAt:
                  status === "pending" ? null : new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              }
            : item,
        ),
      );
    },
    [setBuyingIntentQueueItems],
  );

  const handleUpdateStatus = useCallback(
    async (item: BuyingIntentQueueItem, status: BuyingIntentQueueStatus) => {
      updateLocalItemStatus(item.id, status);

      try {
        await updateBuyingIntentQueueStatusApi({ itemId: item.id, status });
      } catch (error) {
        updateLocalItemStatus(item.id, item.status);
        throw error;
      }
    },
    [updateLocalItemStatus],
  );

  const handleCreateDraftOrder = useCallback(
    async (item: BuyingIntentQueueItem) => {
      // ponytail: build synthetic comment from queue item — reuses existing order API
      const syntheticComment: LiveComment = {
        id: item.latestCommentId ?? item.id,
        dbId: item.latestCommentId ?? undefined,
        username: item.tiktokUsername,
        displayName: item.displayName ?? undefined,
        avatarUrl: item.avatarUrl ?? undefined,
        comment: item.latestCommentText ?? "",
      };

      const result = await createOrderFromCommentApi({
        comment: syntheticComment,
        liveSessionId: item.liveSessionId,
        quantity: item.parsedData?.quantity ?? undefined,
      });

      if (result.success) {
        await handleUpdateStatus(item, "handled");
      }

      return result;
    },
    [handleUpdateStatus],
  );

  return { queueItems, handleUpdateStatus, handleCreateDraftOrder };
}
