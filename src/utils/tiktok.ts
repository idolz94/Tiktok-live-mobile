export function cleanTikTokUsername(username?: string | null) {
  return String(username || "")
    .trim()
    .replace(/^@/, "")
    .trim();
}

export function normalizeAtUsername(username?: string | null) {
  const value = String(username || "").trim();

  if (!value) return "";

  return value.startsWith("@") ? value : `@${value}`;
}

export function getTikTokProfileUrl(username?: string | null) {
  const cleanUsername = cleanTikTokUsername(username);

  if (!cleanUsername) return "";

  return `https://www.tiktok.com/@${cleanUsername}`;
}

import { Alert, Linking } from "react-native";

export function openTikTokProfile(username?: string | null) {
  const url = getTikTokProfileUrl(username);

  if (!url) {
    Alert.alert("Không tìm thấy TikTok username của khách.");
    return;
  }

  Linking.openURL(url);
}

export function getCommentTikTokUsername(comment: any) {
  const username = String(
    comment?.customerTikTokName ||
      comment?.customer_tiktok_name ||
      comment?.customerTikTokUsername ||
      comment?.customer_tiktok_username ||
      comment?.tiktokUsername ||
      comment?.tiktok_username ||
      comment?.uniqueId ||
      comment?.unique_id ||
      comment?.tiktokUniqueId ||
      comment?.tiktok_unique_id ||
      comment?.raw?.customerTikTokName ||
      comment?.raw?.customer_tiktok_name ||
      comment?.raw?.customerTikTokUsername ||
      comment?.raw?.customer_tiktok_username ||
      comment?.raw?.tiktokUsername ||
      comment?.raw?.tiktok_username ||
      comment?.raw?.uniqueId ||
      comment?.raw?.unique_id ||
      "",
  ).trim();

  return normalizeAtUsername(username);
}

export function getOrderTikTokUsername(order: any) {
  const username = String(
    order?.customerTikTokName ||
      order?.customerTiktokUsername ||
      order?.customer_tiktok_name ||
      order?.customerTikTokUsername ||
      order?.customer_tiktok_username ||
      order?.tiktokUsername ||
      order?.tiktok_username ||
      order?.tiktokUniqueId ||
      order?.tiktok_unique_id ||
      order?.uniqueId ||
      order?.unique_id ||
      order?.customer?.tiktok_name ||
      order?.customers?.tiktok_name ||
      order?.customer?.tiktok_username ||
      order?.customers?.tiktok_username ||
      "",
  ).trim();

  return normalizeAtUsername(username);
}
