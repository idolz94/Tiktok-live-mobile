import { ShopAddress } from "@features/settings/service/shop-addresses-api";
import { formatShopAddress } from "@features/settings/schemas/shipping-address-form-schema";
import {
  ActivityIndicator,
  Pressable,
  StyleProp,
  Text,
  TextStyle,
  View,
} from "react-native";
import { shippingSettingsStyles as styles } from "./shipping-settings.styles";
import { colors } from "@themes/colors";

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

      <Pressable style={styles.addButton} onPress={onAdd}>
        <Text style={styles.addIcon}>＋</Text>
        <Text style={styles.addText}>Thêm mới</Text>
      </Pressable>
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
        <ActivityIndicator color="#000" />
        <Text style={styles.emptyWarehouseText}>Đang tải địa chỉ kho...</Text>
      </View>
    );
  }

  if (!address) {
    return (
      <View style={styles.emptyWarehouseCard}>
        <Text style={styles.emptyWarehouseTitle}>Chưa có địa chỉ kho</Text>
        <Text style={styles.emptyWarehouseText}>
          Thêm địa chỉ để tạo đơn và cấu hình vận chuyển.
        </Text>
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
          <View
            style={{
              flexDirection: "row",
              alignItems: "baseline",
              columnGap: 2,
            }}
          >
            <Text style={styles.storeName} numberOfLines={1}>
              {address.name || address.label || "Kho hàng"}
            </Text>
            <InfoLine
              text={address.phone || "Chưa có số điện thoại"}
              textStyle={{
                textDecorationLine: "underline",
                color: colors.primary,
              }}
            />
          </View>
          {address.isDefault ? (
            <Text style={styles.storeDefaultText}>Mặc định</Text>
          ) : null}
          <View style={styles.warehouseMeta}>
            <InfoLine
              icon="⌖"
              text={formatShopAddress(address)}
              numberOfLinesText={2}
            />
          </View>
        </View>
      </View>

      <Pressable onPress={() => onEdit(address)}>
        <Text style={styles.editIcon}>✎</Text>
        <Text style={styles.editText}>Sửa</Text>
      </Pressable>
    </View>
  );
}

function InfoLine({
  icon,
  text,
  textStyle,
  numberOfLinesText,
}: {
  icon?: string;
  text: string;
  textStyle?: StyleProp<TextStyle>;
  numberOfLinesText?: number;
}) {
  return (
    <View style={styles.infoLine}>
      {!!icon && <Text style={styles.infoIcon}>{icon}</Text>}
      <Text
        style={[styles.infoText, textStyle]}
        numberOfLines={numberOfLinesText}
      >
        {text}
      </Text>
    </View>
  );
}
