import { Button } from "@components/button";
import { Icon } from "@components/icon";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useThemes } from "@hooks/use-theme";
import { HairlineWidth } from "@themes/index";
import { createStyles } from "@utils/createStyles";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, Text, TextInput, View } from "react-native";

type Props = {
  title: string;
  tiktokUsername?: string;
  usedUsernames: Set<string>;
  onClose: () => void;
  onSave: (nextUsername: string) => Promise<void>;
  onDelete?: () => Promise<void>;
};

// START EditChannel — bottom sheet form for editing TikTok channel username
export const EditChannel = ({
  title,
  tiktokUsername = "",
  usedUsernames,
  onClose,
  onSave,
  onDelete,
}: Props) => {
  const { colors } = useThemes();
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

    const hasDuplicate =
      nextUsername !== currentNormalized && usedUsernames.has(nextUsername);

    if (hasDuplicate) {
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
      Alert.alert(
        "Cập nhật thất bại",
        err instanceof Error ? err.message : "Thao tác thất bại",
      );
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
            Alert.alert(
              "Xoá thất bại",
              err instanceof Error ? err.message : "Không thể xoá kênh",
            );
          } finally {
            setDeleting(false);
          }
        },
      },
    ]);
  }, [currentNormalized, deleting, onClose, onDelete, saving]);

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>{title}</Text>
        <Pressable style={styles.btnClose} onPress={onClose}>
          <Icon name="close" size={16} tintColor={colors.neutral900} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <Text style={styles.label}>TikTok ID</Text>
        <View style={styles.inputGroup}>
          <View style={styles.inputContainer}>
            <TextInput
              placeholder="Nhập TikTok ID của bạn"
              value={name}
              onChangeText={(v) => {
                setName(v);
                setError("");
              }}
              style={styles.input}
              autoFocus
              autoCapitalize="none"
              placeholderTextColor={colors.neutral300}
            />
          </View>
          <Text style={styles.des}>
            Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới và dấu
            chấm.
          </Text>
          {!!error && <Text style={styles.errorText}>{error}</Text>}
        </View>
      </View>

      <View style={styles.actions}>
        {onDelete ? (
          <Button
            title={deleting ? "Đang xoá..." : "Xoá kênh"}
            loading={deleting}
            onPress={onConfirmDelete}
            disabled={saving || deleting}
            containerStyle={styles.btnDelete}
            txtBtnStyle={styles.btnDeleteText}
          />
        ) : null}
        <Button
          title="Lưu thay đổi"
          loading={saving}
          onPress={onSubmit}
          disabled={!name || saving || deleting}
          gradientType="gra_primary"
          containerStyle={styles.btnSave}
        />
      </View>
    </View>
  );
};
// END EditChannel

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    padding: 16,
    backgroundColor: colors.neutral100,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 20,
  },
  title: {
    flex: 1,
    textAlign: "center",
    paddingLeft: 32,
    color: colors.neutral900,
    ...textPresets.fs18_500,
  },
  btnClose: {
    width: 32,
    height: 32,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: colors.neutral50,
    alignItems: "center",
    justifyContent: "center",
  },
  body: {
    paddingVertical: 8,
    rowGap: 8,
  },
  label: {
    color: colors.neutral400,
    ...textPresets.fs14_400,
  },
  inputGroup: {
    rowGap: 4,
  },
  inputContainer: {
    borderWidth: HairlineWidth * 3,
    borderColor: colors.border10,
    borderRadius: 8,
    overflow: "hidden",
    paddingHorizontal: 16,
    paddingVertical: 13,
  },
  input: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  des: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  errorText: {
    color: colors.error,
    ...textPresets.fs12_400,
  },
  actions: {
    flexDirection: "row",
    columnGap: 12,
    marginTop: 16,
  },
  btnDelete: {
    flex: 1,
    borderRadius: 40,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: colors.border10,
  },
  btnDeleteText: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  btnSave: {
    flex: 1,
    borderRadius: 40,
    overflow: "hidden",
  },
}));
