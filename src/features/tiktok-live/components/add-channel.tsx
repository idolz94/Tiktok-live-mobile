import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Button } from "@components/button";
import { Icon } from "@components/icon";
import { useThemes } from "@hooks/use-theme";
import { HairlineWidth } from "@themes/index";
import { createStyles } from "@utils/createStyles";
import { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";

type Props = {
  onClose: () => void;
  onSave: (name: string) => Promise<void>;
  onCancel?: () => void;
  title?: string;
  initialName?: string;
  saveTitle?: string;
  loadingText?: string;
  cancelTitle?: string;
  onDelete?: () => void;
};

export const AddChannel = ({
  onClose,
  onSave,
  onCancel,
  title = "Thêm mới kênh Tiktok",
  initialName = "",
  saveTitle = "Lưu và kết nối",
  loadingText = "Đang kết nối với phòng live, pop-up sẽ tự đóng khi kết nối hoàn tất.",
  cancelTitle = "Huỷ kết nối",
  onDelete,
}: Props) => {
  const { colors } = useThemes();
  const { update } = useBottomSheet();

  const [name, setName] = useState(initialName);
  const [loading, setLoading] = useState(false);
  const cancelledRef = useRef(false);

  const onAddChannel = useCallback(
    async (inputName: string) => {
      cancelledRef.current = false;
      setLoading(true);
      update({ enablePanDownToClose: false });
      try {
        await onSave(inputName);
      } finally {
        setLoading(false);
        update({ enablePanDownToClose: true });
      }
    },
    [onSave, update],
  );

  const handleCancel = useCallback(() => {
    cancelledRef.current = true;
    setLoading(false);
    update({ enablePanDownToClose: true });
    onCancel?.();
  }, [update, onCancel]);

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.connectingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.connectingText}>{loadingText}</Text>
          <Button
            title={cancelTitle}
            onPress={handleCancel}
            containerStyle={styles.btnCancel}
            txtBtnStyle={styles.txtCancel}
          />
        </View>
      ) : (
        <>
          <View style={styles.headerContainer}>
            <Text style={styles.title}>{title}</Text>
            <Pressable style={styles.btnClose} onPress={onClose}>
              <Icon name="close" size={16} tintColor={colors.neutral900} />
            </Pressable>
          </View>
          <View style={{ paddingVertical: 8, rowGap: 8 }}>
            <Text style={styles.label}>Tiktok ID</Text>
            <View style={{ rowGap: 4 }}>
              <View style={styles.inputContainer}>
                <TextInput
                  placeholder="Nhập Tiktok ID của bạn"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  autoFocus
                  autoCapitalize="none"
                  placeholderTextColor={colors.neutral300}
                />
              </View>
              <Text style={styles.des}>
                Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới và
                dấu chấm.
              </Text>
            </View>
          </View>
          <View style={styles.actions}>
            {onDelete ? (
              <Button
                title="Xoá kênh"
                onPress={onDelete}
                containerStyle={styles.btnDelete}
                txtBtnStyle={styles.txtDelete}
              />
            ) : null}
            <Button
              title={saveTitle}
              loading={false}
              onPress={() => onAddChannel(name)}
              disabled={!name}
              gradientType="gra_primary"
              containerStyle={styles.btnSave}
            />
          </View>
        </>
      )}
    </View>
  );
};

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
  label: {
    color: colors.neutral400,
    ...textPresets.fs14_400,
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
  actions: {
    flexDirection: "row",
    gap: 12,
  },
  btnSave: {
    flex: 1,
    borderRadius: 40,
    overflow: "hidden",
  },
  btnDelete: {
    flex: 1,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.border10,
  },
  txtDelete: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  connectingContainer: {
    alignItems: "center",
    paddingVertical: 32,
    gap: 16,
  },
  connectingText: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  btnCancel: {
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 40,
    borderWidth: 1,
    borderColor: colors.border10,
  },
  txtCancel: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
}));
