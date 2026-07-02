import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import type { CollectType, SpxTimeslot } from "../types/shipment";
import type { SpxVoucher } from "../service/create-shipment-api";
import { MoneyField } from "./money-field";
import { ShipmentInput } from "./shipment-input";
import { SummaryRow } from "./summary-row";
import { TimeslotSelect } from "./timeslot-select";
import { OptionChip } from "./option-chip";
import { shipmentStyles } from "./shipment-styles";

type SpxOptionsProps = {
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
  parcelItemName: string;
  setParcelItemName: (value: string) => void;
  declaredValue: number;
  setDeclaredValue: (value: number) => void;
  note: string;
  setNote: (value: string) => void;
};

function formatVoucherAmount(voucher: SpxVoucher) {
  const amount = Number(voucher.voucherAmount);
  if (!amount) return null;
  return voucher.discountBy === 2
    ? `${amount}%`
    : `${amount.toLocaleString("vi-VN")}đ`;
}

export function SpxOptions({
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
  selectedVoucherCode,
  onOpenVoucherSheet,
  parcelItemName,
  setParcelItemName,
  declaredValue,
  setDeclaredValue,
  note,
  setNote,
}: SpxOptionsProps) {
  const { colors, textPresets } = useThemes();

  return (
    <>
      <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>
        Hình thức lấy hàng
      </Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip
          label="Lấy tại nhà"
          selected={collectType === 1}
          onPress={() => setCollectType(1)}
        />
        <OptionChip
          label="Lấy tại bưu cục"
          selected={collectType === 2}
          onPress={() => setCollectType(2)}
        />
      </View>

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
                shipmentStyles.feeBox,
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
        Voucher SPX
      </Text>
      <Pressable
        onPress={onOpenVoucherSheet}
        disabled={vouchersLoading || !!vouchersError || vouchers.length === 0}
        style={[
          shipmentStyles.voucherCard,
          { backgroundColor: colors.neutral50, borderColor: colors.border10 },
        ]}
      >
        {vouchersLoading ? (
          <ActivityIndicator size="small" color={colors.primary} />
        ) : vouchersError ? (
          <Text
            style={[{ color: colors.error, flex: 1 }, textPresets.fs12_400]}
          >
            {vouchersError}
          </Text>
        ) : vouchers.length === 0 ? (
          <Text
            style={[
              { color: colors.neutral400, flex: 1 },
              textPresets.fs14_400,
            ]}
          >
            Không có voucher khả dụng
          </Text>
        ) : (
          <>
            <View style={shipmentStyles.voucherCardInfo}>
              {(() => {
                const selectedVoucher = vouchers.find(
                  (voucher) => voucher.voucherCode === selectedVoucherCode,
                );
                const amount = selectedVoucher
                  ? formatVoucherAmount(selectedVoucher)
                  : null;

                return selectedVoucher ? (
                  <>
                    <Text
                      style={[
                        { color: colors.neutral900 },
                        textPresets.fs14_500,
                      ]}
                      numberOfLines={1}
                    >
                      {selectedVoucher.voucherName ||
                        selectedVoucher.voucherCode}
                    </Text>
                    <Text
                      style={[
                        { color: colors.neutral500 },
                        textPresets.fs12_400,
                      ]}
                      numberOfLines={1}
                    >
                      {amount
                        ? `Đang chọn · Giảm ${amount}`
                        : "Đang chọn voucher"}
                    </Text>
                  </>
                ) : (
                  <>
                    <Text
                      style={[
                        { color: colors.neutral900 },
                        textPresets.fs14_500,
                      ]}
                    >
                      Chọn voucher
                    </Text>
                    <Text
                      style={[
                        { color: colors.neutral500 },
                        textPresets.fs12_400,
                      ]}
                    >
                      {vouchers.length} voucher khả dụng
                    </Text>
                  </>
                );
              })()}
            </View>
            <Text style={[{ color: colors.neutral400 }, textPresets.fs18_500]}>
              ›
            </Text>
          </>
        )}
      </Pressable>

      <ShipmentInput
        label="Tên hàng hóa"
        value={parcelItemName}
        onChangeText={setParcelItemName}
        placeholder="VD: Áo thun, Giày, ..."
        topSpacing
      />
      <ShipmentInput
        label="Giá trị bưu gửi"
        required
        value={declaredValue > 0 ? declaredValue.toLocaleString("vi-VN") : ""}
        onChangeText={(text) =>
          setDeclaredValue(parseInt(text.replace(/\D/g, ""), 10) || 0)
        }
        placeholder="0"
        keyboardType="numeric"
        topSpacing
        money
      />
      <ShipmentInput
        label="Ghi chú"
        value={note}
        onChangeText={setNote}
        placeholder="Nhập ghi chú"
        multiline
        topSpacing
      />
    </>
  );
}

