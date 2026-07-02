import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { shipmentStyles } from "./shipment-styles";

type PackageDimModalProps = {
  dimLength: string;
  dimWidth: string;
  dimHeight: string;
  weightInput: string;
  autoScale: boolean;
  onChangeDimLength: (v: string) => void;
  onChangeDimWidth: (v: string) => void;
  onChangeDimHeight: (v: string) => void;
  onChangeWeightInput: (v: string) => void;
  onToggleAutoScale: () => void;
  onClose: () => void;
};

export function PackageDimModal({
  dimLength,
  dimWidth,
  dimHeight,
  weightInput,
  autoScale,
  onChangeDimLength,
  onChangeDimWidth,
  onChangeDimHeight,
  onChangeWeightInput,
  onToggleAutoScale,
  onClose,
}: PackageDimModalProps) {
  const { colors, textPresets } = useThemes();

  const [localLength, setLocalLength] = useState(dimLength);
  const [localWidth, setLocalWidth] = useState(dimWidth);
  const [localHeight, setLocalHeight] = useState(dimHeight);
  const [localWeightKg, setLocalWeightKg] = useState(
    weightInput ? String((parseInt(weightInput, 10) || 0) / 1000) : ""
  );

  const handleConfirm = () => {
    onChangeDimLength(localLength);
    onChangeDimWidth(localWidth);
    onChangeDimHeight(localHeight);
    const kg = parseFloat(localWeightKg.replace(",", ".")) || 0;
    onChangeWeightInput(String(Math.round(kg * 1000)));
    onClose();
  };

  return (
    <View style={[shipmentStyles.sheetPanel, { backgroundColor: colors.surface }]}>
      <View style={shipmentStyles.sheetHandle} />
      <Text style={[shipmentStyles.sheetTitle, { color: colors.neutral900 }, textPresets.fs16_600 ?? textPresets.fs16_500]}>
        Kích thước kiện hàng
      </Text>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={shipmentStyles.dimRow}>
          <View style={shipmentStyles.dimField}>
            <Text style={[shipmentStyles.fieldLabel, { color: colors.neutral400 }]}>Dài (cm)</Text>
            <TextInput
              value={localLength}
              onChangeText={setLocalLength}
              keyboardType="numeric"
              style={[shipmentStyles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
              placeholder="0"
              placeholderTextColor={colors.neutral300}
            />
          </View>
          <View style={shipmentStyles.dimField}>
            <Text style={[shipmentStyles.fieldLabel, { color: colors.neutral400 }]}>Rộng (cm)</Text>
            <TextInput
              value={localWidth}
              onChangeText={setLocalWidth}
              keyboardType="numeric"
              style={[shipmentStyles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
              placeholder="0"
              placeholderTextColor={colors.neutral300}
            />
          </View>
          <View style={shipmentStyles.dimField}>
            <Text style={[shipmentStyles.fieldLabel, { color: colors.neutral400 }]}>Cao (cm)</Text>
            <TextInput
              value={localHeight}
              onChangeText={setLocalHeight}
              keyboardType="numeric"
              style={[shipmentStyles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
              placeholder="0"
              placeholderTextColor={colors.neutral300}
            />
          </View>
        </View>

        <View style={[shipmentStyles.formGroup, { marginTop: 12 }]}>
          <Text style={[shipmentStyles.fieldLabel, { color: colors.neutral400 }]}>Khối lượng (kg)</Text>
          <TextInput
            value={localWeightKg}
            onChangeText={setLocalWeightKg}
            keyboardType="decimal-pad"
            style={[shipmentStyles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
            placeholder="0.5"
            placeholderTextColor={colors.neutral300}
          />
        </View>

        <Pressable style={shipmentStyles.dimAutoScaleRow} onPress={onToggleAutoScale}>
          <View style={[shipmentStyles.dimCheckbox, { borderColor: colors.border10, backgroundColor: autoScale ? colors.primary : colors.surface }]}>
            {autoScale && <Text style={{ color: "#fff", fontSize: 11, lineHeight: 14 }}>✓</Text>}
          </View>
          <Text style={[textPresets.fs14_400, { color: colors.neutral500, flex: 1 }]}>
            Tự tính khối lượng theo kích thước
          </Text>
        </Pressable>
      </ScrollView>

      <View style={shipmentStyles.sheetFooter}>
        <Pressable style={[shipmentStyles.sheetCancelBtn, { borderColor: colors.border10 }]} onPress={onClose}>
          <Text style={[textPresets.fs15_400, { color: colors.neutral900 }]}>Huỷ</Text>
        </Pressable>
        <Pressable style={[shipmentStyles.sheetSaveBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
          <Text style={[textPresets.fs15_400, { color: "#fff" }]}>Xác nhận</Text>
        </Pressable>
      </View>
    </View>
  );
}
