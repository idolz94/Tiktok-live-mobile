import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { shipmentStyles } from "./ShipmentComponents";

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
              value={dimLength}
              onChangeText={onChangeDimLength}
              keyboardType="numeric"
              style={[shipmentStyles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
              placeholder="0"
              placeholderTextColor={colors.neutral300}
            />
          </View>
          <View style={shipmentStyles.dimField}>
            <Text style={[shipmentStyles.fieldLabel, { color: colors.neutral400 }]}>Rộng (cm)</Text>
            <TextInput
              value={dimWidth}
              onChangeText={onChangeDimWidth}
              keyboardType="numeric"
              style={[shipmentStyles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
              placeholder="0"
              placeholderTextColor={colors.neutral300}
            />
          </View>
          <View style={shipmentStyles.dimField}>
            <Text style={[shipmentStyles.fieldLabel, { color: colors.neutral400 }]}>Cao (cm)</Text>
            <TextInput
              value={dimHeight}
              onChangeText={onChangeDimHeight}
              keyboardType="numeric"
              style={[shipmentStyles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
              placeholder="0"
              placeholderTextColor={colors.neutral300}
            />
          </View>
        </View>

        <View style={[shipmentStyles.formGroup, { marginTop: 12 }]}>
          <Text style={[shipmentStyles.fieldLabel, { color: colors.neutral400 }]}>Khối lượng (gram)</Text>
          <TextInput
            value={weightInput}
            onChangeText={(text) => onChangeWeightInput(text.replace(/\D/g, ""))}
            keyboardType="numeric"
            style={[shipmentStyles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
            placeholder="500"
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
        <Pressable style={[shipmentStyles.sheetSaveBtn, { backgroundColor: colors.primary }]} onPress={onClose}>
          <Text style={[textPresets.fs15_400, { color: "#fff" }]}>Xác nhận</Text>
        </Pressable>
      </View>
    </View>
  );
}
