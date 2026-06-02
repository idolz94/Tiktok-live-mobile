import { createStyles } from "@utils/createStyles";
import { Text, View } from "react-native";

export const StatsRow = ({
  commentsCount,
  buyingCount,
  ordersCount,
}: {
  commentsCount: number;
  buyingCount: number;
  ordersCount: number;
}) => {
  const items = [
    { label: "Comment", value: commentsCount },
    { label: "Có thể chốt", value: buyingCount },
    { label: "Đơn", value: ordersCount },
  ];

  return (
    <View style={styles.row}>
      {items.map((item) => (
        <View key={item.label} style={styles.card}>
          <Text style={styles.value}>{item.value}</Text>
          <Text style={styles.label}>{item.label}</Text>
        </View>
      ))}
    </View>
  );
};

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  row: { flexDirection: "row", gap: 10, paddingTop: 24, paddingBottom: 16 },
  card: {
    flex: 1,
    minHeight: 86,
    borderRadius: 16,
    backgroundColor: colors.white,
    justifyContent: "center",
    paddingHorizontal: 16,
    ...shadows.sd2,
  },
  value: { color: colors.info, ...textPresets.fs26_900 },
  label: {
    marginTop: 8,
    ...textPresets.fs14_800,
    color: colors.textMuted,
  },
}));
