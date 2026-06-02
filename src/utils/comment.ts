import { LiveComment } from "@app-types/index";
import { createId } from "@utils/id";

const BUYING_RE =
  /(chốt|mua|lấy|ship|đặt|bao nhiêu|ib|inbox|size|sz|màu|kg|[0-9])/i;

export function detectIntent(comment: string): "buying" | "normal" {
  return BUYING_RE.test(comment || "") ? "buying" : "normal";
}

export function normalizeComment(input: unknown): LiveComment | null {
  const data = (input || {}) as Record<string, any>;
  const text = String(data.comment || data.text || data.raw_text || "").trim();

  if (!text) return null;

  const username = String(
    data.username || data.nickname || data.uniqueId || "Unknown",
  );

  return {
    id: String(data.id || data.commentId || createId()),
    username,
    avatar: data.avatar || data.avatarUrl || data.profilePictureUrl,
    uniqueId: data.uniqueId,
    comment: text,
    text,
    raw_text: data.raw_text || text,
    intent: data.intent || detectIntent(text),
    createdAt: data.createdAt || data.created_at || new Date().toISOString(),
    created_at: data.created_at || data.createdAt || new Date().toISOString(),
  };
}

export function formatDuration(seconds: number) {
  const totalSeconds = Math.max(0, Math.floor(seconds || 0));
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  if (hours > 0) return `${hours} giờ ${minutes} phút`;
  if (minutes > 0) return `${minutes} phút ${secs} giây`;
  return `${secs} giây`;
}

export function formatDate(dateString?: string | null) {
  if (!dateString) return "";

  try {
    return new Date(dateString).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  } catch {
    return "";
  }
}

export function removeAt(username: string) {
  return String(username || "").replace(/^@/, "");
}

export function normalizeTikTokUsername(value: string) {
  const cleanValue = String(value || "").trim();
  if (!cleanValue) return "";
  return cleanValue.startsWith("@") ? cleanValue : `@${cleanValue}`;
}
