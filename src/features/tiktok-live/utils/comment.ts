import { LiveComment } from "@app-types/index";
import { createId } from "@utils/id";
import { getCommentTikTokUsername } from "@utils/tiktok";
import { getIntentGroup } from "../constants/intent";

export function detectIntent(comment: string): "buying" | "normal" {
  const text = comment.toLowerCase();

  const buyingKeywords = [
    "chốt",
    "mua",
    "lấy",
    "order",
    "đặt",
    "ship",
    "ib",
    "inbox",
    "size",
    "sz",
    "màu",
    "bao nhiêu",
    "còn không",
    "còn ko",
    "kg",
  ];

  return buyingKeywords.some((keyword) => text.includes(keyword))
    ? "buying"
    : "normal";
}

function toStringArray(value: unknown): string[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.map((item) => String(item)).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
}

function toNumber(value: unknown, fallback = 0) {
  const nextValue = Number(value);

  if (Number.isNaN(nextValue)) return fallback;

  return nextValue;
}

export function unwrapSseCommentPayload(input: any) {
  if (!input) return input;

  const nestedComment =
    input.comment &&
    typeof input.comment === "object" &&
    !Array.isArray(input.comment)
      ? input.comment
      : null;

  if (!nestedComment) return input;

  return {
    ...nestedComment,
    liveSessionId:
      input.liveSessionId ||
      input.live_session_id ||
      nestedComment.liveSessionId,
    dbLiveSessionId:
      input.liveSessionId ||
      input.live_session_id ||
      nestedComment.dbLiveSessionId,
    collectorSessionId:
      input.collectorSessionId || nestedComment.collectorSessionId,
    liveUsername: input.liveUsername || nestedComment.liveUsername,
    rawSsePayload: input,
  };
}

export function normalizeComment(input: any): LiveComment | null {
  if (!input) return null;

  const source = unwrapSseCommentPayload(input);
  const rawCommentValue = source.comment;
  const commentValue =
    typeof rawCommentValue === "object" && rawCommentValue !== null
      ? source.text ||
        source.commentText ||
        source.comment_text ||
        source.rawText ||
        source.raw_text
      : rawCommentValue ||
        source.text ||
        source.commentText ||
        source.comment_text ||
        source.rawText ||
        source.raw_text;

  const id = String(
    source.externalCommentId ||
      source.external_comment_id ||
      source.id ||
      source.commentId ||
      source.comment_id ||
      createId(),
  );
  const comment = String(commentValue || "").trim();

  if (!comment) return null;

  const customerTikTokUsername = getCommentTikTokUsername(source);
  const username = String(
    source.username ||
      source.displayName ||
      source.display_name ||
      customerTikTokUsername ||
      "Unknown user",
  );
  const displayName = String(
    source.displayName || source.display_name || username,
  );
  const uniqueId = String(
    source.uniqueId ||
      source.unique_id ||
      source.tiktokUniqueId ||
      source.tiktok_unique_id ||
      "",
  ).trim();
  const createdAt = String(
    source.createdAt || source.created_at || new Date().toISOString(),
  );
  const profilePicUrls =
    source.user?.profilePicture?.url ?? source.profilePicture?.url;
  const avatarFromProfilePicture = Array.isArray(profilePicUrls)
    ? profilePicUrls[0]
    : profilePicUrls;
  const avatar = String(
    source.avatar ||
      source.avatarUrl ||
      source.avatar_url ||
      source.profilePictureUrl ||
      avatarFromProfilePicture ||
      "",
  );

  return {
    id,
    username,
    displayName,
    customerTikTokUsername,
    uniqueId,
    avatar,
    avatarUrl: avatar,
    comment,
    intent: source.intent || detectIntent(comment),
    priorityLevel: source.priorityLevel || source.priority_level || "normal",
    finalScore: toNumber(source.finalScore || source.final_score, 0),
    aiScore: toNumber(source.aiScore || source.ai_score, 0),
    ruleScore: toNumber(source.ruleScore || source.rule_score, 0),
    aiStatus: source.aiStatus || source.ai_status || "none",
    aiReason: String(source.aiReason || source.ai_reason || ""),
    aiModel: source.aiModel,
    matchedReasons: toStringArray(
      source.matchedReasons || source.matched_reasons,
    ),
    missingInfo: toStringArray(source.missingInfo || source.missing_info),
    isOrderCreated: Boolean(source.isOrderCreated || source.is_order_created),
    orderId: source.orderId || source.order_id || "",
    dbId:
      source.dbId ||
      source.db_id ||
      source.liveCommentId ||
      source.live_comment_id ||
      "",
    createdAt,
    raw: source,
  };
}

export function formatDuration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  if (h > 0) return `${h} giờ ${m} phút`;
  if (m > 0) return `${m} phút ${s} giây`;
  return `${s} giây`;
}

export function formatDate(dateString?: string | null) {
  if (!dateString) return "";

  return new Date(dateString).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "2-digit",
  });
}

export function removeAt(username: string) {
  return String(username || "").replace(/^@/, "");
}

export function normalizeTikTokUsername(value: string) {
  return String(value || "").trim().replace(/^@+/, "");
}

export function isPriorityComment(comment: LiveComment) {
  const score = Number(comment.finalScore || 0);
  const intent = String(comment.intent || "").toLowerCase();
  const priorityLevel = String(comment.priorityLevel || "").toLowerCase();
  // ponytail: dùng getIntentGroup thay vì 1 mảng intent liệt kê tay — tránh lặp lại bug
  // "list bị lag so với Backend" (thiếu already_ordered/ask_product_demo/ask_how_to_buy/undecided).
  const group = getIntentGroup(intent);

  const ignoredIntents = ["normal", "spam", "unknown", "user"];

  if (ignoredIntents.includes(intent) && score < 25) {
    return false;
  }

  return (
    score >= 25 ||
    group !== "none" ||
    priorityLevel === "high" ||
    priorityLevel === "medium" ||
    priorityLevel === "low"
  );
}

export function createOrderCommentKey(comment: LiveComment) {
  const username = String(
    comment.customerTikTokUsername ||
      comment.uniqueId ||
      comment.username ||
      "",
  )
    .toLowerCase()
    .replace(/^@/, "")
    .trim();

  const text = String(comment.comment || "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

  return `${username}:${text}`;
}
