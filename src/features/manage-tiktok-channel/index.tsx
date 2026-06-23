import { ShopTikTokChannel } from "@app-types/database";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Header } from "@components/header";
import { Screen } from "@components/screen";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "@features/auth/hooks/use-auth";
import {
  deleteTikTokChannelApi,
  getTikTokChannelsApi,
  updateDefaultTiktokUsernameApi,
  updateTikTokChannelApi,
} from "@features/auth/services/api";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
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

function sortChannels(channels: ShopTikTokChannel[]) {
  return [...channels].sort(
    (a, b) => Number(b.isDefault) - Number(a.isDefault),
  );
}

function toInitial(username: string) {
  return (
    normalizeTikTokUsername(username)
      .replace(/^@/, "")
      .slice(0, 1)
      .toUpperCase() || "T"
  );
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
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
    prev.channel.isDefault === next.channel.isDefault,
);

export const ManageTiktokChannel = () => {
  const { user, refreshAuth } = useAuth();
  const { show, hide } = useBottomSheet();
  const { colors } = useThemes();

  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const initialFallbackRef = useRef(sortChannels(user?.tiktokChannels ?? []));

  const [channels, setChannels] = useState<ShopTikTokChannel[]>(
    sortChannels(user?.tiktokChannels ?? []),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const reloadChannels = useCallback(
    async (fallback: ShopTikTokChannel[] = []) => {
      const requestId = ++requestIdRef.current;

      if (isMountedRef.current) {
        setErrorText(null);
      }

      try {
        const next = sortChannels(await getTikTokChannelsApi());
        const resolved = next.length ? next : fallback;

        if (requestId === requestIdRef.current && isMountedRef.current) {
          setChannels(resolved);
        }

        return resolved;
      } catch (error) {
        if (requestId === requestIdRef.current && isMountedRef.current) {
          if (fallback.length) {
            setChannels(fallback);
          }

          setErrorText(getErrorMessage(error, "Không tải được danh sách kênh"));
        }

        return fallback;
      }
    },
    [],
  );

  useEffect(() => {
    const run = async () => {
      try {
        await reloadChannels(initialFallbackRef.current);
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    void run();
  }, [reloadChannels]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);

    try {
      await reloadChannels(channels);
    } finally {
      if (isMountedRef.current) {
        setRefreshing(false);
      }
    }
  }, [channels, reloadChannels]);

  const refreshData = useCallback(async () => {
    await refreshAuth({ force: true });

    const fallback = sortChannels(user?.tiktokChannels ?? []);

    await reloadChannels(fallback);
  }, [reloadChannels, refreshAuth, user?.tiktokChannels]);

  const usedUsernames = useMemo(
    () => new Set(channels.map((channel) => channel.tiktokUsername)),
    [channels],
  );

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

              const normalizedCurrent = normalizeTikTokUsername(
                channel.tiktokUsername,
              );

              if (normalizedNext === normalizedCurrent) {
                return;
              }

              await updateTikTokChannelApi(channel.id, {
                tiktokUsername: normalizedNext,
              });

              if (channel.isDefault) {
                await updateDefaultTiktokUsernameApi(normalizedNext);
              }

              await refreshData();
            }}
            onDelete={async () => {
              await deleteTikTokChannelApi(channel.id);

              await refreshData();
            }}
          />
        ),
      });
    },
    [hide, refreshData, show, usedUsernames],
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

            {hasChannels ? (
              <>
                <Text style={styles.hintText}>
                  Chỉ hỗ trợ sửa và xoá kênh đã liên kết.
                </Text>
                <Text style={styles.hintText}>
                  Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới
                  và dấu chấm.
                </Text>
              </>
            ) : null}
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
