import { Ionicons } from "@expo/vector-icons";
import { getCustomerTypeIcon } from "@features/customers/customer-type-icon";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { memo, useState } from "react";
import { Image, Pressable, Text, TextInput, View } from "react-native";
import { Popover } from "@components/popover";

const CUSTOMER_TYPES = ["Lẻ", "Sỉ", "VIP", "Chốt Dạo", "Bomb"];

export const SelectField = memo(({ label, value, onChange, hint }: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: string;
}) => {
  const { colors, textPresets } = useThemes();
  const [popoverVisible, setPopoverVisible] = useState(false);

  return (
    <View style={styles.fieldGroup}>
      <Text style={styles.fieldLabel}>{label}</Text>
      <Popover visible={popoverVisible} onVisibleChange={setPopoverVisible} trigger={<Pressable onPress={() => setPopoverVisible(true)} style={styles.selectInput}><Text style={[textPresets.fs14_400, { color: value ? colors.neutral900 : colors.neutral300, flex: 1 }]}>{value || "Chọn loại khách hàng"}</Text><Ionicons name="chevron-down" size={16} color={colors.neutral400} /></Pressable>} placement="bottom" showArrow={false} showBackdrop={false} closeOnOutsidePress>
        <View style={{ width: 200, padding: 4 }}>
          {CUSTOMER_TYPES.map((opt) => {
            const selected = value === opt;
            return (
              <Pressable key={opt} onPress={() => { onChange(opt); setPopoverVisible(false); }} style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 10, paddingHorizontal: 12, borderRadius: 6, backgroundColor: selected ? colors.primaryLight : "transparent" }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                  {(() => { const icon = getCustomerTypeIcon(opt); return icon ? <Image source={icon} style={{ width: 20, height: 20 }} /> : null; })()}
                  <Text style={[textPresets.fs14_400, { color: selected ? colors.primary : colors.neutral900 }]}>{opt}</Text>
                </View>
                {selected && <Ionicons name="checkmark" size={16} color={colors.primary} />}
              </Pressable>
            );
          })}
        </View>
      </Popover>
      {!!hint && <Text style={styles.fieldHint}>{hint}</Text>}
    </View>
  );
});

SelectField.displayName = "SelectField";

export const Field = memo(({ label, value, placeholder, multiline, keyboardType, onChangeText, onBlur }: {
  label: string;
  value: string;
  placeholder?: string;
  multiline?: boolean;
  keyboardType?: import("react-native").TextInputProps["keyboardType"];
  onChangeText: (value: string) => void;
  onBlur?: () => void;
}) => (
  <View style={styles.fieldGroup}>
    <Text style={styles.fieldLabel}>{label}</Text>
    <TextInput value={value} placeholder={placeholder} placeholderTextColor="#A0A0A0" multiline={multiline} keyboardType={keyboardType} onChangeText={onChangeText} onBlur={onBlur} style={[styles.input, multiline && styles.inputMultiline]} textAlignVertical={multiline ? "top" : "center"} />
  </View>
));
Field.displayName = "Field";

const styles = createStyles(({ colors, textPresets }) => ({
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { marginBottom: 8, color: colors.neutral400, fontSize: 14, fontWeight: "600" },
  fieldHint: { marginTop: 4, color: colors.neutral400, ...textPresets.fs12_400 },
  input: { minHeight: 48, borderWidth: 1, borderColor: colors.border10, borderRadius: 8, paddingHorizontal: 16, color: colors.neutral900, backgroundColor: colors.white, ...textPresets.fs14_400 },
  inputMultiline: { minHeight: 88, paddingTop: 14, paddingBottom: 14 },
  selectInput: { minHeight: 48, borderWidth: 1, borderColor: colors.border10, borderRadius: 8, paddingHorizontal: 16, backgroundColor: colors.white, flexDirection: "row", alignItems: "center" },
}));
