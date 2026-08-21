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

export type InsightLevel = "good" | "warning" | "info";

export type LiveSessionInsight = {
  code: string;
  level: InsightLevel;
  title: string;
  detail: string;
  action?: string;
};

export type LiveSessionPace = {
  durationSeconds: number;
  commentsPerMinute: number;
  ordersPerHour: number;
  averageOrderValue: number;
};

export type LiveSessionInsights = {
  summary: string;
  pace: LiveSessionPace;
  highlights: LiveSessionInsight[];
  recommendations: string[];
};

export type LiveSessionMetricsReport = {
  metrics: unknown;
  insights: LiveSessionInsights;
};

export interface CommentItemProps {
  item: LiveComment;
  onCreateOrder: (
    item: LiveComment,
  ) => Promise<{ success: boolean; orderId: string }>;
  onPrintOrder?: (item: LiveComment, orderId: string) => void;
  isCommentOrderCreated: (item: LiveComment) => boolean;
}

export type ParsedCommentData = {
  productCode: string | null;
  color: string | null;
  size: string | null;
  quantity: number | null;
};

export type OrderRecommendationItem = {
  shopId: string;
  liveSessionId: string;
  commentId: string;
  tiktokUsername: string;
  displayName: string | null;
  matchedPreset: {
    code: string;
    name: string | null;
    color: string | null;
    price: number | null;
  };
  confidence: number;
  commentText: string | null;
  createdAt: string;
};

export type ConnectedLiveProps = {
  orderManager: OrderManager;
  onNavigateToOrders?: () => void;
  onPrintOrder?: (item: LiveComment, orderId: string) => void;
};
