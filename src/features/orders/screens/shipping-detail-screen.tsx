import type { ShippingStatus } from "@app-types/index";
import { Button } from "@components/button";
import { Header } from "@components/header";
import { LinearGradient } from "@components/linear-gradient";
import { LinearGradient as ExpoLinearGradient } from "expo-linear-gradient";
import { icons } from "@assets/icons";
import { useLocalSearchParams, router } from "expo-router";
import { useState, useCallback } from "react";
import {
  ActivityIndicator,
  Clipboard,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useToast } from "@components/toast";
import { createStyles } from "@utils/createStyles";
import { useThemes } from "@hooks/use-theme";
import { getShipmentLabelApi } from "../service/create-shipment-api";
import { updateOrderDepositStatusApi } from "../service/api";
import type { ShippingOrder } from "../hooks/use-shipping-tab";

const STATUS_LABEL: Record<ShippingStatus, string> = {
  not_shipped: "Chưa giao",
  submitted: "Chờ lấy hàng",
  pending_pickup: "Chờ lấy hàng",
  waiting_pickup: "Chờ lấy hàng",
  in_transit: "Đang vận chuyển",
  shipping: "Đang giao hàng",
  delivering: "Đang giao hàng",
  delivered: "Đã giao hàng",
  on_hold: "Tạm giữ",
  pickup_failed: "Lấy hàng thất bại",
  failed: "Giao thất bại",
  damaged: "Hàng hỏng",
  lost: "Mất hàng",
  returning: "Đang hoàn hàng",
  return_failed: "Hoàn thất bại",
  returned: "Đã hoàn hàng",
  cancelled: "Đã hủy",
};

const STEPPER_STEPS: { label: string; icon: keyof typeof icons }[] = [
  { label: "Chờ lấy\nhàng", icon: "shipping_step_pickup" },
  { label: "Đang vận\nchuyển", icon: "shipping_step_transit" },
  { label: "Đang giao\nhàng", icon: "shipping_step_delivering" },
  { label: "Đã giao\nhàng", icon: "shipping_step_delivered" },
];

function statusToStep(status: ShippingStatus): number {
  if (status === "delivered") return 3;
  if (status === "shipping" || status === "delivering") return 2;
  if (status === "in_transit") return 1;
  return 0;
}

export default function ShippingDetailScreen() {
  const { order: orderParam } = useLocalSearchParams<{
    id: string;
    order: string;
  }>();
  const { colors, textPresets } = useThemes();
  const { bottom } = useSafeAreaInsets();
  const toast = useToast();
  const [printing, setPrinting] = useState(false);
  const [navigated, setNavigated] = useState(false);
  const [depositStatus, setDepositStatus] = useState<string>(
    () => (order as ShippingOrder | null)?.depositStatus ?? "unpaid",
  );
  const [depositLoading, setDepositLoading] = useState(false);

  const order = orderParam
    ? (() => {
        try {
          return JSON.parse(orderParam) as ShippingOrder;
        } catch {
          return null;
        }
      })()
    : null;

  const handlePrintLabel = useCallback(async () => {
    if (!order?.id || printing) return;
    setPrinting(true);
    try {
      const res = await getShipmentLabelApi(order.id);
      if (res.labelUrl) await Linking.openURL(res.labelUrl);
      else
        toast.info({
          title: "Chưa có nhãn in",
          description: "Vận đơn chưa có nhãn để in.",
        });
    } catch {
      toast.error({
        title: "Lỗi",
        description: "Không thể lấy nhãn in. Vui lòng thử lại.",
      });
    } finally {
      setPrinting(false);
    }
  }, [order?.id, printing]);

  const handleToggleDeposit = useCallback(async () => {
    if (!order?.id || depositLoading) return;
    const isPaid = depositStatus === "paid" || depositStatus === "deposited";
    const nextStatus = isPaid ? "unpaid" : "paid";
    setDepositLoading(true);
    setDepositStatus(nextStatus);
    try {
      await updateOrderDepositStatusApi({
        orderId: order.id,
        depositStatus: nextStatus,
      });
    } catch {
      setDepositStatus(depositStatus);
    } finally {
      setDepositLoading(false);
    }
  }, [order?.id, depositStatus, depositLoading]);

  const handleCall = useCallback(() => {
    const phone = order?.customerPhone?.trim();
    if (!phone) return;
    void Linking.openURL(`tel:${phone}`);
  }, [order?.customerPhone]);

  if (!order) {
    return (
      <View
        style={[
          styles.root,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <Text style={{ color: colors.neutral500 }}>
          Không tìm thấy đơn hàng.
        </Text>
      </View>
    );
  }

  const isCancelled = order.shippingStatus === "cancelled";
  const isManual = !/ghn|ghtk|vtp|viettel|spx|shopee/i.test(
    order.providerName ?? "",
  );
  const isWaitingManual = isManual && order.shippingStatus === "submitted";
  const currentStep = statusToStep(order.shippingStatus);
  const displayCode =
    order.trackingCode ?? order.orderCode ?? order.id.slice(0, 8);
  const senderDistrict = "Cửa hàng";
  const receiverDistrict =
    order.customerAddressData?.district ??
    order.customerAddressData?.province ??
    "Người nhận";

  return (
    <View style={styles.root}>
      {isCancelled ? (
        <ExpoLinearGradient
          colors={[
            "rgba(255,107,138,0.2)",
            "rgba(255,166,109,0.1)",
            "transparent",
          ]}
          style={styles.headerBackground}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      ) : (
        <LinearGradient
          type="gra_background"
          style={styles.headerBackground}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
      )}

      <Header title={STATUS_LABEL[order.shippingStatus]} transparent />

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: 100 + bottom },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Stepper */}
        {!isCancelled && (
          <View style={styles.sectionCard}>
            <View style={styles.stepper}>
              {STEPPER_STEPS.map((step, i) => {
                const active = i <= currentStep;
                const isLast = i === STEPPER_STEPS.length - 1;
                return (
                  <View key={step.icon} style={styles.stepWrapper}>
                    <View style={styles.stepItem}>
                      <Image
                        source={icons[step.icon]}
                        style={[
                          styles.stepIcon,
                          { tintColor: active ? "#ee4d2d" : "#aaaaaa" },
                        ]}
                      />
                      <Text
                        style={[
                          styles.stepLabel,
                          {
                            color: active ? "#ee4d2d" : colors.neutral400,
                            ...textPresets.fs11_400,
                          },
                        ]}
                        numberOfLines={2}
                      >
                        {step.label}
                      </Text>
                    </View>
                    {!isLast && (
                      <View
                        style={[
                          styles.stepConnector,
                          {
                            backgroundColor:
                              i < currentStep ? "#ee4d2d" : "#aaaaaa",
                          },
                        ]}
                      />
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Order Summary */}
        <View style={styles.sectionCard}>
          <View style={styles.orderSummaryRow}>
            <View style={styles.orderCodeGroup}>
              <Text
                style={[{ color: colors.neutral500, ...textPresets.fs14_400 }]}
              >
                Mã đơn hàng:{" "}
              </Text>
              <View style={{ flexShrink: 1 }}>
                <Text
                  style={[
                    { color: colors.neutral900, ...textPresets.fs14_500 },
                  ]}
                  numberOfLines={1}
                >
                  {displayCode}
                </Text>
              </View>
              <Pressable
                onPress={async () => {
                  // void Linking.openURL("");
                  await Clipboard.setString(displayCode);
                  toast.success({ title: "Đã sao chép" });
                }}
                hitSlop={8}
                style={styles.copyBtn}
              >
                <Ionicons
                  name="copy-outline"
                  size={14}
                  color={colors.neutral500}
                />
              </Pressable>
            </View>
            <Pressable
              style={[styles.detailLink, navigated && { opacity: 0.4 }]}
              disabled={navigated}
              onPress={() => {
                setNavigated(true);
                router.push({
                  pathname: "/order-detail" as never,
                  params: { id: order.id },
                });
              }}
            >
              <Text
                style={[
                  {
                    color: isCancelled ? "#ff6b8a" : colors.primary,
                    ...textPresets.fs14_500,
                  },
                ]}
              >
                Chi tiết
              </Text>
              <Ionicons
                name="chevron-forward"
                size={14}
                color={isCancelled ? "#ff6b8a" : colors.primary}
              />
            </Pressable>
          </View>
        </View>

        {/* Route Info */}
        <View style={styles.sectionCard}>
          <View style={styles.routeRow}>
            <Text
              style={[
                styles.routeText,
                { color: colors.neutral900, ...textPresets.fs14_500 },
              ]}
              numberOfLines={1}
            >
              {senderDistrict}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={16}
              color={colors.neutral400}
            />
            <Text
              style={[
                styles.routeText,
                { color: colors.neutral900, ...textPresets.fs14_500 },
              ]}
              numberOfLines={1}
            >
              {receiverDistrict}
            </Text>
          </View>
        </View>

        {/* Recipient */}
        <View style={styles.sectionCard}>
          <View style={styles.recipientRow}>
            <View style={styles.recipientAvatar}>
              <Ionicons name="person" size={20} color="#fff" />
            </View>
            <View style={styles.recipientInfo}>
              <Text
                style={[{ color: colors.neutral500, ...textPresets.fs14_500 }]}
              >
                Người Nhận
              </Text>
              <Text
                style={[{ color: colors.neutral900, ...textPresets.fs14_500 }]}
              >
                {order.customerName || "Khách hàng"}
                {order.customerPhone ? (
                  <Text
                    style={{
                      color: "#ff5c00",
                      textDecorationLine: "underline",
                    }}
                  >
                    {" "}
                    {order.customerPhone}
                  </Text>
                ) : null}
              </Text>
            </View>
            {order.customerPhone ? (
              <Pressable
                style={[styles.callBtn, { backgroundColor: colors.neutral50 }]}
                onPress={handleCall}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={colors.neutral900}
                />
              </Pressable>
            ) : null}
          </View>
          {order.customerAddressData?.address ? (
            <Text
              style={[
                styles.addressText,
                { color: colors.neutral500, ...textPresets.fs12_400 },
              ]}
            >
              {[
                order.customerAddressData.address,
                order.customerAddressData.ward,
                order.customerAddressData.district,
                order.customerAddressData.province,
              ]
                .filter(Boolean)
                .join(", ")}
            </Text>
          ) : null}
        </View>

        {/* Journey */}
        <View style={styles.sectionCard}>
          <View style={styles.journeyHeader}>
            <Text
              style={[{ color: colors.neutral900, ...textPresets.fs16_600 }]}
            >
              Hành Trình Đơn Hàng
            </Text>
            <Pressable style={styles.copyInfoBtn}>
              <Ionicons name="link-outline" size={14} color={colors.primary} />
              <Text
                style={[{ color: colors.primary, ...textPresets.fs12_400 }]}
              >
                Sao chép thông tin
              </Text>
            </Pressable>
          </View>
          <View style={styles.journeyItem}>
            <View style={styles.journeyDotCol}>
              <View
                style={[
                  styles.journeySquareDot,
                  { borderColor: "#dadada", backgroundColor: "#f7f8fa" },
                ]}
              >
                <View style={styles.journeyDotInner} />
              </View>
              <View
                style={[styles.journeyVertLine, { backgroundColor: "#dadada" }]}
              />
            </View>
            <View style={styles.journeyContent}>
              <View style={styles.journeyContentRow}>
                <Ionicons
                  name="document-text-outline"
                  size={14}
                  color={colors.neutral500}
                />
                <Text
                  style={[
                    { color: colors.neutral900, ...textPresets.fs14_400 },
                  ]}
                >
                  {STATUS_LABEL[order.shippingStatus]}
                </Text>
              </View>
              {order.trackingCode ? (
                <Text
                  style={[
                    { color: colors.neutral400, ...textPresets.fs12_400 },
                  ]}
                >
                  {isManual ? "Mã đơn hàng" : "Mã SPX"}: {order.trackingCode}
                </Text>
              ) : null}
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Action Bar — text-only buttons, no icons */}
      <View
        style={[
          styles.actionBar,
          {
            borderTopColor: colors.border10,
            backgroundColor: colors.white,
            paddingBottom: Math.max(bottom, 16),
          },
        ]}
      >
        <View style={styles.actionGrid}>
          {isCancelled ? (
            <Button
              title="Chăm sóc khách hàng"
              containerStyle={[
                styles.actionButton,
                { flex: 1, backgroundColor: colors.neutral50 },
              ]}
              txtBtnStyle={[
                styles.actionButtonText,
                { color: colors.neutral900, ...textPresets.fs12_400 },
              ]}
            />

          ) : (
            <>
              <Button
                title={isWaitingManual ? "In Đơn Hàng" : "In Đơn Hàng SPX"}
                loading={printing}
                loadingType="center"
                onPress={() => {
                  if (isWaitingManual) {
                    router.push({
                      pathname: "/shipping-label" as never,
                      params: { id: order.id, order: orderParam },
                    });
                  } else {
                    void handlePrintLabel();
                  }
                }}
                disabled={printing}
                containerStyle={[
                  styles.actionButton,
                  { backgroundColor: colors.neutral50 },
                ]}
                txtBtnStyle={[
                  styles.actionButtonText,
                  { color: colors.neutral900, ...textPresets.fs12_400 },
                ]}
              />

              {isWaitingManual ? (
                <Button
                  title="Sửa Đơn Hàng"
                  containerStyle={[
                    styles.actionButton,
                    { backgroundColor: colors.neutral50 },
                  ]}
                  txtBtnStyle={[
                    styles.actionButtonText,
                    { color: colors.neutral900, ...textPresets.fs12_400 },
                  ]}
                  onPress={() =>
                    router.push({
                      pathname: "/order-detail" as never,
                      params: { id: order.id },
                    })
                  }
                />
              ) : (
                <Button
                  title={
                    depositStatus === "paid" || depositStatus === "deposited"
                      ? "Đã Cọc"
                      : "Chưa Cọc"
                  }
                  containerStyle={[
                    styles.actionButton,
                    { backgroundColor: colors.neutral50 },
                  ]}
                  txtBtnStyle={[
                    styles.actionButtonText,
                    { color: colors.neutral900, ...textPresets.fs12_400 },
                  ]}
                  onPress={() => {
                    void handleToggleDeposit();
                  }}
                  loading={depositLoading}
                  loadingType="center"
                  disabled={depositLoading}
                />
              )}
            </>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors }) => ({
  root: { flex: 1, backgroundColor: colors.neutral100 },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 290,
  },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, gap: 12 },
  sectionCard: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    gap: 8,
    shadowColor: "#110C22",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  // Stepper
  stepper: { flexDirection: "row", alignItems: "center" },
  stepWrapper: { flex: 1, flexDirection: "row", alignItems: "flex-start" },
  stepItem: { flex: 1, alignItems: "center", gap: 6 },
  stepIcon: { width: 36, height: 36 },
  stepLabel: { textAlign: "center", lineHeight: 16 },
  stepConnector: { width: 20, height: 2, marginTop: 17, flexShrink: 0 },
  // Order summary
  orderSummaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  orderCodeGroup: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
    flexWrap: "nowrap",
    gap: 4,
  },
  copyBtn: { paddingHorizontal: 2 },
  detailLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
    flexShrink: 0,
  },
  // Route
  routeRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  routeText: { flex: 1, textAlign: "center" },
  // Recipient
  recipientRow: { flexDirection: "row", alignItems: "center", gap: 12 },
  recipientAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#344054",
    alignItems: "center",
    justifyContent: "center",
  },
  recipientInfo: { flex: 1, gap: 2 },
  callBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  addressText: { lineHeight: 18 },
  // Journey
  journeyHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  copyInfoBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  journeyItem: { flexDirection: "row", alignItems: "flex-start", gap: 10 },
  journeyDotCol: { alignItems: "center", width: 16 },
  journeySquareDot: {
    width: 16,
    height: 16,
    borderRadius: 3,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  journeyDotInner: {
    width: 8,
    height: 8,
    borderRadius: 2,
    backgroundColor: "#787878",
  },
  journeyVertLine: { flex: 1, width: 1, minHeight: 16, marginTop: 2 },
  journeyContent: { flex: 1, gap: 4, paddingBottom: 8 },
  journeyContentRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  // Action bar
  actionBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  actionGrid: { flexDirection: "row", gap: 8 },
  actionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    gap: 4,
  },
  actionButtonText: { textAlign: "center", lineHeight: 18 },
}));
