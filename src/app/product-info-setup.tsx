import { AnimatedErrorText } from "@components/animated-error-text";
import { router } from "expo-router";
import {
  ActivityIndicator,
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
import { formatPrice, useProductInfoSetup } from "./use-product-info-setup";

export default function ProductInfoSetupScreen() {
  const {
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
  } = useProductInfoSetup();

  const handleBack = () => {
    if (router.canGoBack()) router.back();
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
                <AnimatedErrorText message={errors.code} />
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
                <AnimatedErrorText message={errors.price} />
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
