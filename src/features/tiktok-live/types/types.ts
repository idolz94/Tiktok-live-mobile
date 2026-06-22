import type { LiveComment, OrderWithTikTok } from "@app-types/index";
import { OrderManager } from "@features/orders/hooks/use-order-manager";

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

export interface CommentItemProps {
  item: LiveComment;
  onCreateOrder: (
    item: LiveComment,
  ) => Promise<{ success: boolean; orderId: string }>;
  onPrintOrder?: (item: LiveComment, orderId: string) => void;
  isCommentOrderCreated: (item: LiveComment) => boolean;
}

export type ConnectedLiveProps = {
  orderManager: OrderManager;
  onNavigateToOrders?: () => void;
  onPrintOrder?: (item: LiveComment, orderId: string) => void;
};
