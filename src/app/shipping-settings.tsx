import { icons } from "@assets/icons";
import { images } from "@assets/images";
import {
  createShopAddressApi,
  listShopAddressesApi,
  ShopAddress,
  ShopAddressPayload,
  updateShopAddressApi,
} from "@features/settings/service/shop-addresses-api";
import {
  fetchVnDistricts,
  fetchVnProvinces,
  fetchVnWards,
  removeDiacritics,
  VnDistrict,
  VnGeoItem,
  VnProvince,
  VnWard,
} from "@features/settings/service/vn-geo";
import { zodResolver } from "@hookform/resolvers/zod";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";
import {
  ActivityIndicator,
  Alert,
  Image,
  ImageSourcePropType,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const connectedPartners = [
  {
    key: "viettel-post",
    name: "Viettel Post",
    description: "Dịch vụ bưu chính của Viettel với mạng lưới rộng khắp.",
    isDefault: true,
    color: "#ffffff",
  },
  {
    key: "spx",
    name: "SPX - SPX EXPRESS",
    description: "Dịch vụ giao hàng toàn quốc, nhanh, rẻ và an toàn.",
    color: "#ff3911",
  },
] as const;

const unconnectedPartners = [
  {
    key: "jt",
    name: "JT - J&T Express",
    description: "Dịch vụ chuyển phát nhanh J&T Express với mạng lưới toàn quốc.",
    color: "#e31b23",
  },
  {
    key: "ghn",
    name: "GHN - Giao Hàng Nhanh",
    description: "Dịch vụ giao hàng nhanh với mạng lưới rộng khắp cả nước.",
    color: "#f58220",
  },
] as const;

const SPECIAL_CHARS_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?~`]/;
const VN_PHONE_RE = /^(\+84|0)(3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-46-8])\d{7}$/;

const addressFormSchema = z.object({
  label: z.string(),
  name: z
    .string()
    .trim()
    .min(1, { error: "Tên không được bỏ trống" })
    .refine((value) => !SPECIAL_CHARS_RE.test(value), "Tên không được chứa ký tự đặc biệt"),
  phone: z
    .string()
    .trim()
    .refine((value) => value.replace(/\D/g, "").length > 0, "Số điện thoại không được để trống")
    .refine((value) => {
      const digits = value.replace(/\D/g, "");
      return digits.length >= 10 && digits.length <= 12;
    }, "Số điện thoại phải từ 10 đến 12 chữ số")
    .refine((value) => VN_PHONE_RE.test(value), "Số điện thoại không đúng nhà mạng Việt Nam"),
  address: z.string(),
  province: z.string().trim().min(1, { error: "Vui lòng chọn Tỉnh/Thành phố" }),
  district: z.string().trim().min(1, { error: "Vui lòng chọn Huyện/Quận" }),
  ward: z.string().trim().min(1, { error: "Vui lòng chọn Phường/Xã" }),
  isDefault: z.boolean(),
});

type AddressForm = z.infer<typeof addressFormSchema>;

const emptyAddressForm: AddressForm = {
  label: "Kho hàng",
  name: "",
  phone: "",
  address: "",
  province: "",
  district: "",
  ward: "",
  isDefault: false,
};

export default function ShippingSettingsScreen() {
  const [addresses, setAddresses] = useState<ShopAddress[]>([]);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSavingAddress, setIsSavingAddress] = useState(false);
  const [editingAddress, setEditingAddress] = useState<ShopAddress | null>(null);
  const [isAddressModalVisible, setAddressModalVisible] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [useOldAddressFormat, setUseOldAddressFormat] = useState(false);
  const [provinces, setProvinces] = useState<VnProvince[]>([]);
  const [districts, setDistricts] = useState<VnDistrict[]>([]);
  const [wards, setWards] = useState<VnWard[]>([]);
  const [selectedProvince, setSelectedProvince] = useState<VnProvince | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<VnDistrict | null>(null);
  const [geoPicker, setGeoPicker] = useState<{
    type: "province" | "district" | "ward";
    title: string;
    placeholder: string;
    items: VnGeoItem[];
    selectedName: string;
  } | null>(null);
  const {
    control,
    formState: { errors },
    handleSubmit,
    reset,
    setValue,
    watch,
  } = useForm<AddressForm>({
    defaultValues: emptyAddressForm,
    mode: "onChange",
    resolver: zodResolver(addressFormSchema),
  });
  const addressForm = watch();

  const defaultAddress = useMemo(
    () => addresses.find((address) => address.isDefault) ?? addresses[0] ?? null,
    [addresses],
  );

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  const loadAddresses = async ({ refreshing = false } = {}) => {
    if (refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoadingAddresses(true);
    }

    try {
      const rows = await listShopAddressesApi();
      setAddresses(rows);
    } catch (error) {
      Alert.alert("Không tải được địa chỉ kho", "Vui lòng thử lại sau.");
    } finally {
      setIsLoadingAddresses(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadAddresses();
  }, []);

  const ensureProvinces = async () => {
    if (provinces.length > 0) return provinces;

    try {
      const rows = await fetchVnProvinces();
      setProvinces(rows);
      return rows;
    } catch (error) {
      Alert.alert("Không tải được danh sách tỉnh thành", "Vui lòng thử lại sau.");
      return [];
    }
  };

  const openCreateAddressModal = () => {
    setEditingAddress(null);
    setFormError(null);
    setUseOldAddressFormat(false);
    setSelectedProvince(null);
    setSelectedDistrict(null);
    setDistricts([]);
    setWards([]);
    reset({
      ...emptyAddressForm,
      isDefault: addresses.length === 0,
    });
    setAddressModalVisible(true);
    ensureProvinces();
  };

  const openEditAddressModal = (address: ShopAddress) => {
    setEditingAddress(address);
    setFormError(null);
    setUseOldAddressFormat(false);
    setSelectedProvince(address.province ? { code: -1, name: address.province } : null);
    setSelectedDistrict(address.district ? { code: -1, name: address.district } : null);
    reset({
      label: address.label ?? "Kho hàng",
      name: address.name ?? "",
      phone: address.phone ?? "",
      address: address.address ?? "",
      province: address.province ?? "",
      district: address.district ?? "",
      ward: address.ward ?? "",
      isDefault: address.isDefault,
    });
    setAddressModalVisible(true);
    ensureProvinces();
  };

  const updateAddressTextField = (key: "province" | "district" | "ward", value: string) => {
    setValue(key, value, { shouldDirty: true, shouldTouch: true, shouldValidate: true });
    setFormError(null);
  };

  const closeAddressModal = () => {
    if (isSavingAddress) return;

    setAddressModalVisible(false);
  };

  const buildAddressPayload = (values: AddressForm): ShopAddressPayload => ({
    label: values.label.trim() || null,
    name: values.name.trim(),
    phone: values.phone.trim(),
    address: values.address.trim() || null,
    province: values.province.trim(),
    district: values.district.trim(),
    ward: values.ward.trim(),
    isDefault: values.isDefault,
  });

  const openProvincePicker = async () => {
    const rows = await ensureProvinces();
    setGeoPicker({
      type: "province",
      title: "Chọn Tỉnh/Thành phố",
      placeholder: "Tìm tỉnh/thành phố...",
      items: rows,
      selectedName: addressForm.province,
    });
  };

  const openDistrictPicker = () => {
    if (!selectedProvince) return;

    setGeoPicker({
      type: "district",
      title: "Chọn Huyện/Quận",
      placeholder: "Tìm huyện/quận...",
      items: districts,
      selectedName: addressForm.district,
    });
  };

  const openWardPicker = () => {
    if (!selectedDistrict) return;

    setGeoPicker({
      type: "ward",
      title: "Chọn Phường/Xã",
      placeholder: "Tìm phường/xã...",
      items: wards,
      selectedName: addressForm.ward,
    });
  };

  const selectGeoItem = async (item: VnGeoItem) => {
    if (!geoPicker) return;

    if (geoPicker.type === "province") {
      setSelectedProvince(item as VnProvince);
      setSelectedDistrict(null);
      updateAddressTextField("province", item.name);
      updateAddressTextField("district", "");
      updateAddressTextField("ward", "");
      setDistricts([]);
      setWards([]);
      setGeoPicker(null);

      try {
        setDistricts(await fetchVnDistricts(item.code));
      } catch (error) {
        Alert.alert("Không tải được danh sách huyện/quận", "Vui lòng thử lại sau.");
      }
      return;
    }

    if (geoPicker.type === "district") {
      setSelectedDistrict(item as VnDistrict);
      updateAddressTextField("district", item.name);
      updateAddressTextField("ward", "");
      setWards([]);
      setGeoPicker(null);

      try {
        setWards(await fetchVnWards(item.code));
      } catch (error) {
        Alert.alert("Không tải được danh sách phường/xã", "Vui lòng thử lại sau.");
      }
      return;
    }

    updateAddressTextField("ward", item.name);
    setGeoPicker(null);
  };

  const handleSaveAddress = handleSubmit(async (values) => {
    setFormError(null);
    setIsSavingAddress(true);

    try {
      const payload = buildAddressPayload(values);
      const savedAddress = editingAddress
        ? await updateShopAddressApi(editingAddress.id, payload)
        : await createShopAddressApi(payload);

      setAddresses((current) => {
        const next = editingAddress
          ? current.map((address) => (address.id === savedAddress.id ? savedAddress : address))
          : [savedAddress, ...current];

        return savedAddress.isDefault
          ? next.map((address) => ({ ...address, isDefault: address.id === savedAddress.id }))
          : next;
      });
      setAddressModalVisible(false);
    } catch (error) {
      Alert.alert("Không lưu được địa chỉ kho", "Vui lòng kiểm tra thông tin và thử lại.");
    } finally {
      setIsSavingAddress(false);
    }
  });

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.headerButton} activeOpacity={0.8}>
          <Text style={styles.backIcon}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cấu hình vận chuyển</Text>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.8}>
          <Image source={icons.settings} style={styles.headerIcon} resizeMode="contain" />
        </TouchableOpacity>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={() => loadAddresses({ refreshing: true })} />}
      >
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Địa chỉ kho hàng</Text>

          {isLoadingAddresses ? (
            <View style={styles.emptyWarehouseCard}>
              <ActivityIndicator color="#000" />
              <Text style={styles.emptyWarehouseText}>Đang tải địa chỉ kho...</Text>
            </View>
          ) : defaultAddress ? (
            <View style={styles.warehouseCard}>
              <View style={styles.warehouseHeader}>
                <View style={styles.storeIconBox}>
                  <Text style={styles.storeIcon}>⌂</Text>
                </View>
                <View style={styles.storeNameWrap}>
                  <Text style={styles.storeName}>{defaultAddress.name || defaultAddress.label || "Kho hàng"}</Text>
                  {defaultAddress.isDefault ? <Text style={styles.storeDefaultText}>Mặc định</Text> : null}
                </View>
                <TouchableOpacity
                  style={styles.editButton}
                  activeOpacity={0.75}
                  onPress={() => openEditAddressModal(defaultAddress)}
                >
                  <Text style={styles.editIcon}>✎</Text>
                  <Text style={styles.editText}>Sửa</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.warehouseMeta}>
                <InfoLine icon="☎" text={defaultAddress.phone || "Chưa có số điện thoại"} />
                <InfoLine icon="⌖" text={formatShopAddress(defaultAddress)} />
              </View>
            </View>
          ) : (
            <View style={styles.emptyWarehouseCard}>
              <Text style={styles.emptyWarehouseTitle}>Chưa có địa chỉ kho</Text>
              <Text style={styles.emptyWarehouseText}>Thêm địa chỉ để tạo đơn và cấu hình vận chuyển.</Text>
            </View>
          )}

          <TouchableOpacity style={styles.addButton} activeOpacity={0.75} onPress={openCreateAddressModal}>
            <Text style={styles.addIcon}>＋</Text>
            <Text style={styles.addText}>Thêm mới</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.breakLine} />

        <View style={styles.partnerSection}>
          <Text style={styles.sectionTitle}>Đối tác vận chuyển</Text>
          <PartnerGroup title="Đã kết nối" partners={connectedPartners} />
          <PartnerGroup title="Chưa kết nối" partners={unconnectedPartners} />
        </View>
      </ScrollView>

      <Modal visible={isAddressModalVisible} animationType="slide" transparent onRequestClose={closeAddressModal}>
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingAddress ? "Sửa địa chỉ kho" : "Thêm địa chỉ kho"}</Text>
              <TouchableOpacity onPress={closeAddressModal} style={styles.modalCloseButton} activeOpacity={0.75}>
                <Text style={styles.modalCloseText}>×</Text>
              </TouchableOpacity>
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
                    onChangeText={(nextValue) => {
                      onChange(nextValue);
                      setFormError(null);
                    }}
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
                    onChangeText={(nextValue) => {
                      onChange(nextValue);
                      setFormError(null);
                    }}
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
                onPress={() => setUseOldAddressFormat((current) => !current)}
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
                      onChangeText={(nextValue) => {
                        onChange(nextValue);
                        setFormError(null);
                      }}
                      style={[styles.input, styles.textArea]}
                      placeholderTextColor="#d1d5db"
                      placeholder={"Số nhà, tên đường\nPhường/Xã, Quận/Huyện\nTỉnh/Thành phố"}
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
                onPress={openProvincePicker}
                error={errors.province?.message}
              />
              <PickerField
                label="Huyện/Quận"
                required
                value={addressForm.district}
                placeholder="Chọn huyện/quận"
                disabled={!selectedProvince}
                onPress={openDistrictPicker}
                error={errors.district?.message}
              />
              <PickerField
                label="Phường/Xã"
                required
                value={addressForm.ward}
                placeholder="Chọn phường/xã"
                disabled={!selectedDistrict}
                onPress={openWardPicker}
                error={errors.ward?.message}
              />

              <Controller
                control={control}
                name="isDefault"
                render={({ field: { onChange, value } }) => (
                  <SwitchRow
                    title="Đặt làm địa chỉ mặc định"
                    value={value}
                    onPress={() => {
                      onChange(!value);
                      setFormError(null);
                    }}
                  />
                )}
              />

              {formError ? (
                <View style={styles.formErrorBox}>
                  <Text style={styles.formErrorText}>{formError}</Text>
                </View>
              ) : null}
            </ScrollView>

            <TouchableOpacity
              style={[styles.saveButton, isSavingAddress && styles.saveButtonDisabled]}
              activeOpacity={0.8}
              onPress={handleSaveAddress}
              disabled={isSavingAddress}
            >
              {isSavingAddress ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveButtonText}>{editingAddress ? "CẬP NHẬT ĐỊA CHỈ" : "+ THÊM ĐỊA CHỈ"}</Text>
              )}
            </TouchableOpacity>

            <GeoPickerModal picker={geoPicker} onClose={() => setGeoPicker(null)} onSelect={selectGeoItem} />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatShopAddress(address: ShopAddress) {
  return [address.address, address.ward, address.district, address.province].filter(Boolean).join(", ") || "Chưa có địa chỉ";
}

function InfoLine({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}

function AddressInput({ label, required = false, value, onChangeText, onBlur, keyboardType = "default", placeholder, error }: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  keyboardType?: "default" | "phone-pad";
  placeholder: string;
  error?: string | null;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required ? <Text style={styles.requiredMark}>*</Text> : null}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#d1d5db"
        placeholder={placeholder}
      />
      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
    </View>
  );
}

function SwitchRow({ title, subtitle, value, onPress }: {
  title: string;
  subtitle?: string;
  value: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchTextWrap}>
        <Text style={styles.switchTitle}>{title}</Text>
        {subtitle ? <Text style={styles.switchSubtitle}>{subtitle}</Text> : null}
      </View>
      <TouchableOpacity
        style={[styles.switchTrack, value ? styles.switchTrackActive : styles.switchTrackInactive]}
        activeOpacity={0.8}
        onPress={onPress}
      >
        <View style={[styles.switchThumb, value ? styles.switchThumbActive : styles.switchThumbInactive]} />
      </TouchableOpacity>
    </View>
  );
}

function PickerField({ label, required = false, value, placeholder, disabled = false, onPress, error }: {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  disabled?: boolean;
  onPress: () => void;
  error?: string | null;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required ? <Text style={styles.requiredMark}>*</Text> : null}
      </Text>
      <TouchableOpacity
        style={[styles.pickerButton, error && styles.inputError, disabled && styles.pickerButtonDisabled]}
        activeOpacity={0.75}
        disabled={disabled}
        onPress={onPress}
      >
        <Text style={[styles.pickerButtonText, !value && styles.pickerPlaceholder]}>{value || placeholder}</Text>
        <Text style={styles.pickerChevron}>⌄</Text>
      </TouchableOpacity>
      {error ? <Text style={styles.fieldErrorText}>{error}</Text> : null}
    </View>
  );
}

function GeoPickerModal({ picker, onClose, onSelect }: {
  picker: {
    title: string;
    placeholder: string;
    items: VnGeoItem[];
    selectedName: string;
  } | null;
  onClose: () => void;
  onSelect: (item: VnGeoItem) => void;
}) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (picker) {
      setQuery("");
    }
  }, [picker]);

  const filteredItems = useMemo(() => {
    if (!picker) return [];

    const normalizedQuery = removeDiacritics(query.trim());
    if (!normalizedQuery) return picker.items;

    return picker.items.filter((item) => removeDiacritics(item.name).includes(normalizedQuery));
  }, [picker, query]);

  if (!picker) return null;

  return (
    <View style={styles.geoPickerOverlay}>
      <View style={styles.geoPickerCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{picker.title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} activeOpacity={0.75}>
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          style={styles.geoSearchInput}
          placeholder={picker.placeholder}
          placeholderTextColor="#9ca3af"
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.geoListContent}>
          {filteredItems.map((item) => {
            const selected = item.name === picker.selectedName;

            return (
              <TouchableOpacity
                key={`${item.code}-${item.name}`}
                style={[styles.geoItem, selected && styles.geoItemSelected]}
                activeOpacity={0.75}
                onPress={() => onSelect(item)}
              >
                <Text style={[styles.geoItemText, selected && styles.geoItemTextSelected]}>{item.name}</Text>
                {selected ? <Text style={styles.geoSelectedIcon}>✓</Text> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}

type Partner = {
  key: string;
  name: string;
  description: string;
  isDefault?: boolean;
  color: string;
};

function PartnerGroup({ title, partners }: { title: string; partners: readonly Partner[] }) {
  return (
    <View style={styles.partnerGroup}>
      <Text style={styles.partnerGroupTitle}>{title}</Text>
      <View style={styles.partnerList}>
        {partners.map((partner) => (
          <PartnerCard key={partner.key} partner={partner} />
        ))}
      </View>
    </View>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <TouchableOpacity style={styles.partnerCard} activeOpacity={0.75}>
      <View style={styles.partnerContent}>
        <DeliveryLogo color={partner.color} image={images.ship} />
        <View style={styles.partnerTextWrap}>
          <View style={styles.partnerTitleRow}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {partner.name}
            </Text>
            {partner.isDefault ? (
              <View style={styles.defaultTag}>
                <Text style={styles.defaultText}>Mặc định</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.partnerDescription}>{partner.description}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </TouchableOpacity>
  );
}

function DeliveryLogo({ color, image }: { color: string; image: ImageSourcePropType }) {
  return (
    <View style={[styles.deliveryLogo, { backgroundColor: color }]}>
      <Image source={image} style={styles.deliveryLogoImage} resizeMode="contain" />
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    minHeight: 72,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#fff",
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  backIcon: {
    color: "#000",
    fontSize: 34,
    lineHeight: 34,
    marginTop: -4,
  },
  headerIcon: {
    width: 20,
    height: 20,
    tintColor: "#000",
  },
  title: {
    flex: 1,
    marginHorizontal: 12,
    color: "#000",
    textAlign: "center",
    fontSize: 18,
    lineHeight: 24,
    fontWeight: "500",
  },
  scrollContent: {
    paddingBottom: 32,
  },
  section: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 20,
    gap: 16,
  },
  sectionTitle: {
    color: "#000",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  warehouseCard: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "#f2f2f2",
    padding: 16,
    gap: 16,
  },
  emptyWarehouseCard: {
    minHeight: 116,
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: "#f2f2f2",
    padding: 16,
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  emptyWarehouseTitle: {
    color: "#000",
    fontSize: 15,
    lineHeight: 22,
    fontWeight: "500",
  },
  emptyWarehouseText: {
    color: "#484848",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  warehouseHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  storeIconBox: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  storeIcon: {
    color: "#000",
    fontSize: 18,
    lineHeight: 22,
  },
  storeNameWrap: {
    flex: 1,
    minWidth: 0,
    gap: 2,
  },
  storeName: {
    color: "#000",
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
  },
  storeDefaultText: {
    color: "#484848",
    fontSize: 12,
    lineHeight: 18,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  editIcon: {
    color: "#000",
    fontSize: 16,
    lineHeight: 18,
  },
  editText: {
    color: "#000",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  warehouseMeta: {
    gap: 8,
  },
  infoLine: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoIcon: {
    width: 16,
    color: "#484848",
    fontSize: 13,
    lineHeight: 18,
    textAlign: "center",
  },
  infoText: {
    flex: 1,
    color: "#484848",
    fontSize: 12,
    lineHeight: 18,
  },
  addButton: {
    height: 48,
    borderRadius: 8,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "rgba(0,0,0,0.2)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  addIcon: {
    color: "#484848",
    fontSize: 18,
    lineHeight: 22,
  },
  addText: {
    color: "#484848",
    fontSize: 14,
    lineHeight: 22,
  },
  breakLine: {
    height: 8,
    backgroundColor: "#f2f2f2",
  },
  partnerSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 20,
  },
  partnerGroup: {
    gap: 16,
  },
  partnerGroupTitle: {
    color: "#2b2b2b",
    fontSize: 14,
    lineHeight: 22,
  },
  partnerList: {
    gap: 12,
  },
  partnerCard: {
    borderRadius: 16,
    backgroundColor: "#f2f2f2",
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  partnerContent: {
    flex: 1,
    minWidth: 0,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  deliveryLogo: {
    width: 44,
    height: 44,
    borderRadius: 12,
    overflow: "hidden",
    alignItems: "center",
    justifyContent: "center",
  },
  deliveryLogoImage: {
    width: 30,
    height: 30,
  },
  partnerTextWrap: {
    flex: 1,
    minWidth: 0,
    gap: 4,
  },
  partnerTitleRow: {
    maxWidth: "100%",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  partnerName: {
    flexShrink: 1,
    color: "#000",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "500",
  },
  defaultTag: {
    height: 24,
    borderRadius: 16,
    backgroundColor: "#fff",
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  defaultText: {
    color: "#2b2b2b",
    fontSize: 12,
    lineHeight: 18,
    fontWeight: "500",
  },
  partnerDescription: {
    color: "#484848",
    fontSize: 12,
    lineHeight: 18,
  },
  chevron: {
    color: "#000",
    fontSize: 24,
    lineHeight: 24,
    transform: [{ rotate: "180deg" }],
  },
  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalCard: {
    maxHeight: "88%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  modalTitle: {
    color: "#000",
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600",
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f2f2f2",
    alignItems: "center",
    justifyContent: "center",
  },
  modalCloseText: {
    color: "#000",
    fontSize: 24,
    lineHeight: 28,
  },
  modalContent: {
    paddingTop: 20,
    paddingBottom: 16,
    gap: 14,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: "#111827",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
  },
  requiredMark: {
    color: "#ef4444",
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
  },
  addressLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  newAddressTag: {
    borderRadius: 4,
    backgroundColor: "#dbeafe",
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  newAddressTagText: {
    color: "#3b82f6",
    fontSize: 10,
    lineHeight: 14,
    fontWeight: "500",
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
  fieldErrorText: {
    color: "#ef4444",
    fontSize: 12,
    lineHeight: 16,
  },
  textArea: {
    minHeight: 92,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: "top",
  },
  switchRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  switchTextWrap: {
    flex: 1,
    gap: 2,
  },
  switchTitle: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "600",
  },
  switchSubtitle: {
    color: "#9ca3af",
    fontSize: 12,
    lineHeight: 18,
  },
  switchTrack: {
    width: 44,
    height: 24,
    borderRadius: 24,
    justifyContent: "center",
  },
  switchTrackActive: {
    backgroundColor: "#ebb140",
  },
  switchTrackInactive: {
    backgroundColor: "#e5e7eb",
  },
  switchThumb: {
    position: "absolute",
    top: 2,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#fff",
  },
  switchThumbActive: {
    right: 2,
  },
  switchThumbInactive: {
    left: 2,
  },
  pickerButton: {
    minHeight: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  pickerButtonDisabled: {
    opacity: 0.5,
  },
  pickerButtonText: {
    flex: 1,
    color: "#000",
    fontSize: 14,
    lineHeight: 20,
  },
  pickerPlaceholder: {
    color: "#d1d5db",
  },
  pickerChevron: {
    color: "#9ca3af",
    fontSize: 18,
    lineHeight: 22,
  },
  formErrorBox: {
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  formErrorText: {
    color: "#ef4444",
    fontSize: 13,
    lineHeight: 18,
  },
  saveButton: {
    height: 50,
    borderRadius: 8,
    backgroundColor: "#ebb140",
    alignItems: "center",
    justifyContent: "center",
  },
  saveButtonDisabled: {
    opacity: 0.65,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 14,
    lineHeight: 22,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
  geoPickerOverlay: {
    ...StyleSheet.absoluteFill,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
    zIndex: 10,
  },
  geoPickerCard: {
    maxHeight: "82%",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 24,
  },
  geoSearchInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 12,
    color: "#000",
    fontSize: 14,
    lineHeight: 20,
  },
  geoListContent: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  geoItem: {
    minHeight: 46,
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  geoItemSelected: {
    backgroundColor: "#fff7e6",
  },
  geoItemText: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    lineHeight: 22,
  },
  geoItemTextSelected: {
    color: "#c47f00",
    fontWeight: "600",
  },
  geoSelectedIcon: {
    color: "#ebb140",
    fontSize: 16,
    lineHeight: 20,
    fontWeight: "700",
  },
});
