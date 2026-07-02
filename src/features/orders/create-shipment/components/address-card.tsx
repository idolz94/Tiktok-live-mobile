import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import type { ShopAddress, CustomerAddress } from "../service/create-shipment-api";
import { addressLine } from "../utils/shipment";
import { shipmentStyles } from "./shipment-styles";

type FigmaAddressCardProps = {
  address: ShopAddress | CustomerAddress | null;
  loading?: boolean;
  onChangePress: () => void;
  onAddPress: () => void;
};

export function FigmaAddressCard({
  address,
  loading,
  onChangePress,
  onAddPress,
}: FigmaAddressCardProps) {
  const { colors, textPresets } = useThemes();
  if (loading) {
    return (
      <View
        style={[
          shipmentStyles.addressCard,
          { borderColor: colors.border10, backgroundColor: colors.surface },
        ]}
      >
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!address) {
    return (
      <Pressable
        onPress={onAddPress}
        style={[
          shipmentStyles.addAddressCard,
          { borderColor: colors.border20 },
        ]}
      >
        <View
          style={[shipmentStyles.addCircle, { borderColor: colors.primary }]}
        >
          <Text style={[{ color: colors.primary }, textPresets.fs18_700]}>
            +
          </Text>
        </View>
        <Text style={[{ color: colors.primary }, textPresets.fs16_500]}>
          Thêm mới
        </Text>
      </Pressable>
    );
  }

  const initial = (address.name?.trim()?.charAt(0) || "L").toUpperCase();
  return (
    <View
      style={[
        shipmentStyles.addressCard,
        { borderColor: colors.border10, backgroundColor: colors.surface },
      ]}
    >
      <View style={shipmentStyles.addressTopRow}>
        <View
          style={[
            shipmentStyles.avatar,
            { backgroundColor: colors.primaryLight },
          ]}
        >
          <Text style={[{ color: colors.primary }, textPresets.fs16_500]}>
            {initial}
          </Text>
        </View>
        <View style={shipmentStyles.addressInfo}>
          <View style={shipmentStyles.addressNameRow}>
            <Text
              style={[
                shipmentStyles.addressName,
                { color: colors.neutral900 },
                textPresets.fs16_500,
              ]}
              numberOfLines={1}
            >
              {address.name ?? "—"}
            </Text>
            {address.isDefault && (
              <View
                style={[
                  shipmentStyles.defaultBadge,
                  { backgroundColor: colors.primaryLight },
                ]}
              >
                <Text style={[{ color: colors.primary }, textPresets.fs11_400]}>
                  Mặc định
                </Text>
              </View>
            )}
          </View>
          <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>
            {address.phone ?? "—"}
          </Text>
        </View>
        <Pressable
          onPress={onChangePress}
          hitSlop={8}
          style={[shipmentStyles.changePill, { borderColor: colors.border10 }]}
        >
          <Text style={[{ color: colors.primary }, textPresets.fs12_500]}>
            Thay đổi
          </Text>
        </Pressable>
      </View>
      <Text
        style={[
          shipmentStyles.addressLine,
          { color: colors.neutral400 },
          textPresets.fs14_400,
        ]}
        numberOfLines={2}
      >
        {addressLine(address)}
      </Text>
    </View>
  );
}

