import { Image, Linking, Pressable, Text, View } from "react-native";
import { Avatar } from "@components/avatar";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { CustomerDetailSheet } from "@components/customer-detail-sheet";
import { Icon } from "@components/icon";
import { images } from "@assets/images";
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
          {!!order.customerType &&
            (() => {
              const icon = getCustomerTypeIcon(order.customerType);
              return icon ? (
                <View style={styles.customerTypeBadge}>
                  <Image source={icon} style={styles.customerTypeIcon} />
                  <Text style={styles.customerTypeText}>
                    {order.customerType}
                  </Text>
                </View>
              ) : null;
            })()}
        </View>
      </View>
      <View style={styles.contactRows}>
        <View style={styles.contactRow}>
          <Image source={images.logo_phone} style={styles.contactIcon} />
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
        <Text
          style={[
            styles.contactText,
            !order.orderCode && styles.contactTextMuted,
          ]}
        >
          Order ID: {order.orderCode}
        </Text>
      </View>
      <View style={styles.customerActions}>
        <Pressable onPress={onTikTok} style={[styles.customerActionBtn, styles.btnTikTok]}>
          <Image source={images.logo_tiktok} style={styles.socialImg} />
          <Text style={[styles.customerActionLabel, { color: "#000000" }]}>Tiktok</Text>
        </Pressable>
        <Pressable style={[styles.customerActionBtn, styles.btnZalo]} onPress={handleZalo}>
          <Image source={images.logo_zalo} style={styles.socialImg} />
          <Text style={[styles.customerActionLabel, { color: "#006aff" }]}>Zalo</Text>
        </Pressable>
        <Pressable onPress={handlePhone} style={[styles.customerActionBtn, styles.btnPhone]}>
          <Image source={images.logo_phone} style={styles.socialImg} />
          <Text style={[styles.customerActionLabel, { color: "#52c41a" }]}>Điện thoại</Text>
        </Pressable>
      </View>
    </Section>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  customerTopRow: { flexDirection: "row", alignItems: "center", columnGap: 10 },
  customerInfo: { flex: 1, rowGap: 4 },
  customerName: { color: colors.neutral900, ...textPresets.fs16_600 },
  customerTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
  },
  customerTypeIcon: { width: 20, height: 20 },
  customerTypeText: { color: colors.neutral400, ...textPresets.fs12_400 },
  contactRows: { rowGap: 8 },
  contactRow: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  contactText: { color: colors.neutral400, ...textPresets.fs12_400, flex: 1 },
  contactTextMuted: { color: colors.textMuted },
  contactIcon: { width: 16, height: 16 },
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
    columnGap: 6,
    height: 32,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  btnTikTok: { backgroundColor: "rgba(0,0,0,0.08)" },
  btnZalo: { backgroundColor: "rgba(0,106,255,0.1)" },
  btnPhone: { backgroundColor: "rgba(82,196,26,0.1)" },
  customerActionLabel: { ...textPresets.fs12_500 },
  socialImg: { width: 16, height: 16 },
}));
