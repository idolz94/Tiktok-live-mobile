import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";

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
    <View style={[styles.sheetPanel, { backgroundColor: colors.surface }]}>
      <View style={styles.sheetHandle} />
      <Text style={[styles.sheetTitle, { color: colors.neutral900 }, textPresets.fs16_600 ?? textPresets.fs16_500]}>
        Kích thước kiện hàng
      </Text>

      <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}>
        <View style={styles.dimRow}>
          <View style={styles.dimField}>
            <Text style={[styles.fieldLabel, { color: colors.neutral400 }]}>Dài (cm)</Text>
            <TextInput
              value={localLength}
              onChangeText={setLocalLength}
              keyboardType="numeric"
              style={[styles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
              placeholder="0"
              placeholderTextColor={colors.neutral300}
            />
          </View>
          <View style={styles.dimField}>
            <Text style={[styles.fieldLabel, { color: colors.neutral400 }]}>Rộng (cm)</Text>
            <TextInput
              value={localWidth}
              onChangeText={setLocalWidth}
              keyboardType="numeric"
              style={[styles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
              placeholder="0"
              placeholderTextColor={colors.neutral300}
            />
          </View>
          <View style={styles.dimField}>
            <Text style={[styles.fieldLabel, { color: colors.neutral400 }]}>Cao (cm)</Text>
            <TextInput
              value={localHeight}
              onChangeText={setLocalHeight}
              keyboardType="numeric"
              style={[styles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
              placeholder="0"
              placeholderTextColor={colors.neutral300}
            />
          </View>
        </View>

        <View style={[styles.formGroup, { marginTop: 12 }]}>
          <Text style={[styles.fieldLabel, { color: colors.neutral400 }]}>Khối lượng (kg)</Text>
          <TextInput
            value={localWeightKg}
            onChangeText={setLocalWeightKg}
            keyboardType="decimal-pad"
            style={[styles.textInput, { borderColor: colors.border10, color: colors.neutral900, backgroundColor: colors.neutral50 }, textPresets.fs14_400]}
            placeholder="0.5"
            placeholderTextColor={colors.neutral300}
          />
        </View>

        <Pressable style={styles.dimAutoScaleRow} onPress={onToggleAutoScale}>
          <View style={[styles.dimCheckbox, { borderColor: colors.border10, backgroundColor: autoScale ? colors.primary : colors.surface }]}>
            {autoScale && <Text style={{ color: "#fff", fontSize: 11, lineHeight: 14 }}>✓</Text>}
          </View>
          <Text style={[textPresets.fs14_400, { color: colors.neutral500, flex: 1 }]}>
            Tự tính khối lượng theo kích thước
          </Text>
        </Pressable>
      </ScrollView>

      <View style={styles.sheetFooter}>
        <Pressable style={[styles.sheetCancelBtn, { borderColor: colors.border10 }]} onPress={onClose}>
          <Text style={[textPresets.fs15_400, { color: colors.neutral900 }]}>Huỷ</Text>
        </Pressable>
        <Pressable style={[styles.sheetSaveBtn, { backgroundColor: colors.primary }]} onPress={handleConfirm}>
          <Text style={[textPresets.fs15_400, { color: "#fff" }]}>Xác nhận</Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles(() => ({
  formGroup: { gap: 6 },
  fieldLabel: { fontSize: 12, lineHeight: 18 },
  textInput: {
    height: 48,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
  },
  sheetPanel: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
    maxHeight: 520,
    gap: 16,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E5E5",
    alignSelf: "center" as const,
    marginBottom: 4,
  },
  sheetTitle: { textAlign: "center" as const, marginBottom: 4 },
  sheetFooter: { flexDirection: "row" as const, gap: 12, paddingTop: 8 },
  sheetCancelBtn: {
    flex: 1,
    height: 52,
    borderWidth: 1,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  sheetSaveBtn: {
    flex: 2,
    height: 52,
    borderRadius: 16,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  dimRow: { flexDirection: "row" as const, gap: 10 },
  dimField: { flex: 1, gap: 6 },
  dimAutoScaleRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    marginTop: 12,
    paddingVertical: 8,
  },
  dimCheckbox: {
    width: 20,
    height: 20,
    borderWidth: 1.5,
    borderRadius: 4,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
}));
