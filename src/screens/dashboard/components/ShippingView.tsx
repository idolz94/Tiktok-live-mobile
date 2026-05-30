import { Order } from "@/types";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function ShippingView({ orders }: { orders: Order[] }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Vận đơn</Text>
      <Text style={styles.subtitle}>Danh sách đơn có thể tạo vận đơn sau khi chốt.</Text>
      {orders.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>Chưa có đơn để giao.</Text></View>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.name}>{order.username}</Text>
            <Text numberOfLines={2} style={styles.comment}>{order.comment}</Text>
            <Text style={styles.status}>{order.status === "confirmed" ? "Đã chốt" : "Đơn nháp"}</Text>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 34 },
  title: { fontSize: 26, fontWeight: "900", color: "#273044" },
  subtitle: { marginTop: 8, marginBottom: 18, fontSize: 15, color: "#64748b" },
  card: { marginBottom: 12, borderRadius: 18, backgroundColor: "#fff", padding: 16 },
  name: { fontSize: 18, fontWeight: "900", color: "#273044" },
  comment: { marginTop: 6, color: "#475569", lineHeight: 22 },
  status: { marginTop: 10, color: "#e8b72e", fontWeight: "900" },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: "#64748b", fontWeight: "700" }
});
