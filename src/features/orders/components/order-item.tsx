import { Order } from "@app-types/index";
import { images } from "@assets/images";
import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { Icon } from "@components/icon";
import { Image } from "@components/image";
import { Separator } from "@components/separator";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { formatMoney, getOrderTotal, statusLabel } from "../utils/order";
import { router } from "expo-router";

interface OrderItemProps {
  item: Order;
  depositLoading?: boolean;
  onToggleDeposit: (orderId: string) => void;
}

function createDisplayCode(orderCode: string) {
  const numbers = orderCode.replace(/\D/g, "");
  return (numbers || orderCode).slice(-6).padStart(6, "0");
}

export const OrderItem = memo(
  ({ item, depositLoading = false, onToggleDeposit }: OrderItemProps) => {
    const { colors } = useThemes();

  const products = item.products?.length ? item.products : [];
  const total = item.subtotalAmount || getOrderTotal(products);
  const displayName = item.customerName || item.username || "Khách live";
  const isPaid =
    item.depositStatus === "paid" || item.depositStatus === "deposited";

    const handleToggleDeposit = useCallback(() => {
      onToggleDeposit(item.id);
    }, [item.id, onToggleDeposit]);
  const onPressAvatar = useCallback(() => {
    const customerKey = item.customerTikTokUsername || item.username;
    if (customerKey) router.push({ pathname: "/customer-detail", params: { customerKey } });
  }, [item.customerTikTokUsername, item.username]);
  const onOpenOrderOverview = useCallback(() => {
    router.push({
      pathname: "/order-detail",
      params: { id: item.id },
    });
  }, [item.id]);

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <Pressable onPress={onPressAvatar}>
            <Avatar
              uri={item.avatar || item.avatarUrl}
              username={displayName}
              size={40}
            />
          </Pressable>
          <View style={styles.info}>
            <Text style={styles.displayName}>{displayName}</Text>
            <Text
              style={styles.orderId}
            >{`OrderID: ${createDisplayCode(item.orderCode || item.id)}`}</Text>
          </View>
          <View style={styles.actions}>
            <Image
              source={images.logo_tiktok}
              style={{ width: 24, height: 24 }}
            />
            <Icon name="print" size={24} tintColor="neutral900" />
            <Icon name="more" size={24} tintColor="neutral900" />
          </View>
        </View>
        <View style={styles.tags}>
          <View style={styles.typeCustomer}>
            <Icon name="king" size={16} />
            <Text style={styles.txtTag}>VIP</Text>
          </View>
          <View
            style={[
              styles.typeCustomer,
              {
                backgroundColor: colors.neutral50,
              },
            ]}
          >
            <Text style={styles.txtTag}>{statusLabel(item.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.productRow}>
        <View style={styles.productInfo}>
          <View style={styles.productNameWrap}>
            <Text numberOfLines={2} style={styles.txtProduct}>
              {item.productName || item.comment || "Sản phẩm"}
            </Text>
          </View>
          <Text style={styles.txtOrderTime}>
            {new Date(item.createdAt).toLocaleTimeString()}
          </Text>
        </View>
        <Text style={styles.txtProductPrice}>
          {`${formatMoney(Number(item.price || 0) * Number(item.quantity || 1))} x ${item.quantity}`}
        </Text>
      </View>

      <Separator type="horizontal" size={1} style={styles.separator} />

      <View style={styles.subtotalRow}>
        <View style={styles.subtotalLabels}>
          <Text style={styles.txtProduct}>Tạm tính</Text>
          <Text style={styles.txtProduct}>Thu tiền hộ (COD)</Text>
        </View>
        <View style={styles.subtotalValues}>
          <Text style={styles.txtProductPrice}>{formatMoney(total)}</Text>
          <Text
            style={[styles.txtProductPrice, { textAlign: "right" }]}
          >{`${item.discountAmount}đ`}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <View style={styles.btnWrap}>
          <Button
            title={isPaid ? "Đã cọc" : "Chưa cọc"}
            loading={depositLoading}
            loadingType="center"
            onPress={handleToggleDeposit}
            txtBtnStyle={[
              styles.txtNotPaid,
              {
                color: isPaid ? colors.success : colors.primary,
              },
            ]}
            containerStyle={[
              styles.btnStatus,
              {
                backgroundColor: isPaid
                  ? colors.successLight
                  : colors.primaryLight,
              },
            ]}
          />
        </View>
        <View style={styles.btnWrap}>
          <Button
            title="Tổng quan đơn hàng"
            loading={false}
            onPress={onOpenOrderOverview}
            gradientType="gra_primary"
            containerStyle={styles.btnSubmit}
            txtBtnStyle={styles.txtSubmit}
          />
        </View>
      </View>
    </View>
  );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral100,
    marginBottom: 8,
  },
  top: {
    rowGap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 16,
    justifyContent: "space-between",
  },
  info: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    paddingLeft: 72,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 12,
    paddingTop: 12,
  },
  productInfo: {
    flex: 1,
    rowGap: 2,
  },
  productNameWrap: {
    flexShrink: 1,
  },
  separator: {
    marginVertical: 12,
  },
  subtotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtotalLabels: {
    rowGap: 4,
  },
  subtotalValues: {
    rowGap: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 12,
    marginTop: 16,
  },
  displayName: {
    color: colors.neutral900,
    ...textPresets.fs16_500,
  },
  orderId: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  txtTag: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
  },
  txtProduct: {
    color: colors.neutral500,
    ...textPresets.fs14_400,
  },
  txtProductPrice: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  txtOrderTime: {
    color: colors.neutral300,
    ...textPresets.fs12_400,
  },
  txtNotPaid: {
    color: colors.primary,
    ...textPresets.fs14_500,
  },
  btnWrap: {
    flex: 1,
  },
  btnStatus: {
    backgroundColor: colors.primaryLight,
    borderRadius: 99,
    overflow: "hidden",
  },
  btnSubmit: {
    borderRadius: 99,
    overflow: "hidden",
  },
  txtSubmit: {
    color: colors.neutral100,
    ...textPresets.fs14_500,
  },
  typeCustomer: {
    padding: 6,
    borderRadius: 99,
    backgroundColor: colors.pink50,
    flexDirection: "row",
    columnGap: 4,
  },
}));
