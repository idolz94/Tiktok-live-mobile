import { useState } from "react";
import { useAuth } from "@features/auth/hooks/use-auth";
import { updateProfileApi } from "@features/auth/services/api";
import { useToast } from "@components/toast";

export function useEditProfile() {
  const { user, refreshAuth } = useAuth();
  const toast = useToast();

  const [fullName, setFullName] = useState(user?.fullName ?? "");
  const [phone, setPhone] = useState(user?.phone ?? "");
  const [shopName, setShopName] = useState(user?.shopName ?? "");
  const [facebookUrl, setFacebookUrl] = useState(user?.facebookUrl ?? "");
  const [tiktokUrl, setTiktokUrl] = useState(user?.tiktokUrl ?? "");
  const [youtubeUrl, setYoutubeUrl] = useState(user?.youtubeUrl ?? "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isDirty =
    fullName !== (user?.fullName ?? "") ||
    phone !== (user?.phone ?? "") ||
    shopName !== (user?.shopName ?? "") ||
    facebookUrl !== (user?.facebookUrl ?? "") ||
    tiktokUrl !== (user?.tiktokUrl ?? "") ||
    youtubeUrl !== (user?.youtubeUrl ?? "");

  const save = async () => {
    if (!isDirty || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await updateProfileApi({
        fullName: fullName || undefined,
        phone: phone || null,
        shopName: shopName || undefined,
        facebookUrl: facebookUrl || null,
        tiktokUrl: tiktokUrl || null,
        youtubeUrl: youtubeUrl || null,
      });
      await refreshAuth();
      toast.success("Cập nhật hồ sơ thành công.");
    } catch {
      toast.error("Cập nhật thất bại. Vui lòng thử lại.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    user,
    fullName,
    phone,
    shopName,
    facebookUrl,
    tiktokUrl,
    youtubeUrl,
    setFullName,
    setPhone,
    setShopName,
    setFacebookUrl,
    setTiktokUrl,
    setYoutubeUrl,
    isDirty,
    isSubmitting,
    save,
  };
}
