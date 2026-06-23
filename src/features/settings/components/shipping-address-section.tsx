import { ShopAddress } from "@features/settings/service/shop-addresses-api";
import { formatShopAddress } from "@features/settings/hooks/shipping-address-form.schema";
import { ActivityIndicator, Text, TouchableOpacity, View } from "react-native";
import { shippingSettingsStyles as styles } from "./shipping-settings.styles";

type ShippingAddressSectionProps = {
  address: ShopAddress | null;
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (address: ShopAddress) => void;
};

export function ShippingAddressSection({ address, isLoading, onAdd, onEdit }: ShippingAddressSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Địa chỉ kho hàng</Text>

      <AddressContent address={address} isLoading={isLoading} onEdit={onEdit} />

      <TouchableOpacity style={styles.addButton} activeOpacity={0.75} onPress={onAdd}>
        <Text style={styles.addIcon}>＋</Text>
        <Text style={styles.addText}>Thêm mới</Text>
      </TouchableOpacity>
    </View>
  );
}

function AddressContent({ address, isLoading, onEdit }: Omit<ShippingAddressSectionProps, "onAdd">) {
  if (isLoading) {
    return (
      <View style={styles.emptyWarehouseCard}>
        <ActivityIndicator color="#000" />
        <Text style={styles.emptyWarehouseText}>Đang tải địa chỉ kho...</Text>
      </View>
    );
  }

  if (!address) {
    return (
      <View style={styles.emptyWarehouseCard}>
        <Text style={styles.emptyWarehouseTitle}>Chưa có địa chỉ kho</Text>
        <Text style={styles.emptyWarehouseText}>Thêm địa chỉ để tạo đơn và cấu hình vận chuyển.</Text>
      </View>
    );
  }

  return (
    <View style={styles.warehouseCard}>
      <View style={styles.warehouseHeader}>
        <View style={styles.storeIconBox}>
          <Text style={styles.storeIcon}>⌂</Text>
        </View>
        <View style={styles.storeNameWrap}>
          <Text style={styles.storeName}>{address.name || address.label || "Kho hàng"}</Text>
          {address.isDefault ? <Text style={styles.storeDefaultText}>Mặc định</Text> : null}
        </View>
        <TouchableOpacity style={styles.editButton} activeOpacity={0.75} onPress={() => onEdit(address)}>
          <Text style={styles.editIcon}>✎</Text>
          <Text style={styles.editText}>Sửa</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.warehouseMeta}>
        <InfoLine icon="☎" text={address.phone || "Chưa có số điện thoại"} />
        <InfoLine icon="⌖" text={formatShopAddress(address)} />
      </View>
    </View>
  );
}

function InfoLine({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={styles.infoLine}>
      <Text style={styles.infoIcon}>{icon}</Text>
      <Text style={styles.infoText}>{text}</Text>
    </View>
  );
}
