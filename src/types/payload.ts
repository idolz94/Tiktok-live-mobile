export type CreateTikTokChannelPayload = {
  tiktokUsername: string;
  isDefault?: boolean;
};

export type UpdateTikTokChannelPayload = {
  tiktokUsername?: string;
  isDefault?: boolean;
};
