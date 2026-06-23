import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";
import { fetchVnProvinces, fetchVnDistricts, fetchVnWards, VnGeoItem } from "@features/settings/service/vn-geo";
import { addrSchema, AddrFormValues } from "../types";
import { absoluteFill } from "../utils";
import { GeoPickerOverlay } from "./GeoPickerOverlay";

type AddressFormModalProps = {
  visible: boolean;
  title: string;
  initialValues?: Partial<AddrFormValues>;
  isSaving: boolean;
  onClose: () => void;
  onSave: (vals: AddrFormValues) => void;
};

export function AddressFormModal({
  visible,
  title,
  initialValues,
  isSaving,
  onClose,
  onSave,
}: AddressFormModalProps) {
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
      address: "",
      province: "",
      district: "",
      ward: "",
      isDefault: false,
      ...initialValues,
    },
  });

  const [provinces, setProvinces] = useState<VnGeoItem[]>([]);
  const [districts, setDistricts] = useState<VnGeoItem[]>([]);
  const [wards, setWards] = useState<VnGeoItem[]>([]);
  const [provinceCode, setProvinceCode] = useState<number | null>(null);
  const [districtCode, setDistrictCode] = useState<number | null>(null);
  const [geoPicker, setGeoPicker] = useState<"province" | "district" | "ward" | null>(null);

  const province = watch("province");
  const district = watch("district");
  const ward = watch("ward");
  const isDefault = watch("isDefault");

  const provincesRef = useRef<VnGeoItem[]>([]);

  useEffect(() => {
    if (!visible) return;

    const initProvinceName = initialValues?.province ?? "";
    const initDistrictName = initialValues?.district ?? "";

    reset({
      label: "",
      name: "",
      phone: "",
      address: "",
      province: "",
      district: "",
      ward: "",
      isDefault: false,
      ...initialValues,
    });
    setProvinceCode(null);
    setDistrictCode(null);
    setDistricts([]);
    setWards([]);

    const initGeo = async () => {
      let provList = provincesRef.current;
      if (provList.length === 0) {
        provList = await fetchVnProvinces();
        setProvinces(provList);
        provincesRef.current = provList;
      }
      if (!initProvinceName) return;

      const matchedProvince = provList.find((p) => p.name === initProvinceName);
      if (!matchedProvince) return;

      setProvinceCode(matchedProvince.code);
      const distList = await fetchVnDistricts(matchedProvince.code);
      setDistricts(distList);
      if (!initDistrictName) return;

      const matchedDistrict = distList.find((d) => d.name === initDistrictName);
      if (!matchedDistrict) return;

      setDistrictCode(matchedDistrict.code);
      const wardList = await fetchVnWards(matchedDistrict.code);
      setWards(wardList);
    };

    initGeo().catch(() => {});
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleSelectProvince = (item: VnGeoItem) => {
    setValue("province", item.name, { shouldDirty: true, shouldValidate: true });
    setValue("district", "", { shouldDirty: true, shouldValidate: true });
    setValue("ward", "", { shouldDirty: true, shouldValidate: true });
    setProvinceCode(item.code);
    setDistrictCode(null);
    setDistricts([]);
    setWards([]);
    setGeoPicker(null);
    fetchVnDistricts(item.code).then(setDistricts).catch(() => {});
  };

  const handleSelectDistrict = (item: VnGeoItem) => {
    setValue("district", item.name, { shouldDirty: true, shouldValidate: true });
    setValue("ward", "", { shouldDirty: true, shouldValidate: true });
    setDistrictCode(item.code);
    setWards([]);
    setGeoPicker(null);
    fetchVnWards(item.code).then(setWards).catch(() => {});
  };

  const handleSelectWard = (item: VnGeoItem) => {
    setValue("ward", item.name, { shouldDirty: true, shouldValidate: true });
    setGeoPicker(null);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={formModalStyles.modalRoot}>
        <TouchableWithoutFeedback onPress={onClose}>
          <View style={formModalStyles.backdrop} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined}>
          <View style={formModalStyles.sheet}>
            <View style={formModalStyles.sheetHeader}>
              <Text style={formModalStyles.sheetTitle}>{title}</Text>
              <Pressable onPress={onClose} style={formModalStyles.closeBtn} hitSlop={8}>
                <Text style={formModalStyles.closeBtnText}>×</Text>
              </Pressable>
            </View>

            <ScrollView
              style={formModalStyles.scrollView}
              contentContainerStyle={formModalStyles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Controller
                control={control}
                name="name"
                render={({ field, fieldState }) => (
                  <FormField label="Họ và tên" error={fieldState.isDirty ? errors.name?.message : undefined}>
                    <TextInput
                      style={[formModalStyles.input, fieldState.isDirty && errors.name ? formModalStyles.inputError : null]}
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
                  <FormField label="Số điện thoại" error={fieldState.isDirty ? errors.phone?.message : undefined}>
                    <TextInput
                      style={[formModalStyles.input, fieldState.isDirty && errors.phone ? formModalStyles.inputError : null]}
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

              <FormField label="Tỉnh/Thành phố" error={dirtyFields.province ? errors.province?.message : undefined}>
                <Pressable
                  onPress={() => setGeoPicker("province")}
                  style={[formModalStyles.pickerField, dirtyFields.province && errors.province ? formModalStyles.inputError : null]}
                >
                  <Text style={[formModalStyles.pickerText, !province && formModalStyles.pickerPlaceholder]}>
                    {province || "Chọn tỉnh/thành phố"}
                  </Text>
                  <Icon name="arrow_down" size={16} tintColor="neutral400" />
                </Pressable>
              </FormField>

              <FormField label="Huyện/Quận" error={dirtyFields.district ? errors.district?.message : undefined}>
                <Pressable
                  onPress={() => { if (provinceCode !== null) setGeoPicker("district"); }}
                  style={[
                    formModalStyles.pickerField,
                    dirtyFields.district && errors.district ? formModalStyles.inputError : null,
                    provinceCode === null && formModalStyles.pickerDisabled,
                  ]}
                >
                  <Text style={[formModalStyles.pickerText, !district && formModalStyles.pickerPlaceholder]}>
                    {district || "Chọn huyện/quận"}
                  </Text>
                  <Icon name="arrow_down" size={16} tintColor="neutral400" />
                </Pressable>
              </FormField>

              <FormField label="Phường/Xã" error={dirtyFields.ward ? errors.ward?.message : undefined}>
                <Pressable
                  onPress={() => { if (districtCode !== null) setGeoPicker("ward"); }}
                  style={[
                    formModalStyles.pickerField,
                    dirtyFields.ward && errors.ward ? formModalStyles.inputError : null,
                    districtCode === null && formModalStyles.pickerDisabled,
                  ]}
                >
                  <Text style={[formModalStyles.pickerText, !ward && formModalStyles.pickerPlaceholder]}>
                    {ward || "Chọn phường/xã"}
                  </Text>
                  <Icon name="arrow_down" size={16} tintColor="neutral400" />
                </Pressable>
              </FormField>

              <Controller
                control={control}
                name="address"
                render={({ field, fieldState }) => (
                  <FormField label="Địa chỉ chi tiết" error={fieldState.isDirty ? errors.address?.message : undefined}>
                    <TextInput
                      style={[formModalStyles.input, formModalStyles.textarea]}
                      value={field.value}
                      onChangeText={field.onChange}
                      placeholder="Nhập địa chỉ chi tiết (số nhà, đường...)"
                      placeholderTextColor="#9ca3af"
                      multiline
                      numberOfLines={2}
                      textAlignVertical="top"
                    />
                  </FormField>
                )}
              />

              <Controller
                control={control}
                name="isDefault"
                render={({ field }) => (
                  <Pressable onPress={() => field.onChange(!field.value)} style={formModalStyles.switchRow}>
                    <Text style={formModalStyles.switchLabel}>Đặt làm địa chỉ mặc định</Text>
                    <View style={[formModalStyles.switchTrack, isDefault ? formModalStyles.switchTrackOn : formModalStyles.switchTrackOff]}>
                      <View style={[formModalStyles.switchThumb, isDefault ? formModalStyles.switchThumbOn : formModalStyles.switchThumbOff]} />
                    </View>
                  </Pressable>
                )}
              />

              <Pressable
                onPress={handleSubmit(onSave)}
                disabled={isSaving || !isValid}
                style={[formModalStyles.saveBtn, (isSaving || !isValid) && formModalStyles.saveBtnDisabled]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text style={formModalStyles.saveBtnText}>
                    {title.toLowerCase().includes("sửa") ? "CẬP NHẬT ĐỊA CHỈ" : "+ THÊM ĐỊA CHỈ"}
                  </Text>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>

        {geoPicker !== null && (
          <View style={formModalStyles.geoModalWrapper}>
            <TouchableWithoutFeedback onPress={() => setGeoPicker(null)}>
              <View style={formModalStyles.backdrop} />
            </TouchableWithoutFeedback>
            <GeoPickerOverlay
              title={
                geoPicker === "province"
                  ? "Chọn Tỉnh / Thành phố"
                  : geoPicker === "district"
                  ? "Chọn Quận / Huyện"
                  : "Chọn Phường / Xã"
              }
              items={
                geoPicker === "province" ? provinces : geoPicker === "district" ? districts : wards
              }
              onSelect={
                geoPicker === "province"
                  ? handleSelectProvince
                  : geoPicker === "district"
                  ? handleSelectDistrict
                  : handleSelectWard
              }
              onClose={() => setGeoPicker(null)}
            />
          </View>
        )}
      </View>
    </Modal>
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
      <Text style={[formFieldStyles.label, { color: colors.neutral900 }, textPresets.fs12_500]}>
        {label}
      </Text>
      {children}
      {!!error && (
        <Text style={[formFieldStyles.error, { color: colors.error }, textPresets.fs12_400]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const formFieldStyles = createStyles(() => ({
  container: { gap: 6, marginBottom: 14 },
  label: { marginBottom: 2 },
  error: { marginTop: 2 },
}));

const formModalStyles = createStyles(() => ({
  modalRoot: {
    flex: 1,
    justifyContent: "flex-end" as const,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  backdrop: {
    ...absoluteFill,
  },
  sheet: {
    maxHeight: "88%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    overflow: "hidden" as const,
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
  scrollView: { flexGrow: 0 },
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
}));
