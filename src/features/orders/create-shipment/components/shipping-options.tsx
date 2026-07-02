import { Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import type { DeliveryPolicy, PickupOption, RefusalFee, ViewCondition } from "../types/shipment";
import { OptionChip } from "./option-chip";
import { shipmentStyles } from "./shipment-styles";

type ShippingOptionsProps = {
  viewCondition: ViewCondition;
  setViewCondition: (value: ViewCondition) => void;
  deliveryPolicy: DeliveryPolicy;
  setDeliveryPolicy: (value: DeliveryPolicy) => void;
  refusalFee: RefusalFee;
  setRefusalFee: (value: RefusalFee) => void;
  pickupOption: PickupOption;
  setPickupOption: (value: PickupOption) => void;
};

export function ShippingOptions({
  viewCondition,
  setViewCondition,
  deliveryPolicy,
  setDeliveryPolicy,
  refusalFee,
  setRefusalFee,
  pickupOption,
  setPickupOption,
}: ShippingOptionsProps) {
  const { colors, textPresets } = useThemes();
  return (
    <>
      <Text
        style={[
          { color: colors.neutral400 },
          textPresets.fs12_400,
          { marginTop: 10 },
        ]}
      >
        Điều kiện xem hàng
      </Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip
          label="Không cho xem hàng"
          selected={viewCondition === "no_open"}
          onPress={() => setViewCondition("no_open")}
        />
        <OptionChip
          label="Cho xem hàng không thử"
          selected={viewCondition === "viewable"}
          onPress={() => setViewCondition("viewable")}
        />
        <OptionChip
          label="Cho thử hàng"
          selected={viewCondition === "fragile"}
          onPress={() => setViewCondition("fragile")}
        />
      </View>
      <Text
        style={[
          { color: colors.neutral400 },
          textPresets.fs12_400,
          { marginTop: 6 },
        ]}
      >
        Chính sách giao hàng
      </Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip
          label="Giao toàn bộ đơn hàng"
          selected={deliveryPolicy === "full"}
          onPress={() => setDeliveryPolicy("full")}
        />
        <OptionChip
          label="Giao hàng một phần"
          selected={deliveryPolicy === "partial"}
          onPress={() => setDeliveryPolicy("partial")}
        />
      </View>
      <Text
        style={[
          { color: colors.neutral400 },
          textPresets.fs12_400,
          { marginTop: 6 },
        ]}
      >
        Phí hoàn trả
      </Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip
          label="Miễn phí"
          selected={refusalFee === "free"}
          onPress={() => setRefusalFee("free")}
        />
        <OptionChip
          label="Thu phí"
          selected={refusalFee === "charge"}
          onPress={() => setRefusalFee("charge")}
        />
      </View>
      <Text
        style={[
          { color: colors.neutral400 },
          textPresets.fs12_400,
          { marginTop: 6 },
        ]}
      >
        Hình thức lấy hàng
      </Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip
          label="Tại cửa hàng"
          selected={pickupOption === "cod"}
          onPress={() => setPickupOption("cod")}
        />
        <OptionChip
          label="Gửi tại điểm dịch vụ"
          selected={pickupOption === "post"}
          onPress={() => setPickupOption("post")}
        />
      </View>
    </>
  );
}

