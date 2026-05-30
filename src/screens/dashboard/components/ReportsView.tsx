import { formatMoneyFromK } from "@/utils/order";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ReportsView({ commentsCount, buyingCount, ordersCount, totalRevenue }: { commentsCount: number; buyingCount: number; ordersCount: number; totalRevenue: number }) {
  const items = [
    { label: "Comment", value: commentsCount },
    { label: "Có thể chốt", value: buyingCount },
    { label: "Đơn", value: ordersCount },
    { label: "Doanh thu", value: formatMoneyFromK(totalRevenue) }
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
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 34 },
  title: { fontSize: 26, fontWeight: "900", color: "#273044" },
  subtitle: { marginTop: 8, marginBottom: 18, fontSize: 15, color: "#64748b" },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 12 },
  card: { width: "47%", minHeight: 120, borderRadius: 20, backgroundColor: "#fff", padding: 16, justifyContent: "center" },
  value: { fontSize: 24, fontWeight: "900", color: "#22b8e4" },
  label: { marginTop: 10, fontSize: 14, fontWeight: "800", color: "#64748b" }
});
