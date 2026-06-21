import { ShopTikTokChannel } from "@app-types/database";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Header } from "@components/header";
import { Screen } from "@components/screen";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@features/auth/hooks/use-auth";
import {
  getTikTokChannelsApi,
  updateTikTokChannelApi,
} from "@features/auth/services/api";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, Text, View } from "react-native";
import Animated, { LinearTransition } from "react-native-reanimated";
import { EditChannel } from "./components/edit-channel";

// START channel helpers
function sortChannels(channels: ShopTikTokChannel[]) {
  return [...channels].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault),
  );
}

function toInitial(username: string) {
  return normalizeTikTokUsername(username)
    .replace(/^@/, "")
    .slice(0, 1)
    .toUpperCase() || "T";
}
// END channel helpers

// START ChannelCard — memoized to avoid re-render when unrelated channels update
type ChannelCardProps = {
  channel: ShopTikTokChannel;
  onEdit: (channel: ShopTikTokChannel) => void;
};

const ChannelCard = memo(({ channel, onEdit }: ChannelCardProps) => {
  const { colors } = useThemes();
  return (
    <Pressable style={styles.card} onPress={() => onEdit(channel)}>
      <View style={styles.leftItem}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{toInitial(channel.tiktokUsername)}</Text>
        </View>
        <View style={styles.textGroup}>
          <View style={styles.rowInline}>
            <Text style={styles.username}>{channel.tiktokUsername}</Text>
            {channel.isDefault ? (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Mặc định</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.subText}>Sửa tài khoản TikTok</Text>
        </View>
      </View>
      <Ionicons name="pencil-outline" size={18} color={colors.neutral900} />
    </Pressable>
  );
});
// END ChannelCard

export const ManageTiktokChannel = () => {
  const { refreshAuth } = useAuth();
  const { show, hide } = useBottomSheet();

  const [channels, setChannels] = useState<ShopTikTokChannel[]>([]);
  const [loading, setLoading] = useState(false);

  // START fetch + reload channels
  const reloadChannels = useCallback(async () => {
    setLoading(true);
    try {
      const next = await getTikTokChannelsApi();
      setChannels(sortChannels(next));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reloadChannels();
  }, [reloadChannels]);
  // END fetch + reload channels

  const usedUsernames = useMemo(
    () => channels.map((c) => c.tiktokUsername),
    [channels],
  );

  // START edit drawer — open bottom sheet, save change, reload list + auth store
  const openEditDrawer = useCallback(
    (channel: ShopTikTokChannel) => {
      show({
        showDragIndicator: false,
        content: (
          <EditChannel
            title="Sửa kênh TikTok"
            tiktokUsername={channel.tiktokUsername}
            usedUsernames={usedUsernames}
            onClose={hide}
            onSave={async (nextUsername) => {
              const normalizedNext = normalizeTikTokUsername(nextUsername);
              const normalizedCurrent = normalizeTikTokUsername(channel.tiktokUsername);

              if (normalizedNext === normalizedCurrent) return;

              await updateTikTokChannelApi(channel.id, { tiktokUsername: normalizedNext });
              await reloadChannels();
              await refreshAuth({ force: true });
            }}
          />
        ),
      });
    },
    [hide, refreshAuth, reloadChannels, show, usedUsernames],
  );
  // END edit drawer

  return (
    <Screen>
      <Header title="Quản lý kênh TikTok" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" />
          </View>
        ) : null}

        <Animated.View layout={LinearTransition} style={styles.listContainer}>
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onEdit={openEditDrawer}
            />
          ))}
        </Animated.View>
      </ScrollView>
    </Screen>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    gap: 16,
  },
  loadingWrap: {
    alignItems: "center",
    paddingVertical: 32,
  },
  listContainer: {
    gap: 12,
    paddingTop: 8,
  },
  card: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.neutral100,
  },
  leftItem: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 16,
  },
  avatarBox: {
    width: 40,
    height: 40,
    borderRadius: 99,
    backgroundColor: colors.neutral900,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: {
    color: colors.neutral100,
    ...textPresets.fs14_500,
  },
  textGroup: {
    flex: 1,
    gap: 4,
  },
  rowInline: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  username: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
    backgroundColor: colors.primaryLight,
  },
  defaultBadgeText: {
    color: colors.primary,
    ...textPresets.fs12_500,
  },
  subText: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
}));
