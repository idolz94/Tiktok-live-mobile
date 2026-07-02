import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import type { ShopAddress, CustomerAddress } from "../../service/create-shipment-api";
import { addressLine } from "../../utils/shipment";
import { createStyles } from "@utils/createStyles";

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
          styles.addressCard,
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
          styles.addAddressCard,
          { borderColor: colors.border20 },
        ]}
      >
        <View
          style={[styles.addCircle, { borderColor: colors.primary }]}
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
        styles.addressCard,
        { borderColor: colors.border10, backgroundColor: colors.surface },
      ]}
    >
      <View style={styles.addressTopRow}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: colors.primaryLight },
          ]}
        >
          <Text style={[{ color: colors.primary }, textPresets.fs16_500]}>
            {initial}
          </Text>
        </View>
        <View style={styles.addressInfo}>
          <View style={styles.addressNameRow}>
            <Text
              style={[
                styles.addressName,
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
                  styles.defaultBadge,
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
          style={[styles.changePill, { borderColor: colors.border10 }]}
        >
          <Text style={[{ color: colors.primary }, textPresets.fs12_500]}>
            Thay đổi
          </Text>
        </Pressable>
      </View>
      <Text
        style={[
          styles.addressLine,
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

const styles = createStyles(() => ({
  addressCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 12,
    minHeight: 108,
    justifyContent: "center" as const,
  },
  addAddressCard: {
    height: 76,
    borderWidth: 1,
    borderStyle: "dashed" as const,
    borderRadius: 16,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 10,
  },
  addCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1.5,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  addressTopRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  addressInfo: { flex: 1, gap: 4 },
  addressNameRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
  },
  addressName: { flexShrink: 1 },
  changePill: {
    height: 32,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  defaultBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  addressLine: { lineHeight: 22 },
}));
