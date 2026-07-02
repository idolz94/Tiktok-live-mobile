import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { AnimatedErrorText } from "@components/animated-error-text";
import { GeoPickerSheet } from "@components/geo-picker";
import { Icon } from "@components/icon";
import {
  fetchProvinces,
  getWards,
  VnGeoItem,
} from "@features/settings/service/vn-geo";
import { addrSchema, AddrFormValues } from "../types/shipment";
import { absoluteFill } from "../utils/shipment";
import { Screen } from "@components/screen";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";

type AddressFormModalProps = {
  title: string;
  initialValues?: Partial<AddrFormValues>;
  disableDefaultToggle?: boolean;
  onClose: () => void;
  onSave: (vals: AddrFormValues) => Promise<void>;
};

export function AddressFormModal({
  title,
  initialValues,
  disableDefaultToggle = false,
  onClose,
  onSave,
}: AddressFormModalProps) {
  const insets = useSafeAreaInsets();

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isValid, dirtyFields },
  } = useForm<AddrFormValues>({
    resolver: zodResolver(addrSchema),
    mode: "onChange",
    defaultValues: {
      label: "",
      name: "",
      phone: "",
      province: "",
      ward: "",
      address: "",
      isDefault: false,
      ...initialValues,
    },
  });

  const [provinceItems, setProvinceItems] = useState<VnGeoItem[]>([]);
  const [wardItems, setWardItems] = useState<VnGeoItem[]>([]);
  const [geoPicker, setGeoPicker] = useState<"province" | "ward" | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const province = watch("province");
  const ward = watch("ward");
  const isDefault = watch("isDefault");

  useEffect(() => {
    reset({
      label: "",
      name: "",
      phone: "",
      province: "",
      ward: "",
      address: "",
      isDefault: false,
      ...initialValues,
    });
  }, []);

  useEffect(() => {
    fetchProvinces()
      .then(setProvinceItems)
      .catch(() => setProvinceItems([]));
  }, []);

  const openProvincePicker = () => setGeoPicker("province");

  const openWardPicker = () => {
    if (!province) return;
    setWardItems(getWards(province));
    setGeoPicker("ward");
  };

  const handleSelectGeoItem = (item: VnGeoItem) => {
    if (geoPicker === "province") {
      setValue("province", item.name, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setValue("ward", "", { shouldDirty: true, shouldValidate: true });
      setWardItems([]);
    } else if (geoPicker === "ward") {
      setValue("ward", item.name, { shouldDirty: true, shouldValidate: true });
    }
    setGeoPicker(null);
  };

  return (
    <Screen>
      <View style={formModalStyles.sheet}>
        <View style={[formModalStyles.sheetHeader, { paddingTop: insets.top }]}>
          <Text style={formModalStyles.sheetTitle}>{title}</Text>
          <Pressable
            onPress={onClose}
            style={formModalStyles.closeBtn}
            hitSlop={8}
          >
            <Text style={formModalStyles.closeBtnText}>×</Text>
          </Pressable>
        </View>

        <KeyboardAwareScrollView
          style={formModalStyles.scrollView}
          contentContainerStyle={formModalStyles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <FormField
                label="Họ và tên"
                error={fieldState.isDirty ? errors.name?.message : undefined}
              >
                <TextInput
                  style={[
                    formModalStyles.input,
                    fieldState.isDirty && errors.name
                      ? formModalStyles.inputError
                      : null,
                  ]}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Nhập họ và tên"
                  placeholderTextColor="#9ca3af"
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <FormField
                label="Số điện thoại"
                error={fieldState.isDirty ? errors.phone?.message : undefined}
              >
                <TextInput
                  style={[
                    formModalStyles.input,
                    fieldState.isDirty && errors.phone
                      ? formModalStyles.inputError
                      : null,
                  ]}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#9ca3af"
                  keyboardType="phone-pad"
                />
              </FormField>
            )}
          />

          <FormField
            label="Tỉnh/Thành phố"
            error={dirtyFields.province ? errors.province?.message : undefined}
          >
            <Pressable
              onPress={openProvincePicker}
              style={[
                formModalStyles.pickerField,
                dirtyFields.province && errors.province
                  ? formModalStyles.inputError
                  : null,
              ]}
            >
              <Text
                style={[
                  formModalStyles.pickerText,
                  !province && formModalStyles.pickerPlaceholder,
                ]}
              >
                {province || "Chọn tỉnh/thành phố"}
              </Text>
              <Icon name="arrow_down" size={16} tintColor="neutral400" />
            </Pressable>
          </FormField>

          <FormField
            label="Phường/Xã"
            error={dirtyFields.ward ? errors.ward?.message : undefined}
          >
            <Pressable
              onPress={openWardPicker}
              style={[
                formModalStyles.pickerField,
                dirtyFields.ward && errors.ward
                  ? formModalStyles.inputError
                  : null,
                !province && formModalStyles.pickerDisabled,
              ]}
            >
              <Text
                style={[
                  formModalStyles.pickerText,
                  !ward && formModalStyles.pickerPlaceholder,
                ]}
              >
                {ward || "Chọn phường/xã"}
              </Text>
              <Icon name="arrow_down" size={16} tintColor="neutral400" />
            </Pressable>
          </FormField>

          <Controller
            control={control}
            name="address"
            render={({ field, fieldState }) => (
              <FormField
                label="Địa chỉ chi tiết"
                error={fieldState.isDirty ? errors.address?.message : undefined}
              >
                <TextInput
                  style={formModalStyles.input}
                  value={field.value}
                  onChangeText={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Nhập địa chỉ chi tiết (số nhà, đường...)"
                  placeholderTextColor="#9ca3af"
                />
              </FormField>
            )}
          />

          <Controller
            control={control}
            name="isDefault"
            render={({ field }) => (
              <Pressable
                onPress={() => {
                  if (!disableDefaultToggle) field.onChange(!field.value);
                }}
                style={[
                  formModalStyles.switchRow,
                  disableDefaultToggle ? { opacity: 0.5 } : null,
                ]}
              >
                <Text style={formModalStyles.switchLabel}>
                  Đặt làm địa chỉ mặc định
                </Text>
                <View
                  style={[
                    formModalStyles.switchTrack,
                    isDefault
                      ? formModalStyles.switchTrackOn
                      : formModalStyles.switchTrackOff,
                  ]}
                >
                  <View
                    style={[
                      formModalStyles.switchThumb,
                      isDefault
                        ? formModalStyles.switchThumbOn
                        : formModalStyles.switchThumbOff,
                    ]}
                  />
                </View>
              </Pressable>
            )}
          />

          <Pressable
            onPress={handleSubmit(async (vals) => {
              setIsSaving(true);
              try {
                await onSave(vals);
              } finally {
                setIsSaving(false);
              }
            })}
            disabled={isSaving || !isValid}
            style={[
              formModalStyles.saveBtn,
              (isSaving || !isValid) && formModalStyles.saveBtnDisabled,
            ]}
          >
            {isSaving && (
              <ActivityIndicator
                size="small"
                color="#fff"
                style={{ marginRight: 8 }}
              />
            )}
            <Text style={formModalStyles.saveBtnText}>
              {title.toLowerCase().includes("sửa")
                ? "CẬP NHẬT ĐỊA CHỈ"
                : "+ THÊM ĐỊA CHỈ"}
            </Text>
          </Pressable>
        </KeyboardAwareScrollView>
      </View>

      {geoPicker !== null && (
        <View style={formModalStyles.geoModalWrapper}>
          <Pressable
            style={formModalStyles.backdrop}
            onPress={() => setGeoPicker(null)}
          />
          <GeoPickerSheet
            title={
              geoPicker === "province"
                ? "Chọn Tỉnh / Thành phố"
                : "Chọn Phường / Xã"
            }
            items={geoPicker === "province" ? provinceItems : wardItems}
            selectedName={geoPicker === "province" ? province : ward}
            placeholder={
              geoPicker === "province"
                ? "Tìm tỉnh/thành phố..."
                : "Tìm phường/xã..."
            }
            onSelect={handleSelectGeoItem}
            onClose={() => setGeoPicker(null)}
          />
        </View>
      )}
    </Screen>
  );
}

function FormField({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={formFieldStyles.container}>
      <Text
        style={[
          formFieldStyles.label,
          { color: colors.neutral900 },
          textPresets.fs12_500,
        ]}
      >
        {label}
      </Text>
      {children}
      <AnimatedErrorText message={error} />
    </View>
  );
}

const formFieldStyles = createStyles(() => ({
  container: { gap: 6, marginBottom: 14 },
  label: { marginBottom: 2 },
}));

const formModalStyles = createStyles(() => ({
  sheet: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  sheetHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 4,
  },
  sheetTitle: {
    color: "#000",
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
  },
  closeBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f2f2f2",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  closeBtnText: {
    color: "#000",
    fontSize: 24,
    lineHeight: 28,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    paddingTop: 20,
    paddingBottom: 16,
    gap: 14,
  },
  input: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    color: "#000",
    fontSize: 14,
    lineHeight: 20,
  },
  inputError: {
    borderColor: "#ef4444",
  },
  pickerField: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  pickerText: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    lineHeight: 20,
  },
  pickerPlaceholder: {
    color: "#9ca3af",
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  textarea: {
    minHeight: 92,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: "top" as const,
  },
  switchRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: 12,
  },
  switchLabel: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    lineHeight: 22,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 24,
    justifyContent: "center" as const,
  },
  switchTrackOn: { backgroundColor: "#ebb140" },
  switchTrackOff: { backgroundColor: "#e5e7eb" },
  switchThumb: {
    position: "absolute" as const,
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  switchThumbOn: { right: 2 },
  switchThumbOff: { left: 2 },
  saveBtn: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#ebb140",
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 4,
  },
  saveBtnDisabled: { opacity: 0.65 },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700" as const,
    letterSpacing: 0.7,
  },
  geoModalWrapper: {
    ...absoluteFill,
    justifyContent: "flex-end" as const,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backdrop: {
    ...absoluteFill,
  },
}));
