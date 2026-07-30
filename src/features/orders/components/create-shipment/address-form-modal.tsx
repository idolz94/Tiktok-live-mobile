import { useEffect, useRef, useState } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { AnimatedErrorText } from "@components/animated-error-text";
import { Button } from "@components/button";
import { GeoPickerSheet } from "@components/geo-picker";
import { Header } from "@components/header";
import { Icon } from "@components/icon";
import { LinearGradient } from "@components/linear-gradient";
import {
  fetchProvinces,
  getWards,
  VnGeoItem,
} from "@features/settings/service/vn-geo";
import { addrSchema } from "../../schemas/shipment-schema";
import type { AddrFormValues } from "../../types/shipment";
import { absoluteFill } from "../../utils/shipment";
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
  const { colors } = useThemes();

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
  const phoneInputRef = useRef<TextInput>(null);

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
    <View style={formModalStyles.root}>
      <LinearGradient
        type="gra_background"
        style={formModalStyles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Header title={title} transparent />
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
                placeholderTextColor={colors.textMuted}
                returnKeyType="next"
                submitBehavior="submit"
                onSubmitEditing={() => phoneInputRef.current?.focus()}
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
                ref={phoneInputRef}
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
                placeholderTextColor={colors.textMuted}
                keyboardType="phone-pad"
                returnKeyType="done"
                submitBehavior="blurAndSubmit"
                onSubmitEditing={Keyboard.dismiss}
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
                placeholderTextColor={colors.textMuted}
                returnKeyType="done"
                submitBehavior="blurAndSubmit"
                onSubmitEditing={Keyboard.dismiss}
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

        <Button
          onPress={handleSubmit(async (vals) => {
            setIsSaving(true);
            try {
              await onSave(vals);
            } finally {
              setIsSaving(false);
            }
          })}
          disabled={isSaving || !isValid}
          loading={isSaving}
          loadingColor="white"
          containerStyle={formModalStyles.saveBtn}
          txtBtnStyle={formModalStyles.saveBtnText}
          title={
            title.toLowerCase().includes("sửa")
              ? "CẬP NHẬT ĐỊA CHỈ"
              : "+ THÊM ĐỊA CHỈ"
          }
        />
      </KeyboardAwareScrollView>

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
    </View>
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

const formModalStyles = createStyles(({ colors }) => ({
  root: {
    flex: 1,
  },
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  sheet: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  scrollView: { flex: 1 },
  scrollContent: {
    padding: 16,
  },
  input: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border10,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    color: colors.neutral900,
    fontSize: 14,
  },
  inputError: {
    borderColor: colors.error,
    backgroundColor: colors.errorLight,
  },
  pickerField: {
    minHeight: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border10,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  pickerText: {
    flex: 1,
    color: colors.neutral900,
    fontSize: 14,
    lineHeight: 20,
  },
  pickerPlaceholder: {
    color: colors.textMuted,
  },
  pickerDisabled: {
    opacity: 0.5,
  },
  switchRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingVertical: 4,
    gap: 12,
  },
  switchLabel: {
    flex: 1,
    color: colors.neutral500,
    fontSize: 14,
    lineHeight: 22,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 24,
    justifyContent: "center" as const,
  },
  switchTrackOn: { backgroundColor: colors.primary },
  switchTrackOff: { backgroundColor: colors.border10 },
  switchThumb: {
    position: "absolute" as const,
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.white,
  },
  switchThumbOn: { right: 2 },
  switchThumbOff: { left: 2 },
  saveBtn: {
    height: 50,
    borderRadius: 12,
    backgroundColor: colors.primary,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginTop: 8,
  },
  saveBtnText: {
    color: colors.white,
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "600" as const,
    letterSpacing: 0.3,
  },
  geoModalWrapper: {
    ...absoluteFill,
    justifyContent: "flex-end" as const,
    backgroundColor: colors.transparent50,
  },
  backdrop: {
    ...absoluteFill,
  },
}));
