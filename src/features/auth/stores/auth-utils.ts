import { Profile, ShopLicense, ShopTikTokChannel } from "@app-types/database";
import { AuthUser } from "@app-types/index";
import { BootstrapUser, MeBootstrapResponse } from "./auth-types";

export function isLicenseUsable(license: ShopLicense | null) {
  if (!license) return false;

  const validStatus = ["trial", "trialing", "active"].includes(
    String(license.status),
  );

  if (!validStatus) return false;

  const expiredAt = license.expired_at || license.trial_ends_at;

  if (expiredAt) {
    const expiredTime = new Date(expiredAt).getTime();

    if (Number.isNaN(expiredTime)) return false;

    if (expiredTime < Date.now()) return false;
  }

  return true;
}

export function normalizeUser(user: any): BootstrapUser | null {
  if (!user) return null;

  const metadata = user.user_metadata || user.metadata || {};

  return {
    ...user,
    id: String(user.id || user.userId || user.user_id || ""),
    email: user.email || null,
    user_metadata: {
      full_name:
        metadata.full_name ||
        metadata.fullName ||
        user.fullName ||
        user.full_name ||
        "",
      phone: metadata.phone || user.phone || "",
      tiktok_id: metadata.tiktok_id || metadata.tiktokId || user.tiktokId || "",
      default_tiktok_username:
        metadata.default_tiktok_username ||
        metadata.defaultTikTokUsername ||
        user.defaultTikTokUsername ||
        user.default_tiktok_username ||
        "",
      ...metadata,
    },
  };
}

export function normalizeProfile(
  raw: any,
  user: BootstrapUser | null,
): Profile | null {
  if (!raw && !user) return null;

  const metadata = user?.user_metadata || {};
  const source = raw || {};

  return {
    id: String(source.id || user?.id || ""),
    full_name:
      source.full_name || source.fullName || metadata.full_name || null,
    email: source.email || user?.email || null,
    phone: source.phone || metadata.phone || null,
    avatar_url: source.avatar_url || source.avatarUrl || null,
    status: source.status || "active",
    created_at:
      source.created_at || source.createdAt || new Date().toISOString(),
    updated_at:
      source.updated_at || source.updatedAt || new Date().toISOString(),
  };
}

export function normalizeTikTokChannel(raw: any): ShopTikTokChannel | null {
  if (!raw) return null;

  const id = raw.id;
  const shopId = raw.shopId || raw.shop_id;
  const tiktokUsername = raw.tiktokUsername || raw.tiktok_username;

  if (!id || !shopId || !tiktokUsername) return null;

  return {
    id: String(id),
    shopId: String(shopId),
    tiktokUsername: String(tiktokUsername),
    isDefault: Boolean(raw.isDefault ?? raw.is_default),
    createdAt: raw.createdAt || raw.created_at || new Date().toISOString(),
    updatedAt: raw.updatedAt || raw.updated_at || new Date().toISOString(),
  };
}

export function normalizeTikTokChannels(raw: any): ShopTikTokChannel[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map(normalizeTikTokChannel)
    .filter((channel): channel is ShopTikTokChannel => Boolean(channel));
}

export function normalizeMeBootstrap(raw: any): MeBootstrapResponse {
  const source = raw || {};
  const user = normalizeUser(
    source.user || source.account || source.me || (source.userId ? { id: source.userId } : null),
  );
  const profile = normalizeProfile(source.profile, user);
  const shopMember = source.shopMember || source.member || null;
  const rawShop = source.shop || null;
  const shop = rawShop
    ? {
        ...rawShop,
        default_tiktok_username:
          rawShop.default_tiktok_username ||
          rawShop.defaultTikTokUsername ||
          null,
      }
    : null;
  const license =
    source.license || source.shopLicense || source.shop_license || null;
  const tiktokChannels = normalizeTikTokChannels(
    source.tiktokChannels || source.tiktok_channels,
  );

  return {
    user,
    profile,
    shopMember,
    shop,
    license,
    tiktokChannels,
    canUseApp:
      typeof source.canUseApp === "boolean"
        ? source.canUseApp
        : isLicenseUsable(license),
    reason: source.reason || null,
    hasOrders: source.hasOrders === true,
    hasHistory: source.hasHistory === true,
  };
}

/**
 * mapBootstrapToAuthUser
 *
 * Chuyển đổi MeBootstrapResponse (raw từ GET /me/bootstrap) sang AuthUser.
 * AuthUser là format gọn dùng khắp nơi trong app — store, UI, guards.
 *
 * Tại sao tách ra hàm riêng?
 *  - Dễ unit test: cho input bất kỳ, kiểm tra output có đúng không
 *  - Tái sử dụng: cả bootstrap flow lẫn login flow đều dùng chung
 *  - Single source of truth: logic mapping chỉ ở 1 chỗ
 */
export function mapBootstrapToAuthUser(
  response: MeBootstrapResponse,
): AuthUser | null {
  const {
    user,
    profile,
    shop,
    shopMember,
    tiktokChannels,
    canUseApp,
    hasOrders,
    hasHistory,
  } = response;

  if (!user) return null;

  const metadata = user.user_metadata || {};

  return {
    id: user.id,
    email: user.email || null,
    fullName: profile?.full_name || metadata.full_name || null,
    phone: profile?.phone || metadata.phone || null,
    shopId: shop?.id ? String(shop.id) : null,
    shopName: shop?.name || null,
    tiktokUsername:
      shop?.default_tiktok_username ||
      metadata.default_tiktok_username ||
      metadata.tiktok_id ||
      null,
    tiktokChannels: tiktokChannels || [],
    role: shopMember?.role || null,
    canUseApp: canUseApp ?? false,
    hasOrders: hasOrders === true,
    hasHistory: hasHistory === true,
  };
}
