import type { LiveComment, OrderWithTikTok } from "@app-types/index";

export type UserJoinedEvent = {
  shopId?: string;
  liveUsername?: string;
  nickname?: string;
  joinUsername?: string;
  joinDisplayName?: string;
  joinAvatarUrl?: string;
  createdAt?: string;
  displayName: string;
};

export type LiveHistoryItem = {
  id: string; // DB live_sessions.id
  sessionId: string; // Python external session id
  username: string;
  startedAt: string;
  endedAt: string | null;
  durationSeconds: number;
  commentCount: number;
  orderCount?: number;
  status?: "running" | "ended" | "error" | string;
  reason?: string;
  comments: LiveComment[];
  orders?: OrderWithTikTok[];
  createdAt?: string;
  updatedAt?: string;
};
