import { Order } from "@app-types/index";
import { images } from "@assets/images";
import { Avatar } from "@components/avatar";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Button } from "@components/button";
import { CustomerDetailSheet } from "@components/customer-detail-sheet";
import { Icon } from "@components/icon";
import { Image } from "@components/image";
import { Separator } from "@components/separator";
import { getCustomerTypeIcon } from "@features/customers/customer-type-icon";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { getOrderTikTokUsername, openTikTokProfile } from "@utils/tiktok";
import { router } from "expo-router";
import { memo, useCallback, useState } from "react";
import { Alert, Image as RNImage, Pressable, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  LinearTransition,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { formatMoney, getOrderTotal, statusLabel } from "../utils/order";

interface OrderItemProps {
  item: Order;
  depositLoading?: boolean;
  onToggleDeposit: (orderId: string) => void;
  onRemove?: (orderId: string) => void;
}

function createDisplayCode(orderCode: string) {
  const numbers = orderCode.replace(/\D/g, "");
  return (numbers || orderCode).slice(-6).padStart(6, "0");
}

export const OrderItem = memo(
  ({
    item,
    depositLoading = false,
    onToggleDeposit,
    onRemove,
  }: OrderItemProps) => {
    const { colors, shadows } = useThemes();
    const { show } = useBottomSheet();

    const products = item.products?.length ? item.products : [];
    const total = item.subtotalAmount || getOrderTotal(products);
    const displayName = item.customerName || item.username || "Khách live";
    const tiktokUsername = getOrderTikTokUsername(item) || item.username;
    const isPaid =
      item.depositStatus === "paid" || item.depositStatus === "deposited";

    const handleToggleDeposit = useCallback(() => {
      onToggleDeposit(item.id);
    }, [item.id, onToggleDeposit]);
    const onPressAvatar = useCallback(() => {
      const customerKey = item.customerTikTokUsername || item.username;
      if (customerKey)
        show({
          content: <CustomerDetailSheet customerKey={customerKey} />,
          showDragIndicator: true,
          snapPoints: ["92%"],
        });
    }, [item.customerTikTokUsername, item.username, show]);
    const onOpenOrderOverview = useCallback(() => {
      router.push({
        pathname: "/order-detail",
        params: { id: item.id },
      });
    }, [item.id]);

    const handleOpenTikTok = useCallback(() => {
      openTikTokProfile(tiktokUsername);
    }, [tiktokUsername]);

    const handleRemove = useCallback(() => {
      Alert.alert("Xoá đơn hàng", "Bạn có chắc muốn xoá đơn này không?", [
        { text: "Huỷ", style: "cancel" },
        {
          text: "Xoá",
          style: "destructive",
          onPress: () => onRemove?.(item.id),
        },
      ]);
    }, [item.id, onRemove]);

    const [showAll, setShowAll] = useState(false);
    const displayProducts = showAll ? products : products.slice(0, 3);
    const hiddenCount = products.length - 3;

    const chevronRotate = useSharedValue(0);
    const animatedChevronStyle = useAnimatedStyle(() => ({
      transform: [{ rotate: `${chevronRotate.value}deg` }],
    }));

    const handleToggleShowAll = useCallback(() => {
      const next = !showAll;
      chevronRotate.value = withTiming(next ? 180 : 0, { duration: 280 });
      setShowAll(next);
    }, [showAll, chevronRotate]);

    return (
      <View style={[styles.container, shadows.sd2]}>
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
            </View>
            <View style={styles.actions}>
              <Pressable onPress={handleOpenTikTok} hitSlop={8}>
                <Image
                  source={images.logo_tiktok}
                  style={{ width: 24, height: 24 }}
                />
              </Pressable>
              <Icon name="print" size={24} tintColor="neutral900" />
              <Pressable onPress={handleRemove} hitSlop={8}>
                <Icon name="close" size={20} tintColor="neutral900" />
              </Pressable>
            </View>
          </View>
          <View style={styles.tags}>
            <Text
              style={styles.orderId}
            >{`OrderID: ${createDisplayCode(item.orderCode || item.id)}`}</Text>
            {item.trackingCode ? (
              <Text style={styles.orderId} numberOfLines={1}>
                {`Vận đơn: ${item.trackingCode}`}
              </Text>
            ) : null}
            {(() => {
              const icon = getCustomerTypeIcon(item.customerType);
              return icon ? (
                <View style={styles.typeCustomer}>
                  <RNImage source={icon} style={styles.customerTypeIcon} />
                  <Text style={styles.txtTag}>{item.customerType}</Text>
                </View>
              ) : null;
            })()}
            <View
              style={[
                styles.typeCustomer,
                {
                  backgroundColor:
                    item.status === "confirmed"
                      ? colors.success
                      : colors.neutral50,
                },
              ]}
            >
              <Text
                style={[
                  styles.txtTag,
                  item.status === "confirmed" && { color: colors.neutral100 },
                ]}
              >
                {statusLabel(item.status)}
              </Text>
            </View>
          </View>
        </View>

        <Animated.View
          style={styles.productList}
          layout={LinearTransition.duration(280)}
        >
          {products.length > 0 ? (
            displayProducts.map((p, i) => (
              <Animated.View
                key={p.id}
                entering={FadeIn.duration(200)}
                exiting={FadeOut.duration(150)}
              >
                {i > 0 ? (
                  <Separator
                    type="horizontal"
                    size={1}
                    style={styles.productSep}
                  />
                ) : null}
                <View style={styles.productRow}>
                  <View style={[styles.productName, styles.productInfo]}>
                    <Text numberOfLines={2} style={styles.txtProduct}>
                      {p.code
                        ? p.code === p.name || !p.name || p.name === "Sản phẩm"
                          ? `Mã: ${p.code}${p.color ? ` (${p.color})` : ""}`
                          : `Mã: ${p.code} - ${p.name}${p.color ? ` (${p.color})` : ""}`
                        : (!p.name || p.name === "Sản phẩm") ? item.comment : p.name}
                    </Text>
                  </View>
                  <Text style={styles.txtProductPrice}>
                    {formatMoney(
                      Number(p.price || 0) * Number(p.quantity || 1),
                    )}
                  </Text>
                </View>
              </Animated.View>
            ))
          ) : (
            <View style={styles.productRow}>
              <Text
                numberOfLines={2}
                style={[styles.txtProduct, styles.productName]}
              >
                {item.productName || item.comment}
              </Text>
              <Text style={styles.txtProductPrice}>
                {formatMoney(
                  Number(item.price || 0) * Number(item.quantity || 1),
                )}
              </Text>
            </View>
          )}
          {products.length > 3 ? (
            <Pressable style={styles.expandBtn} onPress={handleToggleShowAll}>
              <Text style={styles.expandText}>
                {showAll ? "Thu gọn" : `Xem thêm (${hiddenCount})`}
              </Text>
              <Animated.View style={animatedChevronStyle}>
                <Icon name="chevron_down" size={14} tintColor="neutral400" />
              </Animated.View>
            </Pressable>
          ) : null}
        </Animated.View>

        <Separator type="horizontal" size={1} style={styles.separator} />

        <View style={styles.subtotalRow}>
          <Text style={styles.txtProduct}>Tạm tính</Text>
          <Text style={styles.txtProductPrice}>{formatMoney(total)}</Text>
        </View>

        <View style={styles.footer}>
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
          <Button
            title="Tổng quan đơn hàng"
            loading={false}
            loadingType="center"
            onPress={onOpenOrderOverview}
            gradientType="gra_primary"
            containerStyle={styles.btnSubmit}
            txtBtnStyle={styles.txtSubmit}
          />
        </View>
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral100,
    marginBottom: 8,
    borderRadius: 16,
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
    columnGap: 8,
  },
  productList: {
    marginTop: 12,
    rowGap: 6,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 12,
  },
  productName: {
    flex: 1,
  },
  productInfo: {
    rowGap: 2,
  },
  productSep: {
    marginVertical: 8,
  },
  separator: {
    marginVertical: 12,
  },
  expandBtn: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    paddingVertical: 4,
    marginTop: 4,
  },
  expandText: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  subtotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  footer: {
    flex: 1,
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
  txtNotPaid: {
    color: colors.primary,
    ...textPresets.fs14_500,
  },
  btnStatus: {
    flex: 1,
    backgroundColor: colors.primaryLight,
    borderRadius: 99,
    overflow: "hidden",
  },
  btnSubmit: {
    flex: 1,
    borderRadius: 99,
    overflow: "hidden",
  },
  txtSubmit: {
    color: colors.neutral100,
    ...textPresets.fs14_500,
  },
  typeCustomer: {
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 99,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
  },
  customerTypeIcon: {
    width: 18,
    height: 18,
  },
}));
