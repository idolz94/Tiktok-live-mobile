import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useCallback, useMemo, useState } from "react";

const tiktokUsernamePattern = /^[A-Za-z0-9._]+$/;
import { useToast } from "@components/toast";

type Props = {
  tiktokUsername: string;
  usedUsernames: Set<string>;
  onClose: () => void;
  onSave: (nextUsername: string) => Promise<void>;
};

export function useEditChannel({ tiktokUsername, usedUsernames, onClose, onSave }: Props) {
  const [name, setName] = useState(tiktokUsername);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const currentNormalized = useMemo(
    () => normalizeTikTokUsername(tiktokUsername),
    [tiktokUsername],
  );

  const validateName = useCallback(() => {
    const nextUsername = normalizeTikTokUsername(name);

    if (!nextUsername) {
      setError("Vui lòng nhập TikTok username");
      return false;
    }

    if (!tiktokUsernamePattern.test(nextUsername)) {
      setError("ID Tiktok chỉ có thể chứa chữ không dấu, số, dấu gạch dưới và dấu chấm.");
      return false;
    }

    setError("");
    return true;
  }, [name]);

  const onSubmit = useCallback(async () => {
    const nextUsername = normalizeTikTokUsername(name);

    if (!validateName()) return;

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
      toast.error({ title: "Cập nhật thất bại", description: err instanceof Error ? err.message : "Thao tác thất bại" });
    } finally {
      setSaving(false);
    }
  }, [currentNormalized, name, onClose, onSave, toast, usedUsernames, validateName]);

  const hasChanged = normalizeTikTokUsername(name) !== currentNormalized;

  return { name, setName, setError, saving, error, onSubmit, hasChanged, validateName };
}
