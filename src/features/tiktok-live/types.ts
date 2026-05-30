import type { LiveComment } from "@/types";

export type LiveHistoryItem = {
  id: string;
  sessionId: string;
  username: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  commentCount: number;
  reason?: string;
  comments: LiveComment[];
};
