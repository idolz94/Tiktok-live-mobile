import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { useState } from "react";
import {
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const dimIcons = {
  length: require("../../../../assets/images/dim-icons/length.png"),
  width: require("../../../../assets/images/dim-icons/width.png"),
  height: require("../../../../assets/images/dim-icons/height.png"),
  weight: require("../../../../assets/images/dim-icons/weight.png"),
};

type ParcelInfoSheetProps = {
  weightInput: string;
  onChangeWeightInput: (v: string) => void;
  dimLength: string;
  dimWidth: string;
  dimHeight: string;
  onChangeDimLength: (v: string) => void;
  onChangeDimWidth: (v: string) => void;
  onChangeDimHeight: (v: string) => void;
  declaredValue: number;
  setDeclaredValue: (v: number) => void;
  parcelItemName: string;
  setParcelItemName: (v: string) => void;
  note: string;
  setNote: (v: string) => void;
  allowTryOn: 0 | 1;
  setAllowTryOn: (v: 0 | 1) => void;
  allowPartialDelivery: 0 | 1;
  setAllowPartialDelivery: (v: 0 | 1) => void;
  allowMutualCheck: 0 | 1;
  setAllowMutualCheck: (v: 0 | 1) => void;
  onClose: () => void;
};

const CHECKBOXES = [
  { key: "allowTryOn", label: "Thử hàng" },
  { key: "allowPartialDelivery", label: "Giao hàng một phần" },
  { key: "allowMutualCheck", label: "Cho xem hàng" },
];

export function ParcelInfoSheet({
  weightInput,
  onChangeWeightInput,
  dimLength,
  dimWidth,
  dimHeight,
  onChangeDimLength,
  onChangeDimWidth,
  onChangeDimHeight,
  declaredValue,
  setDeclaredValue,
  parcelItemName,
  setParcelItemName,
  note,
  setNote,
  allowTryOn,
  setAllowTryOn,
  allowPartialDelivery,
  setAllowPartialDelivery,
  allowMutualCheck,
  setAllowMutualCheck,
  onClose,
}: ParcelInfoSheetProps) {
  const { colors, textPresets } = useThemes();
  const insets = useSafeAreaInsets();

  const [localLength, setLocalLength] = useState(dimLength);
  const [localWidth, setLocalWidth] = useState(dimWidth);
  const [localHeight, setLocalHeight] = useState(dimHeight);
  const [localWeight, setLocalWeight] = useState(weightInput);
  const [localDeclared, setLocalDeclared] = useState(
    declaredValue > 0 ? String(declaredValue) : "",
  );
  const [localItemName, setLocalItemName] = useState(parcelItemName);
  const [localNote, setLocalNote] = useState(note);
  const [localTryOn, setLocalTryOn] = useState(allowTryOn);
  const [localPartial, setLocalPartial] = useState(allowPartialDelivery);
  const [localMutual, setLocalMutual] = useState(allowMutualCheck);

  const handleConfirm = () => {
    onChangeWeightInput(localWeight.replace(/\D/g, "") || "0");
    onChangeDimLength(localLength);
    onChangeDimWidth(localWidth);
    onChangeDimHeight(localHeight);
    setDeclaredValue(parseInt(localDeclared.replace(/\D/g, ""), 10) || 0);
    setParcelItemName(localItemName);
    setNote(localNote);
    setAllowTryOn(localTryOn);
    setAllowPartialDelivery(localPartial);
    setAllowMutualCheck(localMutual);
    onClose();
  };

  const mutualLockedByTryOn = localTryOn === 1;

  const checkboxState: Record<string, { value: 0 | 1; toggle: () => void; disabled?: boolean }> = {
    allowTryOn: {
      value: localTryOn,
      toggle: () => {
        const next = localTryOn === 1 ? 0 : 1;
        setLocalTryOn(next);
        if (next === 1) setLocalMutual(1);
      },
    },
    allowPartialDelivery: {
      value: localPartial,
      toggle: () => setLocalPartial((v) => (v === 1 ? 0 : 1)),
    },
    allowMutualCheck: {
      value: localMutual,
      disabled: mutualLockedByTryOn,
      toggle: () => {
        if (mutualLockedByTryOn) return;
        setLocalMutual((v) => (v === 1 ? 0 : 1));
      },
    },
  };

  const dimRows = [
    {
      label: "Dài",
      icon: dimIcons.length,
      value: localLength,
      onChange: setLocalLength,
      unit: "cm",
    },
    {
      label: "Rộng",
      icon: dimIcons.width,
      value: localWidth,
      onChange: setLocalWidth,
      unit: "cm",
    },
    {
      label: "Cao",
      icon: dimIcons.height,
      value: localHeight,
      onChange: setLocalHeight,
      unit: "cm",
    },
    {
      label: "Khối lượng",
      icon: dimIcons.weight,
      value: localWeight,
      onChange: setLocalWeight,
      unit: "gram",
    },
  ];

  return (
    <View style={[styles.sheet, { backgroundColor: colors.surface }]}>
      <Text
        style={[
          styles.title,
          { color: colors.neutral900 },
          textPresets.fs16_600 ?? textPresets.fs16_500,
        ]}
      >
        Thông tin bưu gửi
      </Text>

      <ScrollView
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Checkboxes */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.neutral400 },
            textPresets.fs12_400,
          ]}
        >
          Chính sách nhận hàng
        </Text>
        <View
          style={[
            styles.card,
            { backgroundColor: colors.neutral50, borderColor: colors.border10 },
          ]}
        >
          {CHECKBOXES.map((item) => {
            const { value, toggle, disabled } = checkboxState[item.key];
            return (
              <Pressable
                key={item.key}
                onPress={toggle}
                disabled={disabled}
                style={[styles.checkboxRow, disabled && { opacity: 0.45 }]}
              >
                <View
                  style={[
                    styles.checkbox,
                    {
                      borderColor: value ? colors.primary : colors.border10,
                      backgroundColor: value ? colors.primary : colors.surface,
                    },
                  ]}
                >
                  {value === 1 && <Text style={styles.checkmark}>✓</Text>}
                </View>
                <Text
                  style={[{ color: colors.neutral900 }, textPresets.fs14_400]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* Dimensions + weight */}
        <Text
          style={[
            styles.sectionLabel,
            { color: colors.neutral400 },
            textPresets.fs12_400,
          ]}
        >
          Kích thước & Khối lượng
        </Text>
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.neutral50,
              borderColor: colors.border10,
              gap: 8,
            },
          ]}
        >
          {dimRows.map((row) => (
            <View key={row.label} style={styles.dimRow}>
              <View style={styles.dimRowLeft}>
                <Image source={row.icon} style={styles.dimIcon} />
                <Text
                  style={[{ color: colors.neutral400 }, textPresets.fs14_400]}
                >
                  {row.label}
                </Text>
              </View>
              <View style={styles.dimValueRow}>
                <TextInput
                  value={row.value}
                  onChangeText={(t) => row.onChange(t.replace(/\D/g, ""))}
                  keyboardType="numeric"
                  placeholder="0"
                  placeholderTextColor={colors.neutral300}
                  style={[
                    styles.dimInput,
                    {
                      color: colors.neutral900,
                      borderBottomColor: colors.neutral400,
                    },
                    textPresets.fs14_500,
                  ]}
                  textAlign="right"
                />
                <Text
                  style={[
                    { color: colors.neutral900, width: 36 },
                    textPresets.fs14_500,
                  ]}
                >
                  {row.unit}
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Parcel name */}
        <View style={styles.formGroup}>
          <Text style={[styles.fieldLabel, { color: colors.neutral400 }]}>
            Tên hàng hóa
          </Text>
          <TextInput
            value={localItemName}
            onChangeText={setLocalItemName}
            placeholder="VD: Áo thun, Giày, ..."
            placeholderTextColor={colors.neutral300}
            style={[
              styles.textInput,
              {
                borderColor: colors.border10,
                color: colors.neutral900,
                backgroundColor: colors.neutral50,
              },
              textPresets.fs14_400,
            ]}
          />
        </View>

        {/* Declared value */}
        <View style={styles.formGroup}>
          <Text style={[styles.fieldLabel, { color: colors.neutral400 }]}>
            Giá trị bưu gửi
          </Text>
          <View
            style={[
              styles.moneyRow,
              {
                borderColor: colors.border10,
                backgroundColor: colors.neutral50,
              },
            ]}
          >
            <TextInput
              value={
                localDeclared
                  ? Number(localDeclared).toLocaleString("vi-VN")
                  : ""
              }
              onChangeText={(t) => setLocalDeclared(t.replace(/\D/g, ""))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.neutral300}
              style={[
                styles.moneyInput,
                { color: colors.neutral900 },
                textPresets.fs14_400,
              ]}
            />
            <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>
              VNĐ
            </Text>
          </View>
        </View>

        {/* Note */}
        <View style={[styles.formGroup, { marginBottom: 24 }]}>
          <View style={styles.noteLabelRow}>
            <Text style={[styles.fieldLabel, { color: colors.neutral400 }]}>
              Ghi chú người bán
            </Text>
            <Text style={[styles.fieldLabel, { color: colors.neutral400 }]}>
              {localNote.length}/255
            </Text>
          </View>
          <TextInput
            value={localNote}
            onChangeText={(t) => setLocalNote(t.slice(0, 255))}
            placeholder="Nhập ghi chú"
            placeholderTextColor={colors.neutral300}
            multiline
            numberOfLines={3}
            style={[
              styles.noteInput,
              {
                borderColor: colors.border10,
                color: colors.neutral900,
                backgroundColor: colors.neutral50,
              },
              textPresets.fs14_400,
            ]}
          />
        </View>
      </ScrollView>

      <View
        style={[
          styles.footer,
          {
            borderTopColor: colors.border10,
            backgroundColor: colors.surface,
          },
        ]}
      >
        <Pressable
          style={[styles.confirmBtn, { backgroundColor: colors.primary }]}
          onPress={handleConfirm}
        >
          <Text
            style={[
              textPresets.fs15_400 ?? textPresets.fs14_500,
              { color: "#fff" },
            ]}
          >
            Xác nhận
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles(() => ({
  sheet: {
    paddingTop: 12,
    maxHeight: 680,
    flex: 1,
  },
  title: { textAlign: "center", marginBottom: 16 },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 8 },
  sectionLabel: { marginBottom: 8, marginTop: 16, paddingHorizontal: 20 },
  card: {
    borderWidth: 0.5,
    borderRadius: 12,
    marginHorizontal: 20,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    paddingVertical: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: { color: "#fff", fontSize: 12, lineHeight: 15 },
  dimRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  dimRowLeft: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  dimIcon: { width: 18, height: 18 },
  dimValueRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  dimInput: {
    width: 72,
    textAlign: "right",
    paddingVertical: 2,
    paddingHorizontal: 0,
    borderBottomWidth: 1,
  },
  formGroup: { gap: 6, marginTop: 16, paddingHorizontal: 20 },
  fieldLabel: { fontSize: 12, lineHeight: 18 },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  moneyRow: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  moneyInput: { flex: 1 },
  noteLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  noteInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 12,
    minHeight: 88,
    textAlignVertical: "top",
  },
  footer: {
    paddingTop: 8,
    borderTopWidth: 0.5,
    paddingHorizontal: 20,
  },
  confirmBtn: {
    height: 52,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
}));
