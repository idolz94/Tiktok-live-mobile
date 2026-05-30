import { StyleSheet, Text, View } from "react-native";

export default function StatsRow({ commentsCount, buyingCount, ordersCount }: { commentsCount: number; buyingCount: number; ordersCount: number }) {
  const items = [
    { label: "Comment", value: commentsCount },
    { label: "Có thể chốt", value: buyingCount },
    { label: "Đơn", value: ordersCount }
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
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", gap: 10, paddingTop: 24, paddingBottom: 16 },
  card: { flex: 1, minHeight: 86, borderRadius: 16, backgroundColor: "#fff", justifyContent: "center", paddingHorizontal: 16, shadowColor: "#0f172a", shadowOpacity: 0.07, shadowRadius: 12, elevation: 2 },
  value: { fontSize: 28, fontWeight: "900", color: "#22b8e4" },
  label: { marginTop: 8, fontSize: 13, fontWeight: "800", color: "#64748b" }
});
