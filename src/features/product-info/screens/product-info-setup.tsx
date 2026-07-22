import { router } from "expo-router";
import { AnimatedErrorText } from "@components/animated-error-text";
import { Button } from "@components/button";
import { Icon } from "@components/icon";
import { LinearGradient } from "@components/linear-gradient";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { useToast } from "@components/toast";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  formatPrice,
  parsePrice,
  useProductInfoSetup,
} from "@features/product-info/use-product-info-setup";
import { useCallback, useState } from "react";
import { createStyles } from "@utils/createStyles";
import { ProductPreset } from "@features/settings/service/product-presets-api";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type FormErrors = { code?: string; price?: string };

type ProductFormProps = {
  mode: "add" | "edit";
  presetId?: string;
  initialCode: string;
  initialName: string;
  initialColor: string;
  initialPrice: string;
  onClose: () => void;
  onSave: (
    payload: {
      code: string;
      name?: string | null;
      color: string | null;
      price: number;
    },
    mode: "add" | "edit",
    presetId?: string,
  ) => Promise<void>;
};

function ProductForm({
  mode,
  presetId,
  initialCode,
  initialName,
  initialColor,
  initialPrice,
  onClose,
  onSave,
}: ProductFormProps) {
  const toast = useToast();
  const [code, setCode] = useState(initialCode);
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [price, setPrice] = useState(initialPrice);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  // ponytail: local form state — stable mount prevents IME composing state loss on Vietnamese input

  const parsedPrice = parsePrice(price);
  const hasChanged =
    mode === "add" ||
    code.trim() !== initialCode.trim() ||
    name.trim() !== initialName.trim() ||
    color.trim() !== initialColor.trim() ||
    parsedPrice !== parsePrice(initialPrice);
  const canSubmit =
    code.trim().length > 0 && parsedPrice > 0 && hasChanged && !saving;

  const handlePriceChange = (value: string) => {
    const p = parsePrice(value);
    setPrice(p > 0 ? formatPrice(p) : "");
    if (errors.price) setErrors((e) => ({ ...e, price: undefined }));
  };

  const handleSubmit = async () => {
    const next: FormErrors = {};
    if (!code.trim()) next.code = "Mã SP không được trống";
    if (!price.trim() || parsedPrice <= 0) next.price = "Giá phải lớn hơn 0";
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }

    setSaving(true);
    try {
      await onSave(
        {
          code: code.trim(),
          name: name.trim() || null,
          color: color.trim() || null,
          price: parsedPrice,
        },
        mode,
        presetId,
      );
      setSaving(false);
      onClose();
      toast(
        mode === "add" ? "Đã thêm sản phẩm" : "Đã cập nhật sản phẩm",
        "success",
      );
    } catch {
      setSaving(false);
      toast("Thao tác thất bại. Vui lòng thử lại.", "error");
    }
  };

  return (
    <View style={styles.sheet}>
      <View style={styles.sheetTitleRow}>
        <Text style={styles.sheetTitle}>
          {mode === "add" ? "Thêm sản phẩm" : "Sửa sản phẩm"}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          style={styles.sheetCloseButton}
          activeOpacity={0.75}
        >
          <Text style={styles.sheetCloseText}>×</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>
            Mã SP <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            value={code}
            onChangeText={(v) => {
              setCode(v);
              if (errors.code) setErrors((e) => ({ ...e, code: undefined }));
            }}
            placeholder="VD: SP001"
            placeholderTextColor="#BDBDBD"
            style={[styles.input, errors.code && styles.inputError]}
            autoCapitalize="characters"
          />
          <AnimatedErrorText message={errors.code} />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tên sản phẩm</Text>
          <TextInput
            value={name}
            onChangeText={setName}
            placeholder="VD: Áo thun trắng"
            placeholderTextColor="#BDBDBD"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Màu sắc</Text>
          <TextInput
            value={color}
            onChangeText={setColor}
            placeholder="VD: Đỏ, Xanh..."
            placeholderTextColor="#BDBDBD"
            style={styles.input}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>
            Giá <Text style={styles.required}>*</Text>
          </Text>
          <View
            style={[styles.priceInputWrap, errors.price && styles.inputError]}
          >
            <TextInput
              value={price}
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

      <View style={styles.actions}>
        <Button
          title={
            saving
              ? "Đang lưu..."
              : mode === "add"
                ? "Thêm sản phẩm"
                : "Cập nhật"
          }
          loading={saving}
          onPress={handleSubmit}
          disabled={!canSubmit}
          gradientType="gra_primary"
          containerStyle={styles.btnSave}
        />
      </View>
    </View>
  );
}

// Di chuyển từ src/app/product-info-setup.tsx sang feature theo cấu trúc route-mỏng/feature-dày
// (PROJECT_GUIDE mục 4 & 8): route giờ chỉ là wrapper mỏng render screen này qua named export.
export function ProductInfoSetupScreen() {
  const { top } = useSafeAreaInsets();
  const { show, hide } = useBottomSheet();
  const {
    presets,
    loading,
    saving,
    openAdd: hookOpenAdd,
    openEdit: hookOpenEdit,
    closeForm,
    savePreset,
    confirmDelete,
  } = useProductInfoSetup();

  const showForm = useCallback(
    (mode: "add" | "edit", preset?: ProductPreset) => {
      const draftCode = preset?.code ?? "";
      const draftName = preset?.name ?? "";
      const draftColor = preset?.color ?? "";
      const draftPrice =
        preset && preset.price > 0 ? formatPrice(preset.price) : "";

      if (mode === "add") hookOpenAdd();
      else if (preset) hookOpenEdit(preset);

      show({
        showDragIndicator: false,
        enablePanDownToClose: false,
        content: (
          <ProductForm
            mode={mode}
            presetId={preset?.id}
            initialCode={draftCode}
            initialName={draftName}
            initialColor={draftColor}
            initialPrice={draftPrice}
            onClose={() => {
              hide();
              closeForm();
            }}
            onSave={savePreset}
          />
        ),
      });
    },
    [show, hide, hookOpenAdd, hookOpenEdit, closeForm, savePreset],
  );

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backButton}
          hitSlop={8}
        >
          <Text style={styles.backButtonText}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Thông tin sản phẩm</Text>
        <Pressable
          style={styles.headerButton}
          onPress={() => showForm("add")}
          hitSlop={8}
        >
          <Icon name="plus_circle" size={20} tintColor="#000000" />
        </Pressable>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
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
            <TouchableOpacity
              onPress={() => showForm("add")}
              style={styles.emptyButton}
              activeOpacity={0.85}
            >
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
                    {preset.name ? ` - ${preset.name}` : ""}
                    {preset.color ? ` (${preset.color})` : ""}
                  </Text>
                  <Text style={styles.presetMeta} numberOfLines={1}>
                    {formatPrice(preset.price)} VNĐ
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => showForm("edit", preset)}
                  style={styles.iconButton}
                  activeOpacity={0.75}
                >
                  <Text style={styles.editIcon}>✎</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => confirmDelete(preset)}
                  style={[styles.iconButton, styles.deleteButton]}
                  activeOpacity={0.75}
                  disabled={saving}
                >
                  <Text style={styles.deleteIcon}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  root: { flex: 1 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  header: {
    minHeight: 119,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.white,
  },
  backButtonText: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 32,
    fontWeight: "300" as const,
  },
  headerTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "600" as const,
    lineHeight: 28,
    flex: 1,
    textAlign: "center" as const,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.white,
  },
  // --- ProductForm ---
  sheet: {
    padding: 16,
    backgroundColor: colors.neutral100,
  },
  sheetTitleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingBottom: 20,
  },
  sheetTitle: {
    flex: 1,
    textAlign: "center" as const,
    paddingLeft: 32,
    color: colors.neutral900,
    ...textPresets.fs18_500,
  },
  sheetCloseButton: {
    width: 32,
    height: 32,
    borderRadius: 99,
    backgroundColor: colors.neutral50,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sheetCloseText: { fontSize: 20, lineHeight: 26, color: colors.neutral900 },
  form: { rowGap: 16 },
  field: { rowGap: 8 },
  label: { color: colors.neutral400, ...textPresets.fs14_400 },
  required: { color: colors.primary },
  input: {
    borderWidth: 1,
    borderColor: colors.border10,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 13,
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  inputError: { borderColor: colors.error },
  priceInputWrap: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    borderWidth: 1,
    borderColor: colors.border10,
    borderRadius: 8,
    paddingHorizontal: 16,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 13,
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  currencyText: { color: colors.neutral400, ...textPresets.fs14_400 },
  actions: { flexDirection: "row" as const, marginTop: 16 },
  btnSave: { flex: 1, borderRadius: 40, overflow: "hidden" as const },
  // --- Main screen ---
  content: { padding: 16, gap: 12 },
  centerState: { alignItems: "center" as const, paddingVertical: 40, gap: 12 },
  stateText: { color: colors.neutral400, ...textPresets.fs14_400 },
  emptyCard: { alignItems: "center" as const, paddingVertical: 48, gap: 12 },
  emptyTitle: { color: colors.neutral900, ...textPresets.fs18_500 },
  emptyDescription: {
    color: colors.neutral400,
    textAlign: "center" as const,
    ...textPresets.fs14_400,
  },
  emptyButton: {
    marginTop: 8,
    backgroundColor: colors.primary,
    borderRadius: 40,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: { color: colors.neutral100, ...textPresets.fs14_500 },
  list: { gap: 10 },
  presetCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
    padding: 14,
    borderRadius: 12,
    backgroundColor: colors.neutral100,
  },
  indexBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: colors.primary,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  indexText: { color: colors.neutral100, ...textPresets.fs14_500 },
  presetInfo: { flex: 1, gap: 2 },
  presetCode: { color: colors.neutral900, ...textPresets.fs14_500 },
  presetMeta: { color: colors.neutral400, ...textPresets.fs12_400 },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: colors.neutral50,
  },
  editIcon: { fontSize: 16, color: colors.neutral400 },
  deleteButton: { backgroundColor: colors.primaryLight },
  deleteIcon: { fontSize: 20, color: colors.primary },
}));
