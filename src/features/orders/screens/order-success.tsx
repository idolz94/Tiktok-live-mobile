import { useLocalSearchParams, router } from "expo-router";
import { useState, useCallback } from "react";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { createStyles } from "@utils/createStyles";
import { getShipmentLabelApi } from "../service/create-shipment-api";
import { formatLocaleInput } from "../utils/shipment";

type Params = {
  orderId: string;
  provider: string;
  serviceType?: string;
  collectType?: string;
  pickupTimeLabel?: string;
  codAmount?: string;
  shippingFee?: string;
  voucherAmount?: string;
};

const SERVICE_LABEL: Record<string, string> = {
  "1": "Giao hàng Tiêu Chuẩn",
  "2": "Giao hàng Nhanh",
};
const COLLECT_LABEL: Record<string, string> = {
  "1": "Lấy Hàng Tại Shop",
  "2": "Gửi tại bưu cục",
};

function fmtMoney(raw: string | undefined): string {
  if (!raw || raw === "0") return "0₫";
  return `${formatLocaleInput(raw)}₫`;
}

export default function OrderSuccessScreen() {
  const params = useLocalSearchParams<Params>();
  const isSpx = params.provider === "spx";
  const codAmount = params.codAmount ?? "0";
  const shippingFee = params.shippingFee ?? "0";
  const voucherAmount = params.voucherAmount ?? "0";
  const hasVoucher = Number(voucherAmount) > 0;
  const [printing, setPrinting] = useState(false);

  const handlePrintLabel = useCallback(async () => {
    if (!params.orderId || printing) return;
    setPrinting(true);
    try {
      const res = await getShipmentLabelApi(params.orderId);
      if (res.labelUrl) await Linking.openURL(res.labelUrl);
    } finally {
      setPrinting(false);
    }
  }, [params.orderId, printing]);

  const handleDone = useCallback(() => {
    router.replace("/(tabs)/shipping" as never);
  }, []);

  return (
    <SafeAreaView style={styles.safeArea} edges={["top", "left", "right", "bottom"]}>
      {/* background gradient */}
      <LinearGradient
        colors={["rgba(255,107,138,0.28)", "rgba(255,166,109,0.15)", "rgba(255,255,255,0)"]}
        style={styles.bgGradient}
        pointerEvents="none"
      />

      {/* header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
          <Text style={styles.backIcon}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Tạo đơn hàng thành công</Text>
        <View style={styles.backBtn} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* success banner */}
        <View style={styles.successBanner}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Tạo Đơn Hàng Thành Công!</Text>
          <Text style={styles.successSubtitle}>Mã vận đơn của bạn đã sẵn sàng xử lý</Text>
        </View>

        {/* fulfillment card — SPX only */}
        {isSpx && (
          <View style={styles.card}>
            <View style={styles.detailsList}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loại dịch vụ</Text>
                <Text style={styles.detailValue}>
                  {SERVICE_LABEL[params.serviceType ?? ""] ?? "—"}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Loại hình gửi hàng</Text>
                <Text style={styles.detailValue}>
                  {COLLECT_LABEL[params.collectType ?? ""] ?? "—"}
                </Text>
              </View>
              {!!params.pickupTimeLabel && (
                <>
                  <View style={styles.divider} />
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Thời gian lấy hàng</Text>
                    <Text style={styles.detailValue}>{params.pickupTimeLabel}</Text>
                  </View>
                </>
              )}
            </View>

            {/* guidelines */}
            <View style={styles.guidelinesBanner}>
              <View style={styles.guidelinesText}>
                <Text style={styles.guidelineStep}>Bước 1: In và dán AWB lên bưu gửi.</Text>
                <Text style={styles.guidelineStep}>Bước 2: Đợi tài xế đến lấy hàng.</Text>
              </View>
              <Pressable
                onPress={() => { void handlePrintLabel(); }}
                style={styles.printBtn}
                disabled={printing}
              >
                <Text style={styles.printIcon}>🖨</Text>
                <Text style={styles.printText}>In vận đơn</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* payment card */}
        <View style={styles.card}>
          <Text style={styles.paymentTitle}>Thông tin thanh toán</Text>
          <View style={styles.priceList}>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Tiền thu hộ (COD)</Text>
              <Text style={styles.detailValue}>{fmtMoney(codAmount)}</Text>
            </View>
            <View style={styles.detailRow}>
              <Text style={styles.detailLabel}>Phí vận chuyển</Text>
              <Text style={styles.detailValue}>{fmtMoney(shippingFee)}</Text>
            </View>
            {hasVoucher && (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Khuyến mãi</Text>
                <Text style={styles.discountValue}>-{fmtMoney(voucherAmount)}</Text>
              </View>
            )}
            <View style={styles.divider} />
            <View style={styles.detailRow}>
              <Text style={styles.totalLabel}>Thành tiền</Text>
              <Text style={styles.totalValue}>{fmtMoney(codAmount)}</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* bottom CTA */}
      <View style={styles.floatingBottom}>
        <Pressable onPress={handleDone} style={styles.ctaWrapper}>
          <LinearGradient
            colors={["#FF6B8A", "#FFA66D", "#FFC86A"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.ctaButton}
          >
            <Text style={styles.ctaText}>Hoàn tất &amp; Về trang chủ</Text>
          </LinearGradient>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  safeArea: { flex: 1, backgroundColor: colors.neutral100 },
  bgGradient: { position: "absolute", top: 0, left: 0, right: 0, height: 290 },
  header: {
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    justifyContent: "space-between",
  },
  backBtn: { width: 32, alignItems: "center" },
  backIcon: { color: colors.neutral900, fontSize: 34, lineHeight: 34, marginTop: -4 },
  headerTitle: { flex: 1, textAlign: "center", color: colors.neutral900, ...textPresets.fs16_500 },
  scrollContent: { paddingHorizontal: 16, paddingTop: 12, paddingBottom: 120, gap: 16 },
  successBanner: { alignItems: "center", paddingVertical: 16, gap: 12 },
  checkCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#2ca87b",
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: "#fff", fontSize: 20, lineHeight: 24 },
  successTitle: { color: "#2ca87b", ...textPresets.fs12_400, textAlign: "center" },
  successSubtitle: { color: colors.neutral400, ...textPresets.fs12_400, textAlign: "center" },
  card: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
    backgroundColor: colors.neutral50,
    padding: 16,
    gap: 16,
    shadowColor: "#110C22",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  detailsList: { gap: 12 },
  detailRow: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between" },
  detailLabel: { color: colors.neutral400, ...textPresets.fs12_400, flexShrink: 0, paddingTop: 1 },
  detailValue: { color: colors.neutral900, ...textPresets.fs12_400, flexShrink: 1, textAlign: "right", marginLeft: 8 },
  divider: { height: 0.5, backgroundColor: "rgba(0,0,0,0.1)" },
  guidelinesBanner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f0f5ff",
    borderWidth: 1,
    borderColor: "#d0e0ff",
    borderRadius: 12,
    padding: 12,
  },
  guidelinesText: { gap: 6, flex: 1, marginRight: 8 },
  guidelineStep: { color: "#3b5998", fontSize: 12, lineHeight: 16 },
  printBtn: { flexDirection: "row", alignItems: "center", gap: 4 },
  printIcon: { fontSize: 18 },
  printText: { color: "#3b5998", ...textPresets.fs12_400 },
  priceList: { gap: 12 },
  paymentTitle: { color: colors.neutral900, ...textPresets.fs12_400 },
  discountValue: { color: "#2ca87b", ...textPresets.fs12_400 },
  totalLabel: { color: colors.neutral900, ...textPresets.fs12_400 },
  totalValue: { color: "#FF6B8A", ...textPresets.fs12_400 },
  floatingBottom: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.neutral50,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(0,0,0,0.1)",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
  },
  ctaWrapper: { borderRadius: 40, overflow: "hidden" },
  ctaButton: {
    height: 52,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaText: { color: colors.neutral900, fontSize: 16, fontWeight: "600", lineHeight: 24 },
}));
