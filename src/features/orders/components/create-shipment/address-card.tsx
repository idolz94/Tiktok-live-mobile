import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import type { ShopAddress, CustomerAddress } from "../../service/create-shipment-api";
import { addressLine } from "../../utils/shipment";
import { createStyles } from "@utils/createStyles";
import { Ionicons } from "@expo/vector-icons";

type FigmaAddressCardProps = {
  address: ShopAddress | CustomerAddress | null;
  loading?: boolean;
  onChangePress: () => void;
  onAddPress: () => void;
  type?: "sender" | "recipient";
};

export function FigmaAddressCard({
  address,
  loading,
  onChangePress,
  onAddPress,
  type = "sender",
}: FigmaAddressCardProps) {
  const { colors, textPresets } = useThemes();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
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
          Thêm mới {type === "sender" ? "người gửi" : "người nhận"}
        </Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.rowContainer}>
      {/* Icon Box */}
      <View
        style={[
          styles.iconBox,
          { backgroundColor: type === "sender" ? "#E2583E" : "#2B3B4C" },
        ]}
      >
        <View style={styles.iconWrapper}>
          <Ionicons name="person" size={16} color="#fff" />
          <Ionicons
            name={type === "sender" ? "arrow-forward" : "arrow-back"}
            size={10}
            color="#fff"
            style={[
              styles.arrowSubIcon,
              type === "sender" ? { right: -1 } : { left: -1 },
            ]}
          />
        </View>
      </View>

      {/* Info Container */}
      <View style={styles.infoContainer}>
        <View style={styles.namePhoneRow}>
          <Text
            style={[
              { color: colors.neutral900 },
              textPresets.fs16_500,
            ]}
          >
            {address.name ?? "—"}
          </Text>
          <Text
            style={[
              {
                color: "#E2583E",
                textDecorationLine: "underline",
              },
              textPresets.fs14_400,
            ]}
          >
            {address.phone ?? "—"}
          </Text>
        </View>
        <Text
          style={[
            { color: colors.neutral400 },
            textPresets.fs12_400,
            styles.addressText,
          ]}
          numberOfLines={2}
        >
          {addressLine(address)}
        </Text>
      </View>

      {/* Sổ địa chỉ Button */}
      <Pressable
        onPress={onChangePress}
        style={styles.bookButton}
      >
        <Ionicons name="book-outline" size={20} color="#4B5563" />
        <Text style={styles.bookButtonText}>
          Sổ địa{"\n"}chỉ
        </Text>
      </Pressable>
    </View>
  );
}

const styles = createStyles(() => ({
  loadingContainer: {
    height: 60,
    alignItems: "center" as const,
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
  rowContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  iconBox: {
    width: 44,
    height: 44,
    borderRadius: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    alignSelf: "flex-start" as const,
  },
  iconWrapper: {
    width: 24,
    height: 24,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  arrowSubIcon: {
    position: "absolute" as const,
    bottom: 0,
  },
  infoContainer: {
    flex: 1,
    gap: 4,
  },
  namePhoneRow: {
    flexDirection: "row" as const,
    alignItems: "baseline" as const,
    flexWrap: "wrap" as const,
    columnGap: 8,
  },
  addressText: {
    lineHeight: 18,
  },
  bookButton: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: 60,
    gap: 4,
  },
  bookButtonText: {
    fontSize: 11,
    color: "#4B5563",
    textAlign: "center" as const,
    fontWeight: "500" as const,
    lineHeight: 14,
  },
}));

