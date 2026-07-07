import { ShopTikTokChannel } from "@app-types/database";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Header } from "@components/header";
import { Screen } from "@components/screen";
import { Ionicons } from "@expo/vector-icons";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { EditChannel } from "./components/edit-channel";
import { ChannelCardProps } from "./type";
import { useManageTiktokChannel } from "./use-manage-tiktok-channel";

function toInitial(username: string) {
  return (
    normalizeTikTokUsername(username)
      .replace(/^@/, "")
      .slice(0, 1)
      .toUpperCase() || "T"
  );
}

const ChannelCard = memo(
  ({ channel, onEdit }: ChannelCardProps) => {
    const { colors } = useThemes();
    const handlePress = useCallback(() => {
      onEdit(channel);
    }, [channel, onEdit]);

    return (
      <Pressable style={styles.card} onPress={handlePress}>
        <View style={styles.leftItem}>
          <View style={styles.avatarBox}>
            <Text style={styles.avatarText}>
              {toInitial(channel.tiktokUsername)}
            </Text>
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
  },
  (prev, next) =>
    prev.channel.id === next.channel.id &&
    prev.channel.tiktokUsername === next.channel.tiktokUsername &&
    prev.channel.displayName === next.channel.displayName &&
    prev.channel.avatarUrl === next.channel.avatarUrl &&
    prev.channel.isDefault === next.channel.isDefault,
);

export const ManageTiktokChannel = () => {
  const { show, hide } = useBottomSheet();
  const { colors } = useThemes();
  const {
    channels,
    loading,
    refreshing,
    errorText,
    usedUsernames,
    onRefresh,
    saveChannel,
  } = useManageTiktokChannel();

  const openEditDrawer = useCallback(
    (channel: ShopTikTokChannel) => {
      show({
        showDragIndicator: false,
        enablePanDownToClose: false,
        content: (
          <EditChannel
            title="Sửa kênh TikTok"
            tiktokUsername={channel.tiktokUsername}
            usedUsernames={usedUsernames}
            onClose={hide}
            onSave={(nextUsername) => saveChannel(channel, nextUsername)}
          />
        ),
      });
    },
    [hide, saveChannel, show, usedUsernames],
  );

  const hasChannels = channels.length > 0;

  return (
    <Screen>
      <Header title="Quản lý kênh TikTok" />
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
          />
        }
      >
        {loading ? (
          <View style={styles.loadingWrap}>
            <ActivityIndicator size="small" color={colors.primary} />
          </View>
        ) : (
          <>
            {errorText ? (
              <Text style={styles.errorText}>{errorText}</Text>
            ) : null}

            {!hasChannels ? (
              <View style={styles.emptyWrap}>
                <Text style={styles.emptyTitle}>Chưa có kênh TikTok</Text>
                <Text style={styles.hintText}>
                  Kênh đã liên kết sẽ hiển thị tại đây để bạn sửa hoặc xoá.
                </Text>
              </View>
            ) : null}

            <View style={styles.listContainer}>
              {channels.map((channel) => (
                <ChannelCard
                  key={channel.id}
                  channel={channel}
                  onEdit={openEditDrawer}
                />
              ))}
            </View>

            {/* {hasChannels ? (
              <>
                <Text style={styles.hintText}>
                  Chỉ hỗ trợ sửa và xoá kênh đã liên kết.
                </Text>
                <Text style={styles.hintText}>
                  Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới
                  và dấu chấm.
                </Text>
              </>
            ) : null} */}
          </>
        )}
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
  errorText: {
    color: colors.error,
    textAlign: "center",
    ...textPresets.fs14_400,
  },
  emptyWrap: {
    alignItems: "center",
    paddingVertical: 40,
    rowGap: 8,
  },
  emptyTitle: {
    color: colors.neutral900,
    ...textPresets.fs16_500,
  },
  hintText: {
    color: colors.neutral400,
    textAlign: "center",
    ...textPresets.fs12_400,
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
