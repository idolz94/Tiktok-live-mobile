import { Order, OrderProduct } from "@/types";
import { createProductFromComment, formatMoneyFromK, getOrderTotal } from "@/utils/order";
import Avatar from "@/components/Avatar";
import ProductTable from "@/components/ProductTable";
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

function createDisplayCode(orderCode: string) {
  const numbers = orderCode.replace(/\D/g, "");
  return `#${(numbers || orderCode).slice(-6).padStart(6, "0")}`;
}

export default function OrderCard({
  item,
  onUpdate,
  onDelete,
  onAddProduct,
  onToggleDeposit,
  onConfirmOrder,
  onOpenOverview
}: {
  item: Order;
  onUpdate: (id: string, field: keyof Order, value: string) => void;
  onDelete: (id: string) => void;
  onAddProduct?: (orderId: string, product: OrderProduct) => void;
  onToggleDeposit?: (orderId: string) => void;
  onConfirmOrder?: (orderId: string) => void;
  onOpenOverview?: (orderId: string) => void;
}) {
  const total = getOrderTotal(item.products || []);
  const isPaid = item.depositStatus === "paid";
  const isConfirmed = item.status === "confirmed";

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <Avatar uri={item.avatar} username={item.username} size={56} />
        <View style={styles.info}>
          <Text style={styles.code}>{createDisplayCode(item.orderCode)}</Text>
          <Text style={styles.name}>{item.username || "Unknown user"}</Text>
          <View style={styles.badgeRow}>
            <Text style={styles.vip}>VIP</Text>
            <Text style={styles.smallBadge}>☎</Text>
            <Text style={styles.smallBadge}>⌖</Text>
          </View>
        </View>
        <View style={styles.rightActions}>
          <TouchableOpacity style={[styles.status, isConfirmed ? styles.confirmed : styles.draft]} onPress={() => onConfirmOrder?.(item.id)}>
            <Text style={styles.statusText}>{isConfirmed ? "Đã chốt" : "Đơn nháp"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.iconButton} onPress={() => onDelete(item.id)}>
            <Text>🗑</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.comment}>{item.comment}</Text>
      <Text style={styles.time}>{new Date(item.createdAt).toLocaleTimeString("vi-VN")}</Text>

      <View style={styles.totalRow}>
        <Text style={styles.muted}>Tạm tính</Text>
        <Text style={styles.total}>{formatMoneyFromK(total)}</Text>
      </View>

      <ProductTable
        products={item.products || []}
        onAddProduct={onAddProduct ? () => onAddProduct(item.id, createProductFromComment(item.comment)) : undefined}
      />

      <Text style={styles.label}>Tên đơn / sản phẩm</Text>
      <TextInput
        style={styles.input}
        value={item.productName}
        onChangeText={(value) => onUpdate(item.id, "productName", value)}
        placeholder="Tên sản phẩm"
      />

      <View style={styles.buttonRow}>
        <TouchableOpacity style={[styles.depositButton, isPaid ? styles.paidButton : styles.unpaidButton]} onPress={() => onToggleDeposit?.(item.id)}>
          <Text style={styles.depositText}>{isPaid ? "ĐÃ CỌC" : "CHƯA CỌC"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.overviewButton} onPress={() => onOpenOverview?.(item.id)}>
          <Text style={styles.overviewText}>TỔNG ĐƠN</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { marginBottom: 10, padding: 14, backgroundColor: "#fff", borderBottomWidth: 6, borderBottomColor: "#f1f5f9" },
  topRow: { flexDirection: "row", alignItems: "flex-start" },
  info: { flex: 1, marginLeft: 12 },
  code: { fontSize: 18, color: "#3478f6", fontWeight: "900" },
  name: { marginTop: 4, fontSize: 19, lineHeight: 24, color: "#273044", fontWeight: "900" },
  badgeRow: { marginTop: 8, flexDirection: "row", alignItems: "center" },
  vip: { marginRight: 8, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 5, backgroundColor: "#e8b72e", color: "#fff", fontWeight: "900" },
  smallBadge: { marginRight: 4, minWidth: 30, textAlign: "center", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 7, paddingVertical: 4, color: "#6b7280" },
  rightActions: { alignItems: "flex-end" },
  status: { borderRadius: 7, paddingHorizontal: 10, paddingVertical: 6 },
  confirmed: { backgroundColor: "#22c55e" },
  draft: { backgroundColor: "#e6b936" },
  statusText: { color: "#fff", fontWeight: "900" },
  iconButton: { marginTop: 8, width: 42, height: 42, borderRadius: 9, backgroundColor: "#f8fafc", borderWidth: 1, borderColor: "#d1d5db", alignItems: "center", justifyContent: "center" },
  comment: { marginTop: 16, fontSize: 16, lineHeight: 23, color: "#64748b", fontWeight: "600" },
  time: { marginTop: 4, fontSize: 12, color: "#64748b", fontStyle: "italic" },
  totalRow: { marginTop: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  muted: { color: "#64748b", fontStyle: "italic" },
  total: { color: "#273044", fontWeight: "900", fontSize: 17 },
  label: { marginTop: 14, marginBottom: 6, fontSize: 13, color: "#475569", fontWeight: "800" },
  input: { minHeight: 44, borderWidth: 1, borderColor: "#cbd5e1", backgroundColor: "#f8fafc", borderRadius: 12, paddingHorizontal: 12, color: "#0f172a" },
  buttonRow: { marginTop: 14, flexDirection: "row" },
  depositButton: { minHeight: 48, flex: 1, marginRight: 10, borderRadius: 9, alignItems: "center", justifyContent: "center", borderWidth: 1 },
  paidButton: { borderColor: "#22c55e", backgroundColor: "#bbf7d0" },
  unpaidButton: { borderColor: "#45b75a", backgroundColor: "#dcfce7" },
  depositText: { fontWeight: "900", color: "#111827" },
  overviewButton: { minHeight: 48, flex: 1, borderRadius: 9, alignItems: "center", justifyContent: "center", backgroundColor: "#e8b72e" },
  overviewText: { fontWeight: "900", color: "#fff" }
});
