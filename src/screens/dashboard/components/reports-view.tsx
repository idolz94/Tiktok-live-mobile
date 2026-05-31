import { createStyles } from "@utils/createStyles";
import { formatMoneyFromK } from "@utils/order";
import { ScrollView, Text, View } from "react-native";

export const ReportsView = ({
  commentsCount,
  buyingCount,
  ordersCount,
  totalRevenue,
}: {
  commentsCount: number;
  buyingCount: number;
  ordersCount: number;
  totalRevenue: number;
}) => {
  const items = [
    { label: "Comment", value: commentsCount },
    { label: "Có thể chốt", value: buyingCount },
    { label: "Đơn", value: ordersCount },
    { label: "Doanh thu", value: formatMoneyFromK(totalRevenue) },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Báo cáo</Text>
      <Text style={styles.subtitle}>Tổng hợp nhanh theo dữ liệu hiện tại.</Text>
      <View style={styles.grid}>
        {items.map((item) => (
          <View key={item.label} style={styles.card}>
            <Text style={styles.value}>{item.value}</Text>
            <Text style={styles.label}>{item.label}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  container: { padding: 18, paddingBottom: 34 },
  title: { color: colors.text, ...textPresets.fs26_900 },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    color: colors.textMuted,
    ...textPresets.fs15_400,
  },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: {
    width: "47%",
    minHeight: 120,
    borderRadius: 20,
    backgroundColor: colors.white,
    padding: 16,
    justifyContent: "center",
  },
  value: { color: colors.info, ...textPresets.fs24_900 },
  label: {
    marginTop: 10,
    color: colors.textMuted,
    ...textPresets.fs14_800,
  },
}));
