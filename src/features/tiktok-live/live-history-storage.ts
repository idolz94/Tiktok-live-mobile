import AsyncStorage from "@react-native-async-storage/async-storage";
import type { LiveHistoryItem } from "@features/tiktok-live/types";

const LIVE_HISTORY_KEY = "LIVE_HISTORY";

export async function readLiveHistory(): Promise<LiveHistoryItem[]> {
  try {
    const raw = await AsyncStorage.getItem(LIVE_HISTORY_KEY);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export async function writeLiveHistory(data: LiveHistoryItem[]) {
  await AsyncStorage.setItem(LIVE_HISTORY_KEY, JSON.stringify(data));
}

export async function clearLiveHistoryStorage() {
  await AsyncStorage.removeItem(LIVE_HISTORY_KEY);
}

export async function saveHistoryItem(item: LiveHistoryItem) {
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
}
