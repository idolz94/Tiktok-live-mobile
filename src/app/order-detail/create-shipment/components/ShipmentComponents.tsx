import { ActivityIndicator, FlatList, Modal, Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { ShopAddress, CustomerAddress } from "../create-shipment-api";
import { DeliveryPolicy, PickupOption, RefusalFee, ViewCondition, ServiceType, CollectType, SpxTimeslot } from "../types";
import { addressLine } from "../utils";

export type SectionBlockProps = {
  title: string;
  actionLabel?: string;
  onActionPress?: () => void;
  children: React.ReactNode;
};

export function SectionBlock({ title, actionLabel, onActionPress, children }: SectionBlockProps) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={shipmentStyles.sectionBlock}>
      <View style={shipmentStyles.sectionHeader}>
        <Text style={[{ color: colors.neutral900 }, textPresets.fs18_700]}>{title}</Text>
        {!!actionLabel && !!onActionPress && (
          <Pressable onPress={onActionPress} hitSlop={8}>
            <Text style={[{ color: colors.primary }, textPresets.fs14_500]}>{actionLabel}</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

type FigmaAddressCardProps = {
  address: ShopAddress | CustomerAddress | null;
  loading?: boolean;
  onChangePress: () => void;
  onAddPress: () => void;
};

export function FigmaAddressCard({ address, loading, onChangePress, onAddPress }: FigmaAddressCardProps) {
  const { colors, textPresets } = useThemes();
  if (loading) {
    return (
      <View style={[shipmentStyles.addressCard, { borderColor: colors.border10, backgroundColor: colors.surface }]}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  }

  if (!address) {
    return (
      <Pressable onPress={onAddPress} style={[shipmentStyles.addAddressCard, { borderColor: colors.border20 }]}>
        <View style={[shipmentStyles.addCircle, { borderColor: colors.primary }]}>
          <Text style={[{ color: colors.primary }, textPresets.fs18_700]}>+</Text>
        </View>
        <Text style={[{ color: colors.primary }, textPresets.fs16_500]}>Thêm mới</Text>
      </Pressable>
    );
  }

  const initial = (address.name?.trim()?.charAt(0) || "L").toUpperCase();
  return (
    <View style={[shipmentStyles.addressCard, { borderColor: colors.border10, backgroundColor: colors.surface }]}>
      <View style={shipmentStyles.addressTopRow}>
        <View style={[shipmentStyles.avatar, { backgroundColor: colors.primaryLight }]}>
          <Text style={[{ color: colors.primary }, textPresets.fs16_500]}>{initial}</Text>
        </View>
        <View style={shipmentStyles.addressInfo}>
          <View style={shipmentStyles.addressNameRow}>
            <Text style={[shipmentStyles.addressName, { color: colors.neutral900 }, textPresets.fs16_500]} numberOfLines={1}>
              {address.name ?? "—"}
            </Text>
            {address.isDefault && (
              <View style={[shipmentStyles.defaultBadge, { backgroundColor: colors.primaryLight }]}>
                <Text style={[{ color: colors.primary }, textPresets.fs11_400]}>Mặc định</Text>
              </View>
            )}
          </View>
          <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>{address.phone ?? "—"}</Text>
        </View>
        <Pressable onPress={onChangePress} hitSlop={8} style={[shipmentStyles.changePill, { borderColor: colors.border10 }]}>
          <Text style={[{ color: colors.primary }, textPresets.fs12_500]}>Thay đổi</Text>
        </Pressable>
      </View>
      <Text style={[shipmentStyles.addressLine, { color: colors.neutral400 }, textPresets.fs14_400]} numberOfLines={2}>
        {addressLine(address)}
      </Text>
    </View>
  );
}

type OptionChipProps = {
  label: string;
  selected: boolean;
  onPress: () => void;
};

export function OptionChip({ label, selected, onPress }: OptionChipProps) {
  const { colors, textPresets } = useThemes();
  return (
    <Pressable
      onPress={onPress}
      style={[
        shipmentStyles.optionChip,
        {
          borderColor: selected ? colors.primary : colors.border10,
          backgroundColor: selected ? colors.primaryLight : colors.surface,
        },
      ]}
    >
      <View style={[shipmentStyles.optionDot, { borderColor: selected ? colors.primary : colors.border20 }]}>
        {selected && <View style={[shipmentStyles.optionDotInner, { backgroundColor: colors.primary }]} />}
      </View>
      <Text style={[{ color: colors.neutral900 }, textPresets.fs14_400]}>{label}</Text>
    </Pressable>
  );
}

type TimeslotSelectProps = {
  timeslots: SpxTimeslot[];
  selectedKey: string | null;
  onSelect: (id: number, key: string, pickupTime: number) => void;
};

type FlatSlot = { key: string; id: number; label: string; pickupTime: number };

function flattenTimeslots(ts: SpxTimeslot[]): FlatSlot[] {
  return ts.flatMap((g) =>
    (g.slots ?? []).map((s) => ({
      key: `${g.pickupTime}-${s.id}`,
      id: s.id,
      label: `${g.date} ${s.range}`,
      pickupTime: g.pickupTime,
    }))
  );
}

export function TimeslotSelect({ timeslots, selectedKey, onSelect }: TimeslotSelectProps) {
  const { colors, textPresets } = useThemes();
  const [open, setOpen] = useState(false);
  const items = flattenTimeslots(timeslots);
  const selected = items.find((i) => i.key === selectedKey);

  return (
    <>
      <Pressable
        onPress={() => setOpen(true)}
        style={[shipmentStyles.selectTrigger, { borderColor: colors.border10, backgroundColor: colors.neutral50 }]}
      >
        <Text style={[{ color: selected ? colors.neutral900 : colors.neutral300, flex: 1 }, textPresets.fs14_400]} numberOfLines={1}>
          {selected ? selected.label : "Chọn khung giờ lấy hàng"}
        </Text>
        <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>▼</Text>
      </Pressable>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <View style={shipmentStyles.selectOverlay}>
          <Pressable style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0 }} onPress={() => setOpen(false)} />
          <View style={[shipmentStyles.selectDropdown, { backgroundColor: colors.surface, borderColor: colors.border10 }]}>
            <Pressable onPress={() => setOpen(false)} style={[shipmentStyles.selectCloseRow, { borderBottomColor: colors.border10 }]}>
              <Text style={[textPresets.fs14_400, { color: colors.neutral500 }]}>Khung giờ lấy hàng</Text>
              <Text style={[textPresets.fs18_700, { color: colors.neutral400, lineHeight: 22 }]}>×</Text>
            </Pressable>
            <FlatList
              data={items}
              keyExtractor={(item) => item.key}
              keyboardShouldPersistTaps="handled"
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    onSelect(item.id, item.key, item.pickupTime);
                    setOpen(false);
                  }}
                  style={[shipmentStyles.selectItem, item.key === selectedKey && { backgroundColor: colors.primaryLight }]}
                >
                  <Text style={[textPresets.fs14_400, { color: item.key === selectedKey ? colors.primary : colors.neutral900 }]}>
                    {item.label}
                  </Text>
                </Pressable>
              )}
            />
          </View>
        </View>
      </Modal>
    </>
  );
}

type MoneyFieldProps = {
  label: string;
  value: string;
  onChangeText?: (text: string) => void;
  editable?: boolean;
};

export function MoneyField({ label, value, onChangeText, editable = true }: MoneyFieldProps) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={shipmentStyles.moneyFieldWrap}>
      <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>{label}</Text>
      <View style={[shipmentStyles.moneyField, { borderColor: colors.border10, backgroundColor: colors.neutral50 }]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          editable={editable}
          keyboardType="number-pad"
          style={[shipmentStyles.moneyInput, { color: colors.neutral900 }, textPresets.fs16_500]}
          placeholder="0"
          placeholderTextColor={colors.neutral300}
        />
        <Text style={[{ color: colors.neutral400 }, textPresets.fs14_500]}>VND</Text>
      </View>
    </View>
  );
}

type ShipmentInputProps = {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
  keyboardType?: "default" | "numeric";
  multiline?: boolean;
  topSpacing?: boolean;
};

export function ShipmentInput({ label, value, onChangeText, placeholder, keyboardType, multiline, topSpacing }: ShipmentInputProps) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={[shipmentStyles.formGroup, topSpacing ? { marginTop: 8 } : null]}>
      <Text style={[shipmentStyles.fieldLabel, { color: colors.neutral400 }]}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        keyboardType={keyboardType}
        multiline={multiline}
        style={[
          multiline ? shipmentStyles.noteInput : shipmentStyles.textInput,
          { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 },
          textPresets.fs14_400,
        ]}
        placeholder={placeholder}
        placeholderTextColor={colors.neutral300}
      />
    </View>
  );
}

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

export function ShippingOptions({ viewCondition, setViewCondition, deliveryPolicy, setDeliveryPolicy, refusalFee, setRefusalFee, pickupOption, setPickupOption }: ShippingOptionsProps) {
  const { colors, textPresets } = useThemes();
  return (
    <>
      <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400, { marginTop: 10 }]}>Điều kiện xem hàng</Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip label="Không cho xem hàng" selected={viewCondition === "no_open"} onPress={() => setViewCondition("no_open")} />
        <OptionChip label="Cho xem hàng không thử" selected={viewCondition === "viewable"} onPress={() => setViewCondition("viewable")} />
        <OptionChip label="Cho thử hàng" selected={viewCondition === "fragile"} onPress={() => setViewCondition("fragile")} />
      </View>
      <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400, { marginTop: 6 }]}>Chính sách giao hàng</Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip label="Giao toàn bộ đơn hàng" selected={deliveryPolicy === "full"} onPress={() => setDeliveryPolicy("full")} />
        <OptionChip label="Giao hàng một phần" selected={deliveryPolicy === "partial"} onPress={() => setDeliveryPolicy("partial")} />
      </View>
      <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400, { marginTop: 6 }]}>Phí hoàn trả</Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip label="Miễn phí" selected={refusalFee === "free"} onPress={() => setRefusalFee("free")} />
        <OptionChip label="Thu phí" selected={refusalFee === "charge"} onPress={() => setRefusalFee("charge")} />
      </View>
      <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400, { marginTop: 6 }]}>Hình thức lấy hàng</Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip label="Tại cửa hàng" selected={pickupOption === "cod"} onPress={() => setPickupOption("cod")} />
        <OptionChip label="Gửi tại điểm dịch vụ" selected={pickupOption === "post"} onPress={() => setPickupOption("post")} />
      </View>
    </>
  );
}

export function SummaryRow({ label, value }: { label: string; value: string }) {
  const { colors, textPresets } = useThemes();
  return (
    <View style={shipmentStyles.summaryRow}>
      <Text style={[textPresets.fs12_400, { color: colors.neutral500 }]}>{label}</Text>
      <Text style={[textPresets.fs14_500, { color: colors.neutral900 }]}>{value}</Text>
    </View>
  );
}

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
  parcelItemName: string;
  setParcelItemName: (value: string) => void;
  declaredValue: number;
  setDeclaredValue: (value: number) => void;
  note: string;
  setNote: (value: string) => void;
};

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
      <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>Loại dịch vụ</Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip label="SPX Standard" selected={serviceType === 1} onPress={() => setServiceType(1)} />
        <OptionChip label="SPX Express" selected={serviceType === 2} onPress={() => setServiceType(2)} />
      </View>

      <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400, { marginTop: 10 }]}>Hình thức lấy hàng</Text>
      <View style={shipmentStyles.optionGrid}>
        <OptionChip label="Lấy tại nhà" selected={collectType === 1} onPress={() => setCollectType(1)} />
        <OptionChip label="Lấy tại bưu cục" selected={collectType === 2} onPress={() => setCollectType(2)} />
      </View>

      {collectType === 1 && (
        <>
          <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400, { marginTop: 10 }]}>Khung giờ lấy hàng</Text>
          {timeslotsLoading ? (
            <View style={[shipmentStyles.feeBox, { backgroundColor: colors.neutral50, borderColor: colors.border10 }]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : timeslotsError ? (
            <Text style={[{ color: colors.error }, textPresets.fs12_400]}>{timeslotsError}</Text>
          ) : timeslots.length > 0 ? (
            <TimeslotSelect timeslots={timeslots} selectedKey={pickupTimeKey} onSelect={setPickupTime} />
          ) : (
            <Text style={[{ color: colors.neutral400 }, textPresets.fs12_400]}>Không có khung giờ nào</Text>
          )}
        </>
      )}

      <ShipmentInput label="Tên hàng hóa" value={parcelItemName} onChangeText={setParcelItemName} placeholder="VD: Áo thun, Giày, ..." topSpacing />
      <ShipmentInput label="Giá trị khai báo (VND)" value={String(declaredValue)} onChangeText={(text) => setDeclaredValue(parseInt(text.replace(/\D/g, ""), 10) || 0)} placeholder="0" keyboardType="numeric" topSpacing />
      <ShipmentInput label="Ghi chú" value={note} onChangeText={setNote} placeholder="Nhập ghi chú" multiline topSpacing />
    </>
  );
}

export const shipmentStyles = createStyles(() => ({
  sectionBlock: { paddingHorizontal: 16, paddingVertical: 18, gap: 14 },
  sectionHeader: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const },
  addressCard: { borderWidth: 1, borderRadius: 16, padding: 14, gap: 12, minHeight: 108, justifyContent: "center" as const },
  addAddressCard: { height: 76, borderWidth: 1, borderStyle: "dashed" as const, borderRadius: 16, flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "center" as const, gap: 10 },
  addCircle: { width: 22, height: 22, borderRadius: 11, borderWidth: 1.5, alignItems: "center" as const, justifyContent: "center" as const },
  addressTopRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center" as const, justifyContent: "center" as const },
  addressInfo: { flex: 1, gap: 4 },
  addressNameRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  addressName: { flexShrink: 1 },
  changePill: { height: 32, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1, alignItems: "center" as const, justifyContent: "center" as const },
  defaultBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  addressLine: { lineHeight: 22 },
  divider: { height: 8 },
  orderCard: { borderRadius: 16, padding: 14, gap: 12 },
  orderMetaRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, gap: 12 },
  productTitle: { flex: 1 },
  detailGrid: { flexDirection: "row" as const, flexWrap: "wrap" as const, gap: 8 },
  detailCell: { width: "48%" as const, borderRadius: 12, padding: 12, gap: 4 },
  quantityRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const },
  stepper: { flexDirection: "row" as const, alignItems: "center" as const, borderRadius: 18, overflow: "hidden" as const },
  stepperBtn: { width: 36, height: 36, alignItems: "center" as const, justifyContent: "center" as const },
  stepperValue: { minWidth: 42, textAlign: "center" as const },
  moneyFieldWrap: { gap: 8 },
  moneyField: { height: 52, borderRadius: 14, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  moneyInput: { flex: 1, padding: 0 },
  optionGrid: { gap: 10 },
  optionChip: { minHeight: 48, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, flexDirection: "row" as const, alignItems: "center" as const, gap: 10 },
  optionDot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, alignItems: "center" as const, justifyContent: "center" as const },
  optionDotInner: { width: 8, height: 8, borderRadius: 4 },
  selectTrigger: { height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 14, flexDirection: "row" as const, alignItems: "center" as const, gap: 10, marginTop: 8 },
  selectOverlay: { position: "absolute" as const, top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-end" as const },
  selectDropdown: { borderTopLeftRadius: 16, borderTopRightRadius: 16, borderWidth: 1, borderBottomWidth: 0, maxHeight: 400 },
  selectCloseRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, paddingHorizontal: 16, paddingVertical: 14, borderBottomWidth: 1 },
  selectItem: { paddingHorizontal: 16, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: "#f0f0f0" },
  noteInput: { minHeight: 96, borderWidth: 1, borderRadius: 14, paddingHorizontal: 14, paddingVertical: 12, textAlignVertical: "top" as const },
  formGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, lineHeight: 18 },
  textInput: { height: 48, borderWidth: 1, borderRadius: 12, paddingHorizontal: 14 },
  feeBox: { borderWidth: 1, borderRadius: 12, paddingHorizontal: 14, paddingVertical: 12, minHeight: 44, alignItems: "center" as const, justifyContent: "center" as const },
  feeBoxRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const, width: "100%" as const },
  summaryRow: { flexDirection: "row" as const, alignItems: "center" as const, justifyContent: "space-between" as const },
  sheetOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  sheetContainer: { position: "absolute" as const, bottom: 0, left: 0, right: 0 },
  sheetPanel: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingHorizontal: 20, paddingBottom: 32, paddingTop: 12, maxHeight: 520, gap: 16 },
  sheetHandle: { width: 36, height: 4, borderRadius: 2, backgroundColor: "#E5E5E5", alignSelf: "center" as const, marginBottom: 4 },
  sheetTitle: { textAlign: "center" as const, marginBottom: 4 },
  sheetFooter: { flexDirection: "row" as const, gap: 12, paddingTop: 8 },
  sheetCancelBtn: { flex: 1, height: 52, borderWidth: 1, borderRadius: 16, alignItems: "center" as const, justifyContent: "center" as const },
  sheetSaveBtn: { flex: 2, height: 52, borderRadius: 16, alignItems: "center" as const, justifyContent: "center" as const },
  dimRow: { flexDirection: "row" as const, gap: 10 },
  dimField: { flex: 1, gap: 6 },
  dimAutoScaleRow: { flexDirection: "row" as const, alignItems: "center" as const, gap: 10, marginTop: 12, paddingVertical: 8 },
  dimCheckbox: { width: 20, height: 20, borderWidth: 1.5, borderRadius: 4, alignItems: "center" as const, justifyContent: "center" as const },
}));
