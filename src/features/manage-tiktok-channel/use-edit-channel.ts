import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useCallback, useMemo, useState } from "react";
import { Alert } from "react-native";

type Props = {
  tiktokUsername: string;
  usedUsernames: Set<string>;
  onClose: () => void;
  onSave: (nextUsername: string) => Promise<void>;
  onDelete?: () => Promise<void>;
};

export function useEditChannel({ tiktokUsername, usedUsernames, onClose, onSave, onDelete }: Props) {
  const [name, setName] = useState(tiktokUsername);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  const currentNormalized = useMemo(
    () => normalizeTikTokUsername(tiktokUsername),
    [tiktokUsername],
  );

  const onSubmit = useCallback(async () => {
    const nextUsername = normalizeTikTokUsername(name);

    if (!nextUsername) {
      setError("Vui lòng nhập TikTok username");
      return;
    }

    if (nextUsername !== currentNormalized && usedUsernames.has(nextUsername)) {
      setError("Kênh TikTok này đã tồn tại");
      return;
    }

    if (nextUsername === currentNormalized) {
      onClose();
      return;
    }

    try {
      setSaving(true);
      await onSave(nextUsername);
      onClose();
    } catch (err) {
      Alert.alert("Cập nhật thất bại", err instanceof Error ? err.message : "Thao tác thất bại");
    } finally {
      setSaving(false);
    }
  }, [currentNormalized, name, onClose, onSave, usedUsernames]);

  const onConfirmDelete = useCallback(() => {
    if (!onDelete || deleting || saving) return;

    Alert.alert("Xoá kênh", `Xoá kênh ${currentNormalized}?`, [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: async () => {
          try {
            setDeleting(true);
            await onDelete();
            onClose();
          } catch (err) {
            Alert.alert("Xoá thất bại", err instanceof Error ? err.message : "Không thể xoá kênh");
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }, [currentNormalized, deleting, onClose, onDelete, saving]);

  return { name, setName, setError, saving, deleting, error, onSubmit, onConfirmDelete };
}
