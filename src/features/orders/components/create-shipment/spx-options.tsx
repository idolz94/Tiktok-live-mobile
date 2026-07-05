import { ActivityIndicator, LayoutAnimation, Platform, Pressable, Text, UIManager, View } from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import type { ReactNode } from "react";
import { useThemes } from "@hooks/use-theme";
import type { CollectType, PaymentSide, ServiceType, SpxTimeslot } from "../../types/shipment";
import type { SpxVoucher } from "../../service/create-shipment-api";
import { TimeslotSelect } from "./timeslot-select";
import { createStyles } from "@utils/createStyles";

type SpxOptionsProps = {
  serviceType: ServiceType;
  setServiceType: (value: ServiceType) => void;
  collectType: CollectType;
  setCollectType: (value: CollectType) => void;
  pickupTimeRangeId: number | null;
  pickupTimeKey: string | null;
  setPickupTime: (id: number, key: string, pickupTime: number) => void;
  timeslots: SpxTimeslot[];
  timeslotsLoading: boolean;
  timeslotsError?: string | null;
  vouchers: SpxVoucher[];
  vouchersLoading: boolean;
  vouchersError?: string | null;
  selectedVoucherCode: string | null;
  onOpenVoucherSheet: () => void;
  paymentSide: number;
  onOpenPaymentSheet: () => void;
  onOpenServicePoint: () => void;
  parcelInfoSlot?: ReactNode;
  estimatedDelivery?: { edtMin: number | null; edtMax: number | null } | null;
  feeLoading?: boolean;
};

function formatVoucherAmount(voucher: SpxVoucher) {
  const amount = Number(voucher.voucherAmount);
  if (!amount) return null;
  return voucher.discountBy === 2
    ? `${amount}%`
    : `${amount.toLocaleString("vi-VN")}đ`;
}

const SERVICE_TYPES = [
  { label: "Giao hàng Tiêu Chuẩn", value: 1 as ServiceType },
  { label: "Giao hàng Hỏa Tốc", value: 2 as ServiceType },
] as const;

export function SpxOptions({
  serviceType,
  setServiceType,
  collectType,
  setCollectType,
  pickupTimeKey,
  setPickupTime,
  timeslots,
  timeslotsLoading,
  timeslotsError,
  vouchers,
  vouchersLoading,
  vouchersError: _vouchersError,
  selectedVoucherCode: _selectedVoucherCode,
  onOpenVoucherSheet,
  paymentSide,
  onOpenPaymentSheet,
  onOpenServicePoint,
  parcelInfoSlot,
  estimatedDelivery,
  feeLoading,
}: SpxOptionsProps) {
  const { colors, textPresets } = useThemes();

  return (
    <>
      <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>
        Thông tin cơ bản
      </Text>
      <View style={styles.collectTypeTabs}>
        {([
          { label: "Lấy Hàng Tại Shop", value: 1 as CollectType },
          { label: "Gửi Tại Điểm Dịch Vụ", value: 2 as CollectType },
        ]).map((tab) => {
          const active = collectType === tab.value;
          return (
            <Pressable
              key={tab.value}
              onPress={() => {
                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                setCollectType(tab.value);
              }}
              style={[
                styles.collectTypeTab,
                active
                  ? { backgroundColor: colors.primary, borderColor: colors.primary }
                  : { backgroundColor: colors.surface, borderColor: colors.border10 },
              ]}
            >
              {active && (
                <Text style={styles.tabCheck}>✓</Text>
              )}
              <Text
                style={[
                  active ? { color: "#fff" } : { color: colors.neutral500 },
                  textPresets.fs14_500 ?? textPresets.fs14_400,
                ]}
                numberOfLines={1}
              >
                {tab.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {collectType === 2 && (
        <Pressable
          onPress={onOpenServicePoint}
          style={[styles.voucherRow, { backgroundColor: colors.neutral50, borderColor: colors.border10 }]}
        >
          <Text style={[{ color: colors.neutral900, flex: 1 }, textPresets.fs14_500]}>
            Tìm Điểm dịch vụ
          </Text>
          <Text style={[{ color: colors.neutral400 }, textPresets.fs18_500]}>›</Text>
        </Pressable>
      )}

      {parcelInfoSlot}

      {parcelInfoSlot && (
        <Pressable
          onPress={onOpenPaymentSheet}
          style={[styles.voucherRow, { backgroundColor: colors.neutral50, borderColor: colors.border10 }]}
        >
          <Text style={[{ color: colors.neutral900 }, textPresets.fs14_500]}>
            Người thanh toán{" "}
            <Text style={{ color: colors.error }}>*</Text>
          </Text>
          <View style={{ flex: 1 }} />
          <Text style={[{ color: colors.neutral500 }, textPresets.fs12_400]}>
            {paymentSide === 1 ? "Người gửi thanh toán phí" : "Người nhận thanh toán phí"}
          </Text>
          <Text style={[{ color: colors.neutral400 }, textPresets.fs14_500]}>⌄</Text>
        </Pressable>
      )}

      {collectType === 1 && (
        <>
          <Text
            style={[
              { color: colors.neutral400 },
              textPresets.fs12_400,
              { marginTop: 10 },
            ]}
          >
            Khung giờ lấy hàng
          </Text>
          {timeslotsLoading ? (
            <View
              style={[
                styles.feeBox,
                { backgroundColor: colors.neutral50, borderColor: colors.border10 },
              ]}
            >
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : timeslotsError ? (
            <Text style={[{ color: colors.error }, textPresets.fs12_400]}>
              {timeslotsError}
            </Text>
          ) : timeslots.length > 0 ? (
            <TimeslotSelect
              timeslots={timeslots}
              selectedKey={pickupTimeKey}
              onSelect={setPickupTime}
            />
          ) : (
            <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>
              Không có khung giờ nào
            </Text>
          )}
        </>
      )}

      <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400, { marginTop: 10 }]}>
        Loại dịch vụ
      </Text>
      <View style={styles.serviceTypeRow}>
        {SERVICE_TYPES.map((svc) => {
          const active = serviceType === svc.value;
          const deliveryText =
            active && feeLoading && !estimatedDelivery
              ? "..."
              : active && estimatedDelivery && (estimatedDelivery.edtMin != null || estimatedDelivery.edtMax != null)
              ? estimatedDelivery.edtMin === estimatedDelivery.edtMax
                ? `${estimatedDelivery.edtMin} ngày`
                : `${estimatedDelivery.edtMin ?? "?"}–${estimatedDelivery.edtMax ?? "?"} ngày`
              : "-";
          return (
            <Pressable
              key={svc.value}
              onPress={() => setServiceType(svc.value)}
              style={[
                styles.serviceTypeCard,
                active ? { borderColor: colors.primary } : { borderColor: colors.border10 },
              ]}
            >
              {/* Header */}
              <View
                style={[
                  styles.serviceTypeHeader,
                  { backgroundColor: active ? colors.primary : colors.neutral300 },
                ]}
              >
                <Text
                  style={[textPresets.fs14_500, { color: "#fff" }]}
                  numberOfLines={1}
                >
                  {svc.label}
                </Text>
              </View>

              {/* Body */}
              <View style={[styles.serviceTypeBody, { backgroundColor: colors.surface }]}>
                <Text style={[textPresets.fs12_400, { color: colors.neutral500 }]}>
                  Dự kiến giao hàng
                </Text>
                <Text
                  style={[
                    textPresets.fs12_400,
                    { color: active ? colors.primary : colors.neutral400 },
                  ]}
                >
                  {deliveryText}
                </Text>
              </View>
            </Pressable>
          );
        })}
      </View>

      <Text
        style={[
          { color: colors.neutral400 },
          textPresets.fs12_400,
          { marginTop: 10 },
        ]}
      >
        Mã giảm phí vận chuyển
      </Text>
      <Pressable
        onPress={onOpenVoucherSheet}
        disabled={vouchersLoading}
        style={[
          styles.voucherRow,
          { backgroundColor: colors.neutral50, borderColor: colors.border10 },
        ]}
      >
        <Text style={[{ color: colors.neutral900, flex: 1 }, textPresets.fs14_500]}>
          Mã giảm phí vận chuyển
        </Text>
        <Text style={[{ color: colors.neutral400 }, textPresets.fs18_500]}>›</Text>
      </Pressable>
    </>
  );
}

const styles = createStyles(() => ({
  serviceTypeRow: {
    flexDirection: "row" as const,
    gap: 8,
  },
  serviceTypeCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden" as const,
  },
  serviceTypeHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  serviceTypeBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    alignItems: "center" as const,
  },
  collectTypeTabs: {
    flexDirection: "row" as const,
    gap: 8,
  },
  collectTypeTab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 6,
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  tabCheck: { color: "#fff", fontSize: 14, lineHeight: 18 },
  feeBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 8,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  voucherRow: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    minHeight: 44,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
  },
}));
