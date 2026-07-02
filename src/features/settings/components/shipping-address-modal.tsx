import { GeoPickerSheet } from "@components/geo-picker";
import { ShopAddress } from "@features/settings/service/shop-addresses-api";
import { VnGeoItem } from "@features/settings/service/vn-geo";
import { AddressForm, GeoPickerState } from "@features/settings/hooks/shipping-address-form.schema";
import { Controller, UseFormReturn } from "react-hook-form";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { AddressInput, PickerField, SwitchRow } from "./shipping-address-form-fields";
import { shippingSettingsStyles as styles } from "./shipping-settings.styles";

type ShippingAddressModalProps = {
  editingAddress: ShopAddress | null;
  form: UseFormReturn<AddressForm>;
  addressForm: AddressForm;
  formError: string | null;
  geoPicker: GeoPickerState;
  isSavingAddress: boolean;
  useOldAddressFormat: boolean;
  onClose: () => void;
  onSave: () => void;
  onSelectGeoItem: (item: VnGeoItem) => void;
  onOpenProvincePicker: () => void;
  onOpenWardPicker: () => void;
  setFormError: (error: string | null) => void;
  setGeoPicker: (picker: GeoPickerState) => void;
  setUseOldAddressFormat: (updater: (current: boolean) => boolean) => void;
  variant?: "sheet" | "page";
};

export function ShippingAddressModal({
  editingAddress,
  form,
  addressForm,
  formError,
  geoPicker,
  isSavingAddress,
  useOldAddressFormat,
  onClose,
  onSave,
  onSelectGeoItem,
  onOpenProvincePicker,
  onOpenWardPicker,
  setFormError,
  setGeoPicker,
  setUseOldAddressFormat,
  variant = "sheet",
}: ShippingAddressModalProps) {
  const { control, formState: { errors, isValid, dirtyFields } } = form;

  return (
    <View style={[styles.modalCard, variant === "page" && styles.modalPageCard]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>{editingAddress ? "Sửa địa chỉ kho" : "Thêm địa chỉ kho"}</Text>
            <Pressable onPress={onClose} style={styles.modalCloseButton}>
              <Text style={styles.modalCloseText}>×</Text>
            </Pressable>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.modalContent}>
            <Controller
              control={control}
              name="name"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <AddressInput
                  label="Tên"
                  required
                  value={value}
                  onChangeText={(next: string) => { onChange(next); setFormError(null); }}
                  onBlur={onBlur}
                  placeholder="Tên người gửi"
                  error={error?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="phone"
              render={({ field: { onBlur, onChange, value }, fieldState: { error } }) => (
                <AddressInput
                  label="Điện thoại"
                  value={value}
                  onChangeText={(next: string) => { onChange(next); setFormError(null); }}
                  onBlur={onBlur}
                  keyboardType="phone-pad"
                  placeholder="0356 324 488"
                  error={error?.message}
                />
              )}
            />

            <SwitchRow
              title="Dùng định dạng địa chỉ cũ"
              subtitle="Tỉnh - Phường/Xã (rút gọn)"
              value={useOldAddressFormat}
              onPress={() => setUseOldAddressFormat((c) => !c)}
            />

            <View style={styles.inputGroup}>
              <View style={styles.addressLabelRow}>
                <Text style={styles.inputLabel}>Địa chỉ chi tiết</Text>
                <View style={styles.newAddressTag}>
                  <Text style={styles.newAddressTagText}>Địa chỉ mới</Text>
                </View>
              </View>
              <Controller
                control={control}
                name="address"
                render={({ field: { onChange, value } }) => (
                  <TextInput
                    value={value}
                    onChangeText={(next) => { onChange(next); setFormError(null); }}
                    style={[styles.input, styles.textArea]}
                    placeholderTextColor="#d1d5db"
                    placeholder={"Số nhà, tên đường\nPhường/Xã\nTỉnh/Thành phố"}
                    multiline
                  />
                )}
              />
            </View>

            <PickerField
              label="Tỉnh/Thành phố"
              required
              value={addressForm.province}
              placeholder="Chọn tỉnh/thành phố"
              onPress={onOpenProvincePicker}
              error={errors.province?.message}
              dirty={Boolean(dirtyFields.province)}
            />
            <PickerField
              label="Phường/Xã"
              required
              value={addressForm.ward}
              placeholder="Chọn phường/xã"
              disabled={!addressForm.province}
              onPress={onOpenWardPicker}
              error={errors.ward?.message}
              dirty={Boolean(dirtyFields.ward)}
            />

            <Controller
              control={control}
              name="isDefault"
              render={({ field: { onChange, value } }) => (
                <SwitchRow
                  title="Đặt làm địa chỉ mặc định"
                  value={value}
                  onPress={() => { onChange(!value); setFormError(null); }}
                />
              )}
            />

            {formError ? (
              <View style={styles.formErrorBox}>
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            ) : null}

            <Pressable
              style={[styles.saveButton, (isSavingAddress || !isValid) && styles.saveButtonDisabled]}
              onPress={onSave}
              disabled={isSavingAddress || !isValid}
            >
              {isSavingAddress ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{editingAddress ? "CẬP NHẬT ĐỊA CHỈ" : "+ THÊM ĐỊA CHỈ"}</Text>
              )}
            </Pressable>
          </ScrollView>

          {geoPicker ? (
            <View style={styles.geoPickerOverlay}>
              <GeoPickerSheet
                title={geoPicker.title}
                items={geoPicker.items}
                selectedName={geoPicker.selectedName}
                placeholder={geoPicker.placeholder}
                onClose={() => setGeoPicker(null)}
                onSelect={onSelectGeoItem}
              />
            </View>
          ) : null}
      </View>
  );
}
