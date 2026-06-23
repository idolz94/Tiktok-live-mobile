import { ShopTikTokChannel } from "@app-types/database";

export type ChannelCardProps = {
  channel: ShopTikTokChannel;
  onEdit: (channel: ShopTikTokChannel) => void;
};
