import {
  createProductPresetApi,
  deleteProductPresetApi,
  listProductPresetsApi,
  ProductPreset,
  updateProductPresetApi,
} from "@features/settings/service/product-presets-api";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";

type FormMode = "add" | "edit";
type FormErrors = { code?: string; price?: string };

export function formatPrice(value: number) {
  return Math.round(value || 0).toLocaleString("vi-VN");
}

export function parsePrice(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

export function useProductInfoSetup() {
  const [presets, setPresets] = useState<ProductPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formMode, setFormMode] = useState<FormMode | null>(null);
  const [selectedPreset, setSelectedPreset] = useState<ProductPreset | null>(null);
  const [draftCode, setDraftCode] = useState("");
  const [draftColor, setDraftColor] = useState("");
  const [draftPrice, setDraftPrice] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});

  const canSubmit = useMemo(
    () => draftCode.trim().length > 0 && parsePrice(draftPrice) > 0 && !saving,
    [draftCode, draftPrice, saving],
  );

  const loadPresets = useCallback(async () => {
    try {
      const data = await listProductPresetsApi();
      setPresets(data);
    } catch {
      Alert.alert("Lỗi", "Không thể tải danh sách sản phẩm.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPresets();
  }, [loadPresets]);

  const resetForm = useCallback(() => {
    setSelectedPreset(null);
    setDraftCode("");
    setDraftColor("");
    setDraftPrice("");
    setErrors({});
  }, []);

  const closeForm = useCallback(() => {
    setFormMode(null);
    resetForm();
  }, [resetForm]);

  const openAdd = useCallback(() => {
    resetForm();
    setFormMode("add");
  }, [resetForm]);

  const openEdit = useCallback(
    (preset: ProductPreset) => {
      setSelectedPreset(preset);
      setDraftCode(preset.code);
      setDraftColor(preset.color ?? "");
      setDraftPrice(preset.price > 0 ? formatPrice(preset.price) : "");
      setErrors({});
      setFormMode("edit");
    },
    [],
  );

  const handlePriceChange = useCallback(
    (value: string) => {
      const price = parsePrice(value);
      setDraftPrice(price > 0 ? formatPrice(price) : "");
      if (errors.price) {
        setErrors((current) => ({ ...current, price: undefined }));
      }
    },
    [errors.price],
  );

  const submitForm = useCallback(async () => {
    const nextErrors: FormErrors = {};
    const price = parsePrice(draftPrice);

    if (!draftCode.trim()) nextErrors.code = "Tên sản phẩm không được trống";
    if (!draftPrice.trim() || price <= 0) nextErrors.price = "Giá phải lớn hơn 0";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = { code: draftCode.trim(), color: draftColor.trim() || null, price };
      if (formMode === "add") {
        await createProductPresetApi(payload);
      } else if (formMode === "edit" && selectedPreset) {
        await updateProductPresetApi(selectedPreset.id, payload);
      }
      closeForm();
      await loadPresets();
    } catch {
      Alert.alert("Lỗi", "Thao tác thất bại. Vui lòng thử lại.");
    } finally {
      setSaving(false);
    }
  }, [draftCode, draftColor, draftPrice, formMode, selectedPreset, closeForm, loadPresets]);

  const confirmDelete = useCallback(
    (preset: ProductPreset) => {
      Alert.alert("Xoá sản phẩm?", `Bạn có chắc muốn xoá sản phẩm ${preset.code}?`, [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: async () => {
            setSaving(true);
            try {
              await deleteProductPresetApi(preset.id);
              await loadPresets();
            } catch {
              Alert.alert("Lỗi", "Không thể xoá sản phẩm.");
            } finally {
              setSaving(false);
            }
          },
        },
      ]);
    },
    [loadPresets],
  );

  return {
    presets,
    loading,
    saving,
    formMode,
    draftCode,
    draftColor,
    draftPrice,
    errors,
    canSubmit,
    setDraftCode,
    setDraftColor,
    setErrors,
    openAdd,
    openEdit,
    closeForm,
    handlePriceChange,
    submitForm,
    confirmDelete,
  };
}
