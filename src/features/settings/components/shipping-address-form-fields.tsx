import { Pressable, Text, TextInput, View } from "react-native";
import { shippingSettingsStyles as styles } from "./shipping-settings.styles";
import { AnimatedErrorText } from "@components/animated-error-text";

export function AddressInput({ label, required = false, value, onChangeText, onBlur, keyboardType = "default", placeholder, error }: {
  label: string;
  required?: boolean;
  value: string;
  onChangeText: (value: string) => void;
  onBlur?: () => void;
  keyboardType?: "default" | "phone-pad";
  placeholder: string;
  error?: string | null;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required ? <Text style={styles.requiredMark}>*</Text> : null}
      </Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        onBlur={onBlur}
        keyboardType={keyboardType}
        style={[styles.input, error && styles.inputError]}
        placeholderTextColor="#d1d5db"
        placeholder={placeholder}
      />
      <AnimatedErrorText message={error ?? undefined} />
    </View>
  );
}

export function SwitchRow({ title, subtitle, value, onPress }: {
  title: string;
  subtitle?: string;
  value: boolean;
  onPress: () => void;
}) {
  return (
    <View style={styles.switchRow}>
      <View style={styles.switchTextWrap}>
        <Text style={styles.switchTitle}>{title}</Text>
        {subtitle ? <Text style={styles.switchSubtitle}>{subtitle}</Text> : null}
      </View>
      <Pressable
        style={[styles.switchTrack, value ? styles.switchTrackActive : styles.switchTrackInactive]}
        onPress={onPress}
      >
        <View style={[styles.switchThumb, value ? styles.switchThumbActive : styles.switchThumbInactive]} />
      </Pressable>
    </View>
  );
}

export function PickerField({ label, required = false, value, placeholder, disabled = false, onPress, error, dirty }: {
  label: string;
  required?: boolean;
  value: string;
  placeholder: string;
  disabled?: boolean;
  onPress: () => void;
  error?: string | null;
  dirty?: boolean;
}) {
  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>
        {label} {required ? <Text style={styles.requiredMark}>*</Text> : null}
      </Text>
      <Pressable
        style={[styles.pickerButton, dirty && error && styles.inputError, disabled && styles.pickerButtonDisabled]}
        disabled={disabled}
        onPress={onPress}
      >
        <Text style={[styles.pickerButtonText, !value && styles.pickerPlaceholder]}>{value || placeholder}</Text>
        <Text style={styles.pickerChevron}>⌄</Text>
      </Pressable>
      <AnimatedErrorText message={dirty && error ? error : undefined} />
    </View>
  );
}
