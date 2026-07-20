import { useBottomSheet } from "@components/bottom-sheet/hook";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Pressable, Text, View } from "react-native";

type Options = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function useConfirmDialog() {
  const { show, hide } = useBottomSheet();

  const confirm = ({
    title,
    message,
    confirmLabel = "Xác nhận",
    cancelLabel = "Huỷ",
    onConfirm,
    onCancel,
  }: Options) => {
    let id: string;
    const close = () => hide(id);
    id = show({
      content: (
        <ConfirmSheet
          title={title}
          message={message}
          confirmLabel={confirmLabel}
          cancelLabel={cancelLabel}
          onConfirm={() => { close(); onConfirm(); }}
          onCancel={() => { close(); onCancel?.(); }}
        />
      ),
      showDragIndicator: false,
    });
  };

  return { confirm };
}

function ConfirmSheet({
  title,
  message,
  confirmLabel,
  cancelLabel,
  onConfirm,
  onCancel,
}: Options & { onConfirm: () => void; onCancel: () => void }) {
  const { colors } = useThemes();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { color: colors.neutral900 }]}>{title}</Text>
      {message ? <Text style={[styles.message, { color: colors.neutral500 }]}>{message}</Text> : null}
      <View style={styles.buttons}>
        <Pressable style={[styles.cancelBtn, { borderColor: colors.border10 }]} onPress={onCancel}>
          <Text style={[styles.cancelText, { color: colors.neutral500 }]}>{cancelLabel}</Text>
        </Pressable>
        <Pressable style={[styles.confirmBtn, { backgroundColor: colors.error }]} onPress={onConfirm}>
          <Text style={[styles.confirmText, { color: colors.white }]}>{confirmLabel}</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles(({ textPresets }) => ({
  container: { padding: 20, gap: 12 },
  title: { ...textPresets.fs16_600 },
  message: { ...textPresets.fs14_400 },
  buttons: { flexDirection: "row", gap: 12, marginTop: 8 },
  cancelBtn: { flex: 1, padding: 14, borderRadius: 8, borderWidth: 1, alignItems: "center" },
  confirmBtn: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
  cancelText: { ...textPresets.fs14_500 },
  confirmText: { ...textPresets.fs14_500 },
}));
