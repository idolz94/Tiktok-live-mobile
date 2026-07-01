import { Alert } from "react-native";

type Options = {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel?: () => void;
};

export function useConfirmDialog() {
  const confirm = ({
    title,
    message,
    confirmLabel = "Xác nhận",
    cancelLabel = "Huỷ",
    onConfirm,
    onCancel,
  }: Options) => {
    Alert.alert(title, message, [
      { text: cancelLabel, style: "cancel", onPress: onCancel },
      { text: confirmLabel, style: "destructive", onPress: onConfirm },
    ]);
  };

  return { confirm };
}
