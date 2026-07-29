import { LinearGradient } from "@components/linear-gradient";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { router, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { usePrinterStore } from "@features/settings/stores/printer-store";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useManualLabelPrint } from "../hooks/use-manual-label-print";
import type { ShippingOrder } from "../hooks/use-shipping-tab";
import {
  formatMoneyFull,
  getOrderTotal,
  getProductTotal,
} from "../utils/order";

export default function ManualLabelScreen() {
  const { order: orderParam } = useLocalSearchParams<{ order: string }>();
  const { colors, textPresets } = useThemes();
  const { config } = usePrinterStore();
  const { top, bottom } = useSafeAreaInsets();

  const order = orderParam
    ? (() => {
        try {
          return JSON.parse(orderParam) as ShippingOrder;
        } catch {
          return null;
        }
      })()
    : null;

  const { printing, isPrinterConfigured, handlePrint } =
    useManualLabelPrint(order);

  if (!order) {
    return (
      <View style={styles.root}>
        <LinearGradient type="gra_background" style={styles.bg} />
        <View style={[styles.header, { paddingTop: top + 12 }]}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backBtn}
            hitSlop={8}
          >
            <Ionicons name="chevron-back" size={24} color={colors.neutral900} />
          </Pressable>
          <Text
            style={[
              styles.headerTitle,
              { color: colors.neutral900, ...textPresets.fs20_600 },
            ]}
          >
            In Vận Đơn
          </Text>
        </View>
        <View style={styles.center}>
          <Text style={{ color: colors.neutral500, ...textPresets.fs14_400 }}>
            Không tìm thấy đơn hàng.
          </Text>
        </View>
      </View>
    );
  }

  const recipientAddress = (() => {
    const d = order.customerAddressData;
    if (!d) return order.customerAddress || "";
    return [d.address, d.ward, d.district, d.province]
      .filter(Boolean)
      .join(", ");
  })();

  const subtotal = getOrderTotal(order.products ?? []);
  const shippingFee = order.shippingFee ?? 0;
  const cod =
    order.codAmount != null && order.codAmount > 0 ? order.codAmount : subtotal;
  const displayCode =
    order.trackingCode || order.orderCode || order.id.slice(0, 8);

  return (
    <View style={styles.root}>
      <LinearGradient type="gra_background" style={styles.bg} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Pressable
          onPress={() => router.back()}
          style={styles.backBtn}
          hitSlop={8}
        >
          <Ionicons name="chevron-back" size={24} color={colors.neutral900} />
        </Pressable>
        <Text
          style={[
            styles.headerTitle,
            { color: colors.neutral900, ...textPresets.fs20_600 },
          ]}
        >
          In Vận Đơn
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={[styles.scroll, { paddingBottom: 88 + bottom }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Printer status banner */}
        {!isPrinterConfigured && (
          <View
            style={[
              styles.warningBanner,
              {
                backgroundColor: colors.neutral50,
                borderColor: colors.border10,
              },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={16}
              color={colors.neutral400}
            />
            <Text
              style={{
                flex: 1,
                color: colors.neutral500,
                ...textPresets.fs12_400,
              }}
            >
              Chưa cấu hình máy in nhiệt. Vào Cài đặt → Máy in để cấu hình.
            </Text>
          </View>
        )}

        {/* Label preview card */}
        <View style={[styles.card, { borderColor: colors.border10 }]}>
          {/* Shop header */}
          <View style={styles.shopHeader}>
            <Text
              style={[
                {
                  color: colors.neutral900,
                  ...textPresets.fs16_600,
                  textAlign: "center",
                },
              ]}
            >
              {config.companyName || "CỬA HÀNG"}
            </Text>
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.border10 }]}
          />

          {/* Order code */}
          <View style={styles.row}>
            <Text style={{ color: colors.neutral500, ...textPresets.fs12_400 }}>
              Mã đơn
            </Text>
            <Text style={{ color: colors.neutral900, ...textPresets.fs14_500 }}>
              {displayCode}
            </Text>
          </View>

          <View
            style={[styles.divider, { backgroundColor: colors.border10 }]}
          />

          {/* Recipient */}
          <View style={styles.section}>
            <Text
              style={[
                styles.sectionLabel,
                { color: colors.neutral400, ...textPresets.fs11_400 },
              ]}
            >
              NGƯỜI NHẬN
            </Text>
            <Text style={{ color: colors.neutral900, ...textPresets.fs14_500 }}>
              {order.customerName || "Khách hàng"}
            </Text>
            {order.customerPhone ? (
              <Text
                style={{ color: colors.neutral500, ...textPresets.fs12_400 }}
              >
                {order.customerPhone}
              </Text>
            ) : null}
            {recipientAddress ? (
              <Text
                style={{
                  color: colors.neutral500,
                  ...textPresets.fs12_400,
                  lineHeight: 18,
                }}
              >
                {recipientAddress}
              </Text>
            ) : null}
          </View>

          {(order.products ?? []).length > 0 && (
            <>
              <View
                style={[styles.divider, { backgroundColor: colors.border10 }]}
              />
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: colors.neutral400, ...textPresets.fs11_400 },
                  ]}
                >
                  SẢN PHẨM
                </Text>
                {(order.products ?? []).map((p, i) => (
                  <View key={p.id ?? i} style={styles.productRow}>
                    <Text
                      style={{
                        flex: 1,
                        color: colors.neutral900,
                        ...textPresets.fs12_400,
                      }}
                      numberOfLines={2}
                    >
                      {p.name || p.code || "Sản phẩm"}
                      {p.variantName ? ` (${p.variantName})` : ""}
                    </Text>
                    <Text
                      style={{
                        color: colors.neutral400,
                        ...textPresets.fs12_400,
                        marginHorizontal: 8,
                      }}
                    >
                      x{p.quantity}
                    </Text>
                    <Text
                      style={{
                        color: colors.neutral900,
                        ...textPresets.fs12_500,
                      }}
                    >
                      {formatMoneyFull(getProductTotal(p))}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          )}

          <View
            style={[styles.divider, { backgroundColor: colors.border10 }]}
          />

          {/* Totals */}
          <View style={styles.section}>
            {shippingFee > 0 && (
              <View style={styles.inlineRow}>
                <Text
                  style={{ color: colors.neutral500, ...textPresets.fs12_400 }}
                >
                  Phí vận chuyển
                </Text>
                <Text
                  style={{ color: colors.neutral900, ...textPresets.fs12_400 }}
                >
                  {formatMoneyFull(shippingFee)}
                </Text>
              </View>
            )}
            <View style={styles.inlineRow}>
              <Text
                style={{ color: colors.neutral900, ...textPresets.fs14_500 }}
              >
                Tiền thu hộ (COD)
              </Text>
              <Text style={{ color: colors.primary, ...textPresets.fs14_500 }}>
                {formatMoneyFull(cod)}
              </Text>
            </View>
          </View>

          {order.note ? (
            <>
              <View
                style={[styles.divider, { backgroundColor: colors.border10 }]}
              />
              <View style={styles.section}>
                <Text
                  style={[
                    styles.sectionLabel,
                    { color: colors.neutral400, ...textPresets.fs11_400 },
                  ]}
                >
                  GHI CHÚ
                </Text>
                <Text
                  style={{
                    color: colors.neutral500,
                    ...textPresets.fs12_400,
                    lineHeight: 18,
                  }}
                >
                  {order.note}
                </Text>
              </View>
            </>
          ) : null}
        </View>
      </ScrollView>

      {/* Print footer */}
      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.border10,
            backgroundColor: colors.white,
            paddingBottom: Math.max(bottom, 16),
          },
        ]}
      >
        <Pressable
          style={[
            styles.printBtn,
            { backgroundColor: colors.neutral50, opacity: printing ? 0.7 : 1 },
          ]}
          onPress={() => {
            void handlePrint();
          }}
          disabled={printing}
        >
          {printing ? (
            <ActivityIndicator color={colors.neutral900} size="small" />
          ) : (
            <>
              <Ionicons
                name="print-outline"
                size={18}
                color={
                  isPrinterConfigured ? colors.neutral900 : colors.neutral400
                }
              />
              <Text
                style={{
                  color: isPrinterConfigured
                    ? colors.neutral900
                    : colors.neutral400,
                  ...textPresets.fs16_600,
                }}
              >
                In Vận Đơn
              </Text>
            </>
          )}
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors, shadows }) => ({
  root: { flex: 1, backgroundColor: colors.neutral100 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  header: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    backgroundColor: colors.white,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: { flex: 1, marginLeft: 4 },
  scroll: { paddingHorizontal: 16, paddingTop: 8, gap: 12 },
  warningBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 0.5,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    borderWidth: 0.5,
    overflow: "hidden",
    ...shadows.sd2,
  },
  shopHeader: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    gap: 4,
  },
  divider: { height: 0.5 },
  section: { paddingHorizontal: 16, paddingVertical: 12, gap: 4 },
  sectionLabel: { marginBottom: 4, letterSpacing: 0.4 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inlineRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  productRow: { flexDirection: "row", alignItems: "center" },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: 0.5,
    paddingTop: 12,
    paddingHorizontal: 16,
  },
  printBtn: {
    borderRadius: 12,
    height: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
}));
