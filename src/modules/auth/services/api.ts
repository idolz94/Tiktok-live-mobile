import { LoginForm, RegisterForm } from "src/schemas/auth";
import { secureStorage } from "@utils/storage";
import { phoneToAuthEmail } from "@utils/string";
import { MeBootstrapResponse } from "@stores/auth";
import {
  normalizeMeBootstrap,
  normalizeTikTokChannel,
  normalizeTikTokChannels,
} from "@stores/auth/auth-utils";
import { ShopTikTokChannel } from "@app-types/database";
import {
  CreateTikTokChannelPayload,
  UpdateTikTokChannelPayload,
} from "@app-types/payload";
import { apiClient } from "@utils/http/axios";

export const registerApi = async ({
  username: phone,
  password,
  tiktokId,
  fullName,
}: RegisterForm) => {
  const response = await apiClient.post("/auth/register", {
    defaultTikTokUsername: tiktokId,
    email: phoneToAuthEmail(phone),
    fullName,
    loginType: "phone_password",
    password,
    phone,
    shopName: `${fullName}'s Shop`,
    tiktokId: tiktokId.startsWith("@") ? tiktokId : `@${tiktokId}`,
  });
  return response.data;
};

export const loginApi = async ({
  username: phone,
  password,
  remember,
}: LoginForm) => {
  const response = await apiClient.post("/auth/login", {
    phone,
    email: phoneToAuthEmail(phone),
    password,
    remember: remember ?? true,
    loginType: "phone_password",
  });

  const payload = response.data?.data;

  const token = String(
    payload?.accessToken ||
      payload?.access_token ||
      payload?.token ||
      payload?.session?.accessToken ||
      payload?.session?.access_token ||
      "",
  ).trim();

  if (!token) {
    throw new Error("No access token received");
  }

  await secureStorage.setAccessToken(token);

  return payload;
};

export const logoutApi = async () => {
  return apiClient.post("/auth/logout");
};

const EMPTY_ME: MeBootstrapResponse = {
  user: null,
  profile: null,
  shopMember: null,
  shop: null,
  license: null,
  tiktokChannels: [],
  canUseApp: false,
  reason: "NO_USER",
};

export const getMeBootstrapApi = async (): Promise<MeBootstrapResponse> => {
  try {
    const response = await apiClient.get("/me/bootstrap");

    return normalizeMeBootstrap(response.data?.data ?? response.data);
  } catch (error: any) {
    const status = error?.status;

    if (status === 401 || status === 403) {
      return EMPTY_ME;
    }

    throw error;
  }
};

export const getTikTokChannelsApi = async (): Promise<ShopTikTokChannel[]> => {
  const response = await apiClient.get("/me/tiktok-channels");

  return normalizeTikTokChannels(response.data?.data ?? response.data);
};

export const createTikTokChannelApi = async (
  payload: CreateTikTokChannelPayload,
): Promise<ShopTikTokChannel> => {
  const response = await apiClient.post("/me/tiktok-channels", payload);

  const channel = normalizeTikTokChannel(response.data?.data ?? response.data);

  if (!channel) {
    throw new Error("Dữ liệu kênh TikTok không hợp lệ");
  }

  return channel;
};

export const updateTikTokChannelApi = async (
  channelId: string,
  payload: UpdateTikTokChannelPayload,
): Promise<ShopTikTokChannel> => {
  const response = await apiClient.patch(
    `/me/tiktok-channels/${channelId}`,
    payload,
  );

  const channel = normalizeTikTokChannel(response.data?.data ?? response.data);

  if (!channel) {
    throw new Error("Dữ liệu kênh TikTok không hợp lệ");
  }

  return channel;
};

export const deleteTikTokChannelApi = async (
  channelId: string,
): Promise<void> => {
  await apiClient.delete(`/me/tiktok-channels/${channelId}`);
};

export const updateDefaultTiktokUsernameApi = async (
  tiktokUsername: string,
): Promise<void> => {
  await apiClient.patch("/me/profile", {
    defaultTiktokUsername: tiktokUsername,
  });
};
