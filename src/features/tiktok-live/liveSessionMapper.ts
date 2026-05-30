import type { LiveHistoryItem } from "@/features/tiktok-live/types";
import { calcDurationSeconds } from "@/utils/date";
import { createId } from "@/utils/id";

export function normalizeLiveSession(payload: unknown): LiveHistoryItem {
  const data = (payload || {}) as Record<string, any>;
  const sessionId = String(data.sessionId || data.session_id || data.id || createId());
  const startedAt = String(data.startedAt || data.started_at || new Date().toISOString());
  const endedAt = data.endedAt || data.ended_at || null;

  return {
    id: sessionId,
    sessionId,
    username: String(data.username || data.tiktokUsername || ""),
    startedAt,
    endedAt,
    durationSeconds: Number(
      data.durationSeconds || data.duration_seconds || (endedAt ? calcDurationSeconds(startedAt, endedAt) : 0)
    ),
    commentCount: Number(data.commentCount || data.comment_count || 0),
    reason: data.reason,
    comments: Array.isArray(data.comments) ? data.comments : []
  };
}
