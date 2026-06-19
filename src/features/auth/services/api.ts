import { MeBootstrapResponse } from "@features/auth/stores";
import {
  normalizeMeBootstrap,
  normalizeTikTokChannel,
  normalizeTikTokChannels,
} from "@features/auth/stores/auth-utils";
import { ShopTikTokChannel } from "@app-types/database";
import {
  CreateTikTokChannelPayload,
  UpdateTikTokChannelPayload,
} from "@app-types/payload";
import { apiClient } from "@utils/http/axios";

export type AuthLoginPayload = {
  username: string;
  password: string;
};

export type AuthRegisterPayload = {
  username: string;
  password: string;
  fullName?: string;
  tiktokId?: string;
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
  hasOrders: false,
  hasHistory: false,
};

export const loginApi = async (payload: AuthLoginPayload) => {  return apiClient.post("/auth/login", payload);
};

export const registerApi = async (payload: AuthRegisterPayload) => {
  return apiClient.post("/auth/register", payload);
};

export const logoutApi = async () => {
  return apiClient.post("/auth/logout");
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

  const raw =
    response.data?.data?.channel ?? response.data?.data ?? response.data;
  const channel = normalizeTikTokChannel(raw);

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
    throw new Error("Update dữ liệu kênh TikTok không thành công!!");
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
