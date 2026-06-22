import { useLocalSearchParams, router } from "expo-router";
import { readOrders } from "@features/orders/stores/order-store";
import { ProductTable } from "@features/orders/components/product-table";
import { Order } from "@app-types/index";
import { formatMoneyFromK, getOrderTotal } from "@features/orders/utils/order";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function OrderDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const orders = readOrders();
  const order: Order | undefined = orders.find((o: Order) => o.id === id);

  if (!order) {
    // Attempting a simple redirect/back if not found
    if (router.canGoBack()) {
      router.back();
    }
    return null;
  }

  const total = getOrderTotal(order.products || []);

  const handleBack = () => {
    if (router.canGoBack()) {
      router.back();
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack}>
          <Text style={styles.back}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Tổng đơn</Text>
        <View style={{ width: 32 }} />
      </View>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <Text style={styles.orderCode}>{order.orderCode}</Text>
          <Text style={styles.customer}>{order.username}</Text>
          <Text style={styles.comment}>{order.comment}</Text>
          <View style={styles.metaBlock}>
            {order.customerPhone ? <Text style={styles.metaText}>SĐT: {order.customerPhone}</Text> : null}
            {order.customerAddress ? <Text style={styles.metaText}>Địa chỉ: {order.customerAddress}</Text> : null}
            {order.trackingCode ? (
              <Text style={styles.metaText}>Mã vận đơn: {order.trackingCode}</Text>
            ) : null}
            {order.providerName ? (
              <Text style={styles.metaText}>Đơn vị: {order.providerName}</Text>
            ) : null}
          </View>
          <ProductTable products={order.products || []} />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Tổng tiền</Text>
            <Text style={styles.totalValue}>{formatMoneyFromK(total)}</Text>
          </View>
          <TouchableOpacity style={styles.confirmButton} disabled>
            <Text style={styles.confirmText}>Xác nhận đơn</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f7f8" },
  header: {
    minHeight: 64,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    backgroundColor: "#fff7d6",
  },
  back: { fontSize: 38, color: "#111827" },
  title: { fontSize: 24, fontWeight: "900", color: "#273044" },
  container: { padding: 16 },
  card: { borderRadius: 20, backgroundColor: "#fff", padding: 16 },
  orderCode: { fontSize: 20, fontWeight: "900", color: "#2563eb" },
  customer: { marginTop: 8, fontSize: 22, fontWeight: "900", color: "#273044" },
  comment: { marginTop: 10, color: "#475569", lineHeight: 22 },
  metaBlock: {
    marginTop: 12,
    gap: 4,
  },
  metaText: {
    color: "#475569",
    fontSize: 14,
    lineHeight: 20,
  },
  totalRow: {
    marginTop: 18,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalLabel: { fontSize: 17, color: "#64748b", fontWeight: "800" },
  totalValue: { fontSize: 22, color: "#273044", fontWeight: "900" },
  confirmButton: {
    marginTop: 20,
    minHeight: 52,
    borderRadius: 14,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
  },
  confirmText: { color: "#fff", fontWeight: "900", fontSize: 16 },
});
