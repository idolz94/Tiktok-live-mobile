import ProductTable from "@/components/ProductTable";
import { Order } from "@/types";
import { formatMoneyFromK, getOrderTotal } from "@/utils/order";
import { SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function OrderOverviewScreen({ order, onBack, onConfirm }: { order: Order; onBack: () => void; onConfirm: (orderId: string) => void }) {
  const total = getOrderTotal(order.products || []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack}><Text style={styles.back}>‹</Text></TouchableOpacity>
        <Text style={styles.title}>Tổng đơn</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.orderCode}>{order.orderCode}</Text>
          <Text style={styles.customer}>{order.username}</Text>
          <Text style={styles.comment}>{order.comment}</Text>
          <ProductTable products={order.products || []} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalValue}>{formatMoneyFromK(total)}</Text>
          </View>
          <TouchableOpacity style={styles.confirmButton} onPress={() => onConfirm(order.id)}>
            <Text style={styles.confirmText}>{order.status === "confirmed" ? "Chuyển về đơn nháp" : "Xác nhận đơn"}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f7f8" },
  header: { minHeight: 64, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, backgroundColor: "#fff7d6" },
  back: { fontSize: 38, color: "#111827" },
  title: { fontSize: 24, fontWeight: "900", color: "#273044" },
  container: { padding: 16 },
  card: { borderRadius: 20, backgroundColor: "#fff", padding: 16 },
  orderCode: { fontSize: 20, fontWeight: "900", color: "#2563eb" },
  customer: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#273044" },
  comment: { marginTop: 10, color: "#475569", lineHeight: 22 },
  totalRow: { marginTop: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  totalLabel: { fontSize: 17, color: "#64748b", fontWeight: "800" },
  totalValue: { fontSize: 22, color: "#273044", fontWeight: "900" },
  confirmButton: { marginTop: 20, minHeight: 52, borderRadius: 14, backgroundColor: "#22c55e", alignItems: "center", justifyContent: "center" },
  confirmText: { color: "#fff", fontWeight: "900", fontSize: 16 }
});
