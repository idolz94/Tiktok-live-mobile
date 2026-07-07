import { Image, Linking, Pressable, Text, View } from "react-native";
import { Avatar } from "@components/avatar";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { CustomerDetailSheet } from "@components/customer-detail-sheet";
import { Icon } from "@components/icon";
import { OrderWithTikTok } from "@app-types/index";
import { createStyles } from "@utils/createStyles";
import { Section } from "./order-detail-primitives";
import { useCallback } from "react";
import type { CustomerAddress } from "@features/orders/service/create-shipment-api";
import { getCustomerTypeIcon } from "@features/customers/customer-type-icon";

type OrderDetailCustomerSectionProps = {
  order: OrderWithTikTok;
  displayName: string;
  customerDefaultAddress?: CustomerAddress | null;
  onTikTok?: () => void;
};

function formatCustomerAddress(addr: CustomerAddress): string {
  return [addr.address, addr.ward, addr.district, addr.province]
    .filter(Boolean)
    .join(", ");
}

export function OrderDetailCustomerSection({
  order,
  displayName,
  customerDefaultAddress,
  onTikTok,
}: OrderDetailCustomerSectionProps) {
  const { show } = useBottomSheet();

  const handlePhone = useCallback(() => {
    if (!order.customerPhone) return;
    Linking.openURL(`tel:${order.customerPhone}`);
  }, [order.customerPhone]);

  const handlePressAvatar = useCallback(() => {
    const customerKey = order.customerTikTokUsername || order.username;
    if (customerKey)
      show({
        content: <CustomerDetailSheet customerKey={customerKey} />,
        showDragIndicator: true,
        snapPoints: ["92%"],
      });
  }, [order.customerTikTokUsername, order.username, show]);

  const handleZalo = useCallback(() => {
    if (!order.customerPhone) return;
    const zaloUrl = `https://zalo.me/${order.customerPhone}`;
    Linking.openURL(zaloUrl);
  }, [order.customerPhone]);

  return (
    <Section>
      <View style={styles.customerTopRow}>
        <Pressable onPress={handlePressAvatar}>
          <Avatar
            uri={order.avatar || order.avatarUrl}
            username={displayName}
            size={40}
          />
        </Pressable>
        <View style={styles.customerInfo}>
          <Text style={styles.customerName}>{displayName}</Text>
          {!!order.customerType && (() => {
            const icon = getCustomerTypeIcon(order.customerType);
            return icon ? (
              <View style={styles.customerTypeBadge}>
                <Image source={icon} style={styles.customerTypeIcon} />
                <Text style={styles.customerTypeText}>{order.customerType}</Text>
              </View>
            ) : null;
          })()}
        </View>
      </View>
      <View style={styles.contactRows}>
        <View style={styles.contactRow}>
          <Icon name="group_user" size={16} tintColor="neutral400" />
          <Text
            style={[
              styles.contactText,
              !order.customerPhone && styles.contactTextMuted,
            ]}
          >
            {order.customerPhone || "Chưa có số điện thoại"}
          </Text>
        </View>
        <View style={styles.contactRow}>
          <Icon name="truck" size={16} tintColor="neutral400" />
          <Text
            style={[
              styles.contactText,
              !customerDefaultAddress &&
                !order.customerAddress &&
                styles.contactTextMuted,
            ]}
          >
            {customerDefaultAddress
              ? formatCustomerAddress(customerDefaultAddress)
              : order.customerAddress || "Chưa có địa chỉ"}
          </Text>
        </View>
      </View>
      <View style={styles.customerActions}>
        <Pressable onPress={onTikTok} style={styles.customerActionBtn}>
          <Icon name="followers" size={20} tintColor="neutral900" />
          <Text style={styles.customerActionLabel}>Tiktok</Text>
        </Pressable>
        <Pressable style={styles.customerActionBtn} onPress={handleZalo}>
          <Icon name="more" size={20} tintColor="neutral900" />
          <Text style={styles.customerActionLabel}>Zalo</Text>
        </Pressable>
        <Pressable onPress={handlePhone} style={styles.customerActionBtn}>
          <Icon name="group_user" size={20} tintColor="neutral900" />
          <Text style={styles.customerActionLabel}>Điện thoại</Text>
        </Pressable>
      </View>
    </Section>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  customerTopRow: { flexDirection: "row", alignItems: "center", columnGap: 10 },
  customerInfo: { flex: 1, rowGap: 4 },
  customerName: { color: colors.neutral900, ...textPresets.fs16_600 },
  customerTypeBadge: { flexDirection: "row", alignItems: "center", columnGap: 4 },
  customerTypeIcon: { width: 20, height: 20 },
  customerTypeText: { color: colors.neutral400, ...textPresets.fs12_400 },
  contactRows: { rowGap: 8 },
  contactRow: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  contactText: { color: colors.neutral400, ...textPresets.fs12_400, flex: 1 },
  contactTextMuted: { color: colors.textMuted },
  customerActions: {
    flexDirection: "row",
    columnGap: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: colors.border10,
  },
  customerActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
    height: 40,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: colors.neutral50,
  },
  customerActionLabel: { color: colors.neutral900, ...textPresets.fs12_500 },
}));
