import {
  LiveComment,
  SaveLiveEndedPayload,
  SaveLiveStartedPayload,
} from "@app-types/index";
import { LiveHistoryItem } from "@features/tiktok-live/types/types";
import { normalizeApiOrderForUi } from "@features/orders/utils/order";
import { getRequest, postRequest } from "@utils/http/request-sse";
import { normalizeAtUsername } from "@utils/tiktok";

function toNumber(value: unknown) {
  const numberValue = Number(value || 0);
  return Number.isFinite(numberValue) ? numberValue : 0;
}

function calcDurationSeconds(
  startedAt?: string | null,
  endedAt?: string | null,
) {
  if (!startedAt || !endedAt) return 0;

  const start = new Date(startedAt).getTime();
  const end = new Date(endedAt).getTime();

  if (!start || !end) return 0;

  return Math.max(0, Math.floor((end - start) / 1000));
}

function pickArrayResponse(data: any, keys: string[]) {
  if (Array.isArray(data)) return data;

  for (const key of keys) {
    if (Array.isArray(data?.[key])) return data[key];
  }

  return [];
}

function pickObjectResponse(data: any, keys: string[]) {
  for (const key of keys) {
    if (data?.[key]) return data[key];
  }

  return data;
}

function mapDbLiveComment(row: any): LiveComment {
  const customerTikTokUsername = normalizeAtUsername(
    row?.tiktokUsername ||
      row?.tiktok_username ||
      row?.customerTikTokName ||
      row?.customer_tiktok_name ||
      row?.customerTikTokUsername ||
      row?.customer_tiktok_username,
  );
  const comment = String(
    row?.comment || row?.commentText || row?.comment_text || row?.text || "",
  );

  return {
    id: String(
      row?.externalCommentId || row?.external_comment_id || row?.id || "",
    ),
    dbId: String(row?.dbId || row?.id || ""),
    username: String(
      row?.displayName ||
        row?.display_name ||
        customerTikTokUsername ||
        "Khách live",
    ),
    displayName: String(
      row?.displayName ||
        row?.display_name ||
        customerTikTokUsername ||
        "Khách live",
    ),
    customerTikTokUsername,
    uniqueId: customerTikTokUsername.replace("@", ""),
    avatar: String(row?.avatarUrl || row?.avatar_url || row?.avatar || ""),
    avatarUrl: String(row?.avatarUrl || row?.avatar_url || row?.avatar || ""),
    comment,
    intent: row?.intent || "normal",
    priorityLevel: row?.priorityLevel || row?.priority_level || "normal",
    finalScore: toNumber(row?.finalScore || row?.final_score),
    isOrderCreated: Boolean(row?.isOrderCreated || row?.is_order_created),
    orderId: row?.orderId || row?.order_id || "",
    createdAt: row?.createdAt || row?.created_at || new Date().toISOString(),
    raw: row,
  } as LiveComment;
}

export function mapDbLiveSession(row: any): LiveHistoryItem {
  const startedAt =
    row?.startedAt ||
    row?.started_at ||
    row?.createdAt ||
    row?.created_at ||
    new Date().toISOString();
  const rawEndedAt = row?.endedAt || row?.ended_at || null;
  const durationSecondsRaw = toNumber(
    row?.durationSeconds || row?.duration_seconds,
  );
  const endedAt =
    rawEndedAt ||
    (durationSecondsRaw > 0
      ? new Date(
          new Date(startedAt).getTime() + durationSecondsRaw * 1000,
        ).toISOString()
      : null);

  const comments = Array.isArray(row?.comments)
    ? row.comments.map(mapDbLiveComment)
    : [];

  const orders = Array.isArray(row?.orders)
    ? row.orders.map(normalizeApiOrderForUi)
    : [];

  return {
    id: String(
      row?.dbLiveSessionId || row?.db_live_session_id || row?.id || "",
    ),
    sessionId: String(
      row?.sessionId ||
        row?.session_id ||
        row?.externalSessionId ||
        row?.external_session_id ||
        row?.id ||
        "",
    ),
    username: normalizeAtUsername(
      row?.username || row?.tiktokUsername || row?.tiktok_username,
    ),
    startedAt,
    endedAt,
    durationSeconds:
      durationSecondsRaw || calcDurationSeconds(startedAt, endedAt),
    commentCount: toNumber(
      row?.commentCount || row?.comment_count || comments.length,
    ),
    orderCount: toNumber(row?.orderCount || row?.order_count || orders.length),
    status: row?.status || "ended",
    reason: row?.reason || row?.endReason || row?.end_reason || "",
    comments,
    orders,
    createdAt: row?.createdAt || row?.created_at || startedAt,
    updatedAt: row?.updatedAt || row?.updated_at || "",
  };
}

function shouldShowLiveSession(session: LiveHistoryItem) {
  const durationSeconds = Number(session.durationSeconds || 0);
  const commentCount = Number(
    session.commentCount || session.comments?.length || 0,
  );
  const orderCount = Number(session.orderCount || session.orders?.length || 0);

  return durationSeconds > 0 || commentCount > 0 || orderCount > 0;
}

export async function getLiveHistoryApi(limit = 100) {
  const data = await getRequest<any>("/live-sessions/history", { limit });
  const rows = pickArrayResponse(data, [
    "sessions",
    "history",
    "items",
    "data",
  ]);

  return rows.map(mapDbLiveSession).filter(shouldShowLiveSession);
}

export async function saveLiveSessionStartedApi({
  sessionId,
  username,
  startedAt,
}: SaveLiveStartedPayload) {
  const externalSessionId = String(sessionId || "").trim();

  if (!externalSessionId) {
    throw new Error("Thiếu sessionId.");
  }

  const data = await postRequest<any>("/live-sessions/started", {
    sessionId: externalSessionId,
    username: normalizeAtUsername(username),
    startedAt,
  });

  return mapDbLiveSession(
    pickObjectResponse(data, ["session", "liveSession", "item"]),
  );
}

export async function saveLiveSessionEndedApi({
  sessionId,
  username,
  startedAt,
  endedAt,
  durationSeconds,
  commentCount = 0,
  reason = "live_ended",
}: SaveLiveEndedPayload) {
  const externalSessionId = String(sessionId || "").trim();

  if (!externalSessionId) {
    throw new Error("Thiếu sessionId.");
  }

  const data = await postRequest<any>("/live-sessions/ended", {
    sessionId: externalSessionId,
    username: normalizeAtUsername(username),
    startedAt,
    endedAt,
    durationSeconds,
    commentCount,
    reason,
  });

  return mapDbLiveSession(
    pickObjectResponse(data, ["session", "liveSession", "item"]),
  );
}
