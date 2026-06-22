import {
  createProductPresetApi,
  deleteProductPresetApi,
  listProductPresetsApi,
  ProductPreset,
  updateProductPresetApi,
} from "@features/settings/service/product-presets-api";
import { router } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FormMode = "add" | "edit";

type FormErrors = {
  code?: string;
  price?: string;
};

function formatPrice(value: number) {
  return Math.round(value || 0).toLocaleString("vi-VN");
}

function parsePrice(value: string) {
  const digits = value.replace(/[^0-9]/g, "");
  return digits ? Number(digits) : 0;
}

export default function ProductInfoSetupScreen() {
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

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const resetForm = () => {
    setSelectedPreset(null);
    setDraftCode("");
    setDraftColor("");
    setDraftPrice("");
    setErrors({});
  };

  const closeForm = () => {
    setFormMode(null);
    resetForm();
  };

  const openAdd = () => {
    resetForm();
    setFormMode("add");
  };

  const openEdit = (preset: ProductPreset) => {
    setSelectedPreset(preset);
    setDraftCode(preset.code);
    setDraftColor(preset.color ?? "");
    setDraftPrice(preset.price > 0 ? formatPrice(preset.price) : "");
    setErrors({});
    setFormMode("edit");
  };

  const handlePriceChange = (value: string) => {
    const price = parsePrice(value);
    setDraftPrice(price > 0 ? formatPrice(price) : "");
    if (errors.price) {
      setErrors((current) => ({ ...current, price: undefined }));
    }
  };

  const submitForm = async () => {
    const nextErrors: FormErrors = {};
    const price = parsePrice(draftPrice);

    if (!draftCode.trim()) {
      nextErrors.code = "Tên sản phẩm không được trống";
    }

    if (!draftPrice.trim() || price <= 0) {
      nextErrors.price = "Giá phải lớn hơn 0";
    }

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        code: draftCode.trim(),
        color: draftColor.trim() || null,
        price,
      };

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
  };

  const confirmDelete = (preset: ProductPreset) => {
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
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton} activeOpacity={0.8}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Thông tin sản phẩm</Text>
        <TouchableOpacity onPress={openAdd} style={styles.addButton} activeOpacity={0.85}>
          <Text style={styles.addIcon}>＋</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={styles.centerState}>
            <ActivityIndicator color="#ff6b8a" />
            <Text style={styles.stateText}>Đang tải danh sách sản phẩm...</Text>
          </View>
        ) : presets.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>Chưa có sản phẩm nào</Text>
            <Text style={styles.emptyDescription}>
              Thêm sản phẩm để tự động nhận diện từ comment LIVE
            </Text>
            <TouchableOpacity onPress={openAdd} style={styles.emptyButton} activeOpacity={0.85}>
              <Text style={styles.emptyButtonText}>Thêm sản phẩm</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.list}>
            {presets.map((preset, index) => (
              <View key={preset.id} style={styles.presetCard}>
                <View style={styles.indexBadge}>
                  <Text style={styles.indexText}>{index + 1}</Text>
                </View>

                <View style={styles.presetInfo}>
                  <Text style={styles.presetCode} numberOfLines={1}>
                    {preset.code}
                  </Text>
                  <Text style={styles.presetMeta} numberOfLines={1}>
                    {preset.color ? `${preset.color} · ` : ""}
                    {formatPrice(preset.price)} VNĐ
                  </Text>
                </View>

                <TouchableOpacity
                  onPress={() => openEdit(preset)}
                  style={styles.iconButton}
                  activeOpacity={0.75}
                >
                  <Text style={styles.editIcon}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmDelete(preset)}
                  style={[styles.iconButton, styles.deleteButton]}
                  activeOpacity={0.75}
                >
                  <Text style={styles.deleteIcon}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal visible={formMode !== null} transparent animationType="slide" onRequestClose={closeForm}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.modalRoot}
        >
          <TouchableOpacity style={styles.modalBackdrop} activeOpacity={1} onPress={closeForm} />
          <SafeAreaView style={styles.sheet} edges={["bottom"]}>
            <View style={styles.sheetHandle} />
            <Text style={styles.sheetTitle}>{formMode === "add" ? "Thêm sản phẩm" : "Sửa sản phẩm"}</Text>

            <View style={styles.form}>
              <View style={styles.field}>
                <Text style={styles.label}>Tên sản phẩm <Text style={styles.required}>*</Text></Text>
                <TextInput
                  value={draftCode}
                  onChangeText={(value) => {
                    setDraftCode(value);
                    if (errors.code) {
                      setErrors((current) => ({ ...current, code: undefined }));
                    }
                  }}
                  placeholder="VD: Áo thun trắng"
                  placeholderTextColor="#BDBDBD"
                  style={[styles.input, errors.code && styles.inputError]}
                />
                {errors.code ? <Text style={styles.errorText}>{errors.code}</Text> : null}
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Màu sắc</Text>
                <TextInput
                  value={draftColor}
                  onChangeText={setDraftColor}
                  placeholder="VD: Đỏ, Xanh..."
                  placeholderTextColor="#BDBDBD"
                  style={styles.input}
                />
              </View>

              <View style={styles.field}>
                <Text style={styles.label}>Giá <Text style={styles.required}>*</Text></Text>
                <View style={[styles.priceInputWrap, errors.price && styles.inputError]}>
                  <TextInput
                    value={draftPrice}
                    onChangeText={handlePriceChange}
                    placeholder="0"
                    placeholderTextColor="#BDBDBD"
                    keyboardType="number-pad"
                    style={styles.priceInput}
                  />
                  <Text style={styles.currencyText}>VNĐ</Text>
                </View>
                {errors.price ? <Text style={styles.errorText}>{errors.price}</Text> : null}
              </View>
            </View>

            <TouchableOpacity
              onPress={submitForm}
              disabled={!canSubmit}
              style={[styles.saveButton, !canSubmit && styles.saveButtonDisabled]}
              activeOpacity={0.85}
            >
              <Text style={styles.saveText}>
                {saving ? "Đang lưu..." : formMode === "add" ? "Thêm sản phẩm" : "Cập nhật"}
              </Text>
            </TouchableOpacity>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f2f2f2",
  },
  header: {
    minHeight: 64,
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#111",
    fontSize: 34,
    lineHeight: 34,
    marginTop: -4,
  },
  title: {
    flex: 1,
    textAlign: "center",
    color: "#111",
    fontSize: 18,
    fontWeight: "500",
    marginHorizontal: 12,
  },
  addButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ff6b8a",
    alignItems: "center",
    justifyContent: "center",
  },
  addIcon: {
    color: "#fff",
    fontSize: 24,
    lineHeight: 28,
  },
  content: {
    padding: 16,
    paddingBottom: 32,
  },
  centerState: {
    minHeight: 160,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  stateText: {
    color: "#787878",
    fontSize: 14,
  },
  emptyCard: {
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 18,
    paddingVertical: 32,
  },
  emptyTitle: {
    color: "#111827",
    fontSize: 16,
    fontWeight: "600",
  },
  emptyDescription: {
    color: "#787878",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },
  emptyButton: {
    marginTop: 4,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#ff6b8a",
    paddingHorizontal: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  list: {
    gap: 12,
  },
  presetCard: {
    minHeight: 72,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  indexBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffe8ef",
  },
  indexText: {
    color: "#ff6b8a",
    fontSize: 13,
    fontWeight: "700",
  },
  presetInfo: {
    flex: 1,
    minWidth: 0,
  },
  presetCode: {
    color: "#111827",
    fontSize: 14,
    fontWeight: "600",
  },
  presetMeta: {
    marginTop: 4,
    color: "#787878",
    fontSize: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f2f2",
  },
  deleteButton: {
    backgroundColor: "#fff1f1",
  },
  editIcon: {
    color: "#484848",
    fontSize: 18,
  },
  deleteIcon: {
    color: "#ef4444",
    fontSize: 24,
    lineHeight: 26,
  },
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end",
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 16,
  },
  sheetHandle: {
    alignSelf: "center",
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#d1d5db",
    marginBottom: 16,
  },
  sheetTitle: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "600",
    textAlign: "center",
  },
  form: {
    gap: 16,
    marginTop: 20,
  },
  field: {
    gap: 6,
  },
  label: {
    color: "#111827",
    fontSize: 13,
    fontWeight: "500",
  },
  required: {
    color: "#ef4444",
  },
  input: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    color: "#111",
    fontSize: 14,
    backgroundColor: "#fff",
  },
  inputError: {
    borderColor: "#ef4444",
  },
  priceInputWrap: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingHorizontal: 12,
    backgroundColor: "#fff",
  },
  priceInput: {
    flex: 1,
    padding: 0,
    color: "#111",
    fontSize: 14,
  },
  currencyText: {
    color: "#9ca3af",
    fontSize: 13,
  },
  errorText: {
    color: "#ef4444",
    fontSize: 12,
  },
  saveButton: {
    minHeight: 54,
    marginTop: 24,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffb56c",
  },
  saveButtonDisabled: {
    opacity: 0.45,
  },
  saveText: {
    color: "#111",
    fontSize: 16,
    fontWeight: "500",
  },
});
