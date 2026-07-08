import { createStyles } from "@utils/createStyles";
import { Pressable, Text, TextInput, View } from "react-native";

type TikTokConnectionCardProps = {
  label: string;
  connectionText: string;
  value: string;
  onChangeText: (text: string) => void;
  onSubmit: () => void;
  serverText: string;
  placeholder: string;
  placeholderTextColor: string;
  connectLabel: string;
};

export function TikTokConnectionCard({
  label,
  connectionText,
  value,
  onChangeText,
  onSubmit,
  serverText,
  placeholder,
  placeholderTextColor,
  connectLabel,
}: TikTokConnectionCardProps) {
  return (
    <View style={styles.tiktokCard}>
      <View style={styles.tiktokHeader}>
        <View>
          <Text style={styles.cardLabel}>{label}</Text>
          <Text style={styles.connectionText}>{connectionText}</Text>
        </View>
      </View>
      <TextInput
        style={styles.input}
        value={value}
        onChangeText={onChangeText}
        autoCapitalize="none"
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
      />
      <Pressable style={styles.changeButton} onPress={onSubmit}>
        <Text style={styles.changeButtonText}>{connectLabel}</Text>
      </Pressable>
      <Text numberOfLines={1} style={styles.serverText}>
        {serverText}
      </Text>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  tiktokCard: {
    gap: 12,
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border10,
    backgroundColor: colors.neutral100,
  },
  tiktokHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  cardLabel: {
    color: colors.neutral900,
    lineHeight: 22,
    ...textPresets.fs14_500,
  },
  connectionText: {
    color: colors.neutral400,
    lineHeight: 20,
    marginTop: 2,
    ...textPresets.fs12_400,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.border10,
    borderRadius: 12,
    paddingHorizontal: 12,
    color: colors.neutral900,
    backgroundColor: colors.neutral50,
    ...textPresets.fs14_400,
  },
  changeButton: {
    minHeight: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral900,
  },
  changeButtonText: {
    color: colors.neutral100,
    ...textPresets.fs14_500,
  },
  serverText: {
    color: colors.neutral300,
    ...textPresets.fs12_400,
  },
}));
