import { Button } from "@components/button";
import { Ionicons } from "@expo/vector-icons";
import { formatShopAddress } from "@features/settings/schemas/shipping-address-form-schema";
import { ShopAddress } from "@features/settings/service/shop-addresses-api";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { shippingSettingsStyles as styles } from "./shipping-settings.styles";

type ShippingAddressSectionProps = {
  address: ShopAddress | null;
  isLoading: boolean;
  onAdd: () => void;
  onEdit: (address: ShopAddress) => void;
};

export function ShippingAddressSection({
  address,
  isLoading,
  onAdd,
  onEdit,
}: ShippingAddressSectionProps) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>Địa chỉ kho hàng</Text>
      <AddressContent address={address} isLoading={isLoading} onEdit={onEdit} />
      <Button
        onPress={onAdd}
        type="outline-dashed"
        title="Thêm mới"
        icon={<Ionicons name="add" size={18} color={"black"} />}
      />
    </View>
  );
}

function AddressContent({
  address,
  isLoading,
  onEdit,
}: Omit<ShippingAddressSectionProps, "onAdd">) {
  if (isLoading) {
    return (
      <View style={styles.emptyWarehouseCard}>
        <ActivityIndicator size="small" color="#E2583E" />
        <Text style={styles.emptyWarehouseText}>Đang tải địa chỉ kho...</Text>
      </View>
    );
  }

  if (!address) {
    return (
      <View style={styles.emptyWarehouseCard}>
        <View style={styles.emptyWarehouseIconBox}>
          <Ionicons name="home-outline" size={28} color="#E2583E" />
        </View>
        <Text style={styles.emptyWarehouseTitle}>Chưa có địa chỉ kho</Text>
        <Text style={styles.emptyWarehouseText}>
          Thêm địa chỉ để tạo đơn và cấu hình vận chuyển.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.warehouseCard}>
      <View style={styles.warehouseIconBox}>
        <Ionicons name="home" size={20} color="#fff" />
      </View>
      <View style={styles.warehouseInfo}>
        <View style={styles.warehouseNameRow}>
          <Text style={styles.warehouseName} numberOfLines={1}>
            {address.name || address.label || "Kho hàng"}
          </Text>
          {address.phone ? (
            <Text style={styles.warehousePhone}>{address.phone}</Text>
          ) : null}
        </View>
        <Text style={styles.warehouseAddress} numberOfLines={2}>
          {formatShopAddress(address)}
        </Text>
      </View>
      <Pressable
        onPress={() => onEdit(address)}
        hitSlop={8}
        style={styles.warehouseEditButton}
      >
        <Ionicons name="create-outline" size={20} color="#4B5563" />
        <Text style={styles.warehouseEditButtonText}>Sửa</Text>
      </Pressable>
    </View>
  );
}
