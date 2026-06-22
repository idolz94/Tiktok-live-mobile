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
  usedUsernames: string[];
  onClose: () => void;
  onSave: (nextUsername: string) => Promise<void>;
};

// START EditChannel — bottom sheet form for editing TikTok channel username
export const EditChannel = ({
  title,
  tiktokUsername = "",
  usedUsernames,
  onClose,
  onSave,
}: Props) => {
  const { colors } = useThemes();
  const [name, setName] = useState(tiktokUsername);
  const [saving, setSaving] = useState(false);
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

    const hasDuplicate = usedUsernames.some(
      (item) =>
        normalizeTikTokUsername(item) === nextUsername &&
        normalizeTikTokUsername(item) !== currentNormalized,
    );

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

      <Button
        title="Lưu thay đổi"
        loading={saving}
        onPress={onSubmit}
        disabled={!name}
        gradientType="gra_primary"
        containerStyle={styles.btnSave}
      />
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
  btnSave: {
    borderRadius: 40,
    overflow: "hidden",
    marginTop: 16,
  },
}));
