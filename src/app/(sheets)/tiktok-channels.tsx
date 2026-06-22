import { useBottomSheet } from "@components/bottom-sheet/hook";
import { useAuth } from "@features/auth/hooks/use-auth";
import {
  deleteTikTokChannelApi,
  getTikTokChannelsApi,
  updateTikTokChannelApi,
} from "@features/auth/services/api";
import { AddChannel } from "@features/tiktok-live/components/add-channel";
import type { TikTokLiveChannel } from "@features/tiktok-live/components/tiktok-page";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function TikTokChannelsScreen() {
  const { hide, show } = useBottomSheet();
  const { colors } = useThemes();
  const { refreshAuth, user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [channels, setChannels] = useState<TikTokLiveChannel[]>(() =>
    (user?.tiktokChannels ?? []).map((ch) => ({
      id: ch.id,
      username: normalizeTikTokUsername(ch.tiktokUsername),
      isDefault: ch.isDefault,
    })),
  );
  const [errorText, setErrorText] = useState<string | null>(null);

  const syncChannels = useCallback(async () => {
    const data = await getTikTokChannelsApi();
    const next = data.map((ch) => ({
      id: ch.id,
      username: normalizeTikTokUsername(ch.tiktokUsername),
      isDefault: ch.isDefault,
    }));

    setChannels(next.length ? next : (user?.tiktokChannels ?? []).map((ch) => ({
      id: ch.id,
      username: normalizeTikTokUsername(ch.tiktokUsername),
      isDefault: ch.isDefault,
    })));
    return next;
  }, [user?.tiktokChannels]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await syncChannels();
      } catch (e) {
        if (mounted) setErrorText(e instanceof Error ? e.message : "Không tải được danh sách kênh");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [syncChannels]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setErrorText(null);
    try { await syncChannels(); } catch (e) {
      setErrorText(e instanceof Error ? e.message : "Không tải lại được danh sách kênh");
    } finally { setRefreshing(false); }
  }, [syncChannels]);

  const openEdit = useCallback((channel: TikTokLiveChannel) => {
    const deleteChannel = () => {
      Alert.alert("Xoá kênh", `Xoá kênh @${channel.username}?`, [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteTikTokChannelApi(channel.id);
              await syncChannels();
              await refreshAuth({ force: true });
              hide();
            } catch (e) {
              Alert.alert("Lỗi", e instanceof Error ? e.message : "Không thể xoá kênh");
            }
          },
        },
      ]);
    };

    show({
      content: (
        <AddChannel
          title="Sửa kênh TikTok"
          initialName={channel.username}
          saveTitle="Lưu"
          loadingText="Đang lưu kênh TikTok."
          cancelTitle="Huỷ"
          onClose={hide}
          onDelete={deleteChannel}
          onSave={async (nextUsername) => {
            const next = normalizeTikTokUsername(nextUsername);
            if (!next) return;
            await updateTikTokChannelApi(channel.id, { tiktokUsername: next });
            await syncChannels();
            await refreshAuth({ force: true });
            hide();
          }}
        />
      ),
      showDragIndicator: false,
    });
  }, [hide, refreshAuth, show, syncChannels]);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.screen} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <Pressable onPress={handleBack} style={styles.backButton} hitSlop={8}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.title}>Quản lý kênh TikTok</Text>
        <View style={styles.headerPlaceholder} />
      </View>

      {loading ? (
        <View style={styles.loadingWrap}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      ) : (
        <ScrollView
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        >
          {errorText ? <Text style={styles.errorText}>{errorText}</Text> : null}

          {channels.map((item) => (
            <ChannelCard
              key={item.id}
              channel={item}
              onEdit={() => openEdit(item)}
            />
          ))}

          <Text style={styles.hint}>
            Chỉ hỗ trợ sửa và xoá kênh đã liên kết.
          </Text>

          <Text style={styles.hint}>
            Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới và dấu chấm.
          </Text>

        </ScrollView>
      )}


    </SafeAreaView>
  );
}

function ChannelCard({
  channel,
  onEdit,
}: {
  channel: TikTokLiveChannel;
  onEdit: () => void;
}) {
  const { colors } = useThemes();
  return (
    <View style={styles.channelCard}>
      <View style={styles.channelAvatar}>
        <Text style={{ color: colors.neutral100, fontSize: 18, fontWeight: "700" }}>
          {channel.username.charAt(0).toUpperCase()}
        </Text>
      </View>
      <View style={styles.channelInfo}>
        <Text style={[styles.channelName, { color: colors.neutral900 }]}>{channel.username}</Text>
        <Text style={[styles.channelId, { color: colors.neutral400 }]}>ID: @{channel.username}</Text>
      </View>
      <Pressable style={styles.editButton} onPress={onEdit} hitSlop={8}>
        <Text style={[styles.editText, { color: colors.primary }]}>✎ Sửa</Text>
      </Pressable>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  screen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral50,
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: colors.neutral900,
    fontSize: 34,
    lineHeight: 34,
    marginTop: -4,
  },
  title: {
    flex: 1,
    marginHorizontal: 12,
    color: colors.neutral900,
    textAlign: "center",
    ...textPresets.fs18_500,
  },
  headerPlaceholder: {
    width: 44,
    height: 44,
    opacity: 0,
  },
  loadingWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 40,
    gap: 12,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    ...textPresets.fs14_400,
  },
  channelCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.neutral50,
    borderRadius: 16,
    padding: 12,
    gap: 12,
  },
  channelAvatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  channelInfo: {
    flex: 1,
    gap: 2,
  },
  channelName: {
    ...textPresets.fs14_500,
  },
  channelId: {
    ...textPresets.fs12_400,
  },
  editButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  editText: {
    ...textPresets.fs14_400,
  },
  hint: {
    color: colors.neutral400,
    textAlign: "center",
    ...textPresets.fs12_400,
  },
}));
