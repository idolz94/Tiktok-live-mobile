import {
  ActivityIndicator,
  LayoutAnimation,
  Platform,
  Pressable,
  Text,
  UIManager,
  View,
} from "react-native";

if (Platform.OS === "android") {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}
import { useState, type ReactNode } from "react";
import { useThemes } from "@hooks/use-theme";
import { Popover } from "@components/popover";
import type {
  CollectType,
  PaymentSide,
  ServiceType,
  SpxTimeslot,
} from "../../types/shipment";
import type { SpxVoucher } from "../../service/create-shipment-api";
import { TimeslotSelect } from "./timeslot-select";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";

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
  paymentSide: PaymentSide;
  setPaymentSide: (value: PaymentSide) => void;
  onOpenServicePoint: () => void;
  parcelInfoSlot?: ReactNode;
  estimatedDelivery?: { edtMin: number | null; edtMax: number | null } | null;
  feeLoading?: boolean;
};

const SERVICE_TYPES = [
  { label: "Giao hàng Tiêu Chuẩn", value: 1 as ServiceType },
  { label: "Giao hàng Hỏa Tốc", value: 2 as ServiceType },
];

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
  vouchersError,
  selectedVoucherCode: _selectedVoucherCode,
  onOpenVoucherSheet,
  paymentSide,
  setPaymentSide,
  onOpenServicePoint,
  parcelInfoSlot,
  estimatedDelivery,
  feeLoading,
}: SpxOptionsProps) {
  const { colors, textPresets } = useThemes();
  const [paymentPopoverVisible, setPaymentPopoverVisible] = useState(false);
  const [paymentRowWidth, setPaymentRowWidth] = useState(0);

  return (
    <>
      <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>
        Thông tin cơ bản
      </Text>
      <View style={styles.collectTypeTabs}>
        {[
          { label: "Lấy Hàng Tại Shop", value: 1 as CollectType },
          { label: "Gửi Tại Điểm Dịch Vụ", value: 2 as CollectType },
        ].map((tab) => {
          const active = collectType === tab.value;
          return (
            <Pressable
              key={tab.value}
              onPress={() => {
                LayoutAnimation.configureNext(
                  LayoutAnimation.Presets.easeInEaseOut,
                );
                setCollectType(tab.value);
              }}
              style={[
                styles.collectTypeTab,
                active
                  ? {
                      backgroundColor: colors.primary,
                      borderColor: colors.primary,
                    }
                  : {
                      backgroundColor: colors.surface,
                      borderColor: colors.border10,
                    },
              ]}
            >
              <Text
                adjustsFontSizeToFit
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
          style={[
            styles.voucherRow,
            { backgroundColor: colors.neutral50, borderColor: colors.border10 },
          ]}
        >
          <Text
            style={[
              { color: colors.neutral900, flex: 1 },
              textPresets.fs14_500,
            ]}
          >
            Tìm Điểm dịch vụ
          </Text>
          <Text style={[{ color: colors.neutral400 }, textPresets.fs18_500]}>
            ›
          </Text>
        </Pressable>
      )}

      {parcelInfoSlot}

      {parcelInfoSlot && (
        <Popover
          visible={paymentPopoverVisible}
          onVisibleChange={setPaymentPopoverVisible}
          placement="bottom"
          showBackdrop={false}
          showArrow={false}
          closeOnOutsidePress={true}
          contentStyle={{ width: paymentRowWidth }}
          trigger={
            <Pressable
              onPress={() => setPaymentPopoverVisible(true)}
              onLayout={(e) => setPaymentRowWidth(e.nativeEvent.layout.width)}
              style={[
                styles.voucherRow,
                {
                  backgroundColor: colors.neutral50,
                  borderColor: colors.border10,
                },
              ]}
            >
              <Text
                style={[{ color: colors.neutral900 }, textPresets.fs14_500]}
              >
                Người thanh toán <Text style={{ color: colors.error }}>*</Text>
              </Text>
              <View
                style={{
                  flex: 1,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "flex-end",
                  columnGap: 4,
                }}
              >
                <Text
                  adjustsFontSizeToFit
                  style={[{ color: colors.neutral500 }, textPresets.fs12_400]}
                >
                  {paymentSide === 1
                    ? "Người gửi thanh toán phí"
                    : "Người nhận thanh toán phí"}
                </Text>
                <Icon
                  name="arrow_down"
                  size={14}
                  tintColor={colors.neutral400}
                />
              </View>
            </Pressable>
          }
        >
          <View>
            {[
              { label: "Người gửi thanh toán phí", value: 1 as PaymentSide },
              { label: "Người nhận thanh toán phí", value: 0 as PaymentSide },
            ].map((opt) => (
              <Pressable
                key={opt.value}
                onPress={() => {
                  setPaymentSide(opt.value);
                  setPaymentPopoverVisible(false);
                }}
                style={[
                  styles.popoverItem,
                  paymentSide === opt.value && {
                    backgroundColor: colors.primaryLight,
                  },
                ]}
              >
                <Text
                  style={[
                    paymentSide === opt.value
                      ? { color: colors.primary }
                      : { color: colors.neutral900 },
                    textPresets.fs14_400,
                  ]}
                >
                  {opt.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </Popover>
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
                {
                  backgroundColor: colors.neutral50,
                  borderColor: colors.border10,
                },
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

      <Text
        style={[
          { color: colors.neutral400 },
          textPresets.fs12_400,
          { marginTop: 10 },
        ]}
      >
        Loại dịch vụ
      </Text>
      <View style={styles.serviceTypeRow}>
        {SERVICE_TYPES.map((svc) => {
          const active = serviceType === svc.value;
          const deliveryText =
            active && feeLoading && !estimatedDelivery
              ? "..."
              : active &&
                  estimatedDelivery &&
                  (estimatedDelivery.edtMin != null ||
                    estimatedDelivery.edtMax != null)
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
                active
                  ? { borderColor: colors.primary }
                  : { borderColor: colors.border10 },
              ]}
            >
              {/* Header */}
              <View
                style={[
                  styles.serviceTypeHeader,
                  {
                    backgroundColor: active
                      ? colors.primary
                      : colors.neutral300,
                  },
                ]}
              >
                <Text
                  adjustsFontSizeToFit
                  style={[textPresets.fs14_500, { color: "#fff" }]}
                  numberOfLines={1}
                >
                  {svc.label}
                </Text>
              </View>

              {/* Body */}
              <View
                style={[
                  styles.serviceTypeBody,
                  { backgroundColor: colors.surface },
                ]}
              >
                <Text
                  style={[textPresets.fs12_400, { color: colors.neutral500 }]}
                >
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
      {(() => {
        const voucherEmpty =
          !vouchersLoading && !vouchersError && vouchers.length === 0;
        const voucherDisabled =
          vouchersLoading || !!vouchersError || voucherEmpty;
        return (
          <Pressable
            onPress={onOpenVoucherSheet}
            disabled={voucherDisabled}
            style={[
              styles.voucherRow,
              {
                backgroundColor: colors.neutral50,
                borderColor: colors.border10,
              },
              (!!vouchersError || voucherEmpty) && { opacity: 0.5 },
            ]}
          >
            <Text
              style={[
                { color: colors.neutral900, flex: 1 },
                textPresets.fs14_500,
              ]}
            >
              {voucherEmpty ? "Không có mã giảm phí vận chuyển" : "Mã giảm phí vận chuyển"}
            </Text>
            {!voucherDisabled && (
              <Text
                style={[{ color: colors.neutral400 }, textPresets.fs18_500]}
              >
                ›
              </Text>
            )}
          </Pressable>
        );
      })()}
    </>
  );
}

const styles = createStyles(() => ({
  serviceTypeRow: {
    flexDirection: "row",
    gap: 8,
  },
  serviceTypeCard: {
    flex: 1,
    borderWidth: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  serviceTypeHeader: {
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  serviceTypeBody: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    gap: 4,
    alignItems: "center",
  },
  collectTypeTabs: {
    flexDirection: "row",
    gap: 8,
  },
  collectTypeTab: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    padding: 12,
    borderWidth: 1,
    borderRadius: 10,
  },
  feeBox: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginTop: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  voucherRow: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  popoverItem: {
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 8,
  },
}));
