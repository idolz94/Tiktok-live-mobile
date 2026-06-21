import { Button } from "@components/button";
import { useAuth } from "@features/auth/hooks/use-auth";
import {
  deleteTikTokChannelApi,
  getTikTokChannelsApi,
  updateDefaultTiktokUsernameApi,
  updateTikTokChannelApi,
} from "@features/auth/services/api";
import type { TikTokLiveChannel } from "@features/tiktok-live/components/tiktok-page";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useThemes } from "@hooks/use-theme";
import { HairlineWidth } from "@themes/index";
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
  TextInput,
  View,
} from "react-native";

type EditModalState = { visible: true; channel: TikTokLiveChannel } | { visible: false };

export default function TikTokChannelsScreen() {
  useAuth();
  const { colors } = useThemes();
  const { user } = useAuth();

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

  const [editModal, setEditModal] = useState<EditModalState>({ visible: false });
  const [editDraft, setEditDraft] = useState("");
  const [editSaving, setEditSaving] = useState(false);


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
    setEditDraft(channel.username);
    setEditModal({ visible: true, channel });
  }, []);

  const closeEdit = useCallback(() => {
    setEditModal({ visible: false });
    setEditDraft("");
  }, []);

  const saveEdit = useCallback(async () => {
    if (!editModal.visible) return;
    const next = normalizeTikTokUsername(editDraft);
    if (!next) return;
    setEditSaving(true);
    try {
      await updateTikTokChannelApi(editModal.channel.id, { tiktokUsername: next });
      if (editModal.channel.isDefault) {
        await updateDefaultTiktokUsernameApi(next);
      }
      await syncChannels();
      closeEdit();
    } catch (e) {
      Alert.alert("Lỗi", e instanceof Error ? e.message : "Không thể cập nhật kênh");
    } finally {
      setEditSaving(false);
    }
  }, [editModal, editDraft, syncChannels, closeEdit]);

  const deleteChannel = useCallback(async () => {
    if (!editModal.visible) return;
    Alert.alert("Xoá kênh", `Xoá kênh @${editModal.channel.username}?`, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá", style: "destructive",
        onPress: async () => {
          try {
            await deleteTikTokChannelApi(editModal.channel.id);
            await syncChannels();
            closeEdit();
          } catch (e) {
            Alert.alert("Lỗi", e instanceof Error ? e.message : "Không thể xoá kênh");
          }
        },
      },
    ]);
  }, [editModal, syncChannels, closeEdit]);


  return (
    <View style={styles.screen}>
      {/* Top bar */}
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={8}>
          <Text style={[styles.backArrow, { color: colors.neutral900 }]}>←</Text>
        </Pressable>
        <Text style={styles.title}>Quản lý kênh Tiktok</Text>
        <View style={styles.topBarSpacer} />
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

      {/* Edit overlay */}
      {editModal.visible ? (
        <View style={styles.overlay}>
          <Pressable style={styles.overlayBackdrop} onPress={closeEdit} />
          <View style={styles.modal}>
            <Text style={styles.modalTitle}>Sửa kênh TikTok</Text>
            <Text style={styles.modalLabel}>TikTok ID</Text>
            <View style={styles.inputWrap}>
              <TextInput
                value={editDraft}
                onChangeText={setEditDraft}
                placeholder="Nhập TikTok username"
                placeholderTextColor={colors.neutral300}
                autoCapitalize="none"
                autoFocus
                style={[styles.input, { color: colors.neutral900 }]}
              />
            </View>
            <Text style={styles.hint}>
              Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới và dấu chấm.
            </Text>
            <View style={styles.modalActions}>
              <Button
                title="Xoá kênh"
                onPress={deleteChannel}
                containerStyle={styles.deleteButton}
                txtBtnStyle={styles.deleteButtonText}
              />
              <Button
                title={editSaving ? "Đang lưu..." : "Lưu"}
                onPress={saveEdit}
                disabled={!normalizeTikTokUsername(editDraft) || editSaving}
                gradientType="gra_primary"
                containerStyle={styles.saveButton}
              />
            </View>
          </View>
        </View>
      ) : null}

    </View>
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
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: colors.neutral50,
    alignItems: "center",
    justifyContent: "center",
  },
  backArrow: {
    fontSize: 20,
    fontWeight: "600",
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: colors.neutral900,
    ...textPresets.fs18_500,
  },
  topBarSpacer: {
    width: 40,
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
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "flex-end",
  },
  overlayBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
  },
  modal: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    gap: 12,
  },
  modalTitle: {
    textAlign: "center",
    color: colors.neutral900,
    ...textPresets.fs18_500,
    marginBottom: 4,
  },
  modalLabel: {
    color: colors.neutral400,
    ...textPresets.fs14_400,
  },
  inputWrap: {
    borderWidth: HairlineWidth * 3,
    borderColor: colors.border10,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  input: {
    ...textPresets.fs14_400,
  },
  modalActions: {
    flexDirection: "row",
    gap: 12,
  },
  deleteButton: {
    flex: 1,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.border10,
  },
  deleteButtonText: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  saveButton: {
    flex: 1,
    borderRadius: 40,
  },
}));
