import { images } from "@assets/images";
import { Icon } from "@components/icon";
import { Image } from "@components/image";

import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { HairlineWidth } from "@themes/index";
import { createStyles } from "@utils/createStyles";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { TikTokLiveChannel } from "./tiktok-page";

type Props = {
  onClose: () => void;
  selectedChannel?: TikTokLiveChannel;
};

export const AccountConnected = memo(
  ({ onClose, selectedChannel }: Props) => {
    const { viewersCount } = useTikTokLiveSocketContext();
    return (
      <View style={styles.container}>
        <View style={styles.left}>
          <Image
            source={
              selectedChannel?.avatarUrl
                ? { uri: selectedChannel.avatarUrl, headers: { Referer: "https://www.tiktok.com/" } }
                : images.logo_app
            }
            style={styles.avatar}
          />
          <View style={{ rowGap: 2 }}>
            <Text style={styles.name}>{selectedChannel?.displayName || selectedChannel?.username || ""}</Text>
            <View style={styles.info}>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  columnGap: 4,
                }}
              >
                <Icon name="group_user" size={16} tintColor="neutral300" />
                <Text style={styles.textCount}>
                  {viewersCount > 0 ? viewersCount.toLocaleString("vi-VN") : "—"}
                </Text>
              </View>
            </View>
          </View>
        </View>
        <View style={styles.right}>
          <Pressable onPress={onClose}>
            <Icon name="disconnect" size={24} tintColor="neutral900" />
          </Pressable>
        </View>
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: HairlineWidth * 2,
    borderBottomColor: colors.border10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 99,
  },
  name: {
    color: colors.neutral900,
    ...textPresets.fs16_500,
  },
  info: {
    flexDirection: "row",
    columnGap: 12,
    alignItems: "center",
  },
  textCount: {
    color: colors.neutral300,
    ...textPresets.fs12_400,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
}));
