import type { LiveHistoryItem } from "@features/tiktok-live/types";
import { loadObject, saveObject, remove, STORAGE_KEYS } from "@utils/storage";

export const readLiveHistory = async (): Promise<LiveHistoryItem[]> => {
  return loadObject<LiveHistoryItem[]>(STORAGE_KEYS.LIVE_HISTORY) ?? [];
};

export const writeLiveHistory = async (
  data: LiveHistoryItem[],
): Promise<void> => {
  saveObject(STORAGE_KEYS.LIVE_HISTORY, data);
};

export const clearLiveHistoryStorage = async (): Promise<void> => {
  remove(STORAGE_KEYS.LIVE_HISTORY);
};

export const saveHistoryItem = async (
  item: LiveHistoryItem,
): Promise<LiveHistoryItem[]> => {
  const oldHistory = await readLiveHistory();
  const existed = oldHistory.find(
    (history) => history.sessionId === item.sessionId,
  );

  const fixedItem: LiveHistoryItem = {
    ...item,
    comments:
      item.comments.length > 0 ? item.comments : existed?.comments || [],
    commentCount: Math.max(
      item.commentCount || 0,
      item.comments.length || existed?.comments?.length || 0,
    ),
  };

  const nextHistory = [
    fixedItem,
    ...oldHistory.filter((history) => history.sessionId !== item.sessionId),
  ].slice(0, 300);

  await writeLiveHistory(nextHistory);
  return nextHistory;
};
