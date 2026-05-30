import { OrderProduct } from "@/types";
import { formatMoneyFromK, getOrderTotal, getProductTotal } from "@/utils/order";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function ProductTable({ products, onAddProduct }: { products: OrderProduct[]; onAddProduct?: () => void }) {
  return (
    <View style={styles.wrapper}>
      <View style={styles.header}>
        <Text style={[styles.cell, styles.nameCell]}>Sản phẩm</Text>
        <Text style={styles.cell}>SL</Text>
        <Text style={styles.cell}>Giá</Text>
        <Text style={styles.cell}>Tổng</Text>
      </View>
      {(products || []).map((product) => (
        <View key={product.id} style={styles.row}>
          <Text style={[styles.cell, styles.nameCell]} numberOfLines={2}>{product.name}</Text>
          <Text style={styles.cell}>{product.quantity}</Text>
          <Text style={styles.cell}>{formatMoneyFromK(product.price)}</Text>
          <Text style={styles.cell}>{formatMoneyFromK(getProductTotal(product))}</Text>
        </View>
      ))}
      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Tổng</Text>
        <Text style={styles.totalValue}>{formatMoneyFromK(getOrderTotal(products || []))}</Text>
      </View>
      {onAddProduct ? (
        <TouchableOpacity style={styles.addButton} onPress={onAddProduct}>
          <Text style={styles.addText}>+ Thêm sản phẩm</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginTop: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 12, overflow: "hidden" },
  header: { flexDirection: "row", backgroundColor: "#f8fafc", paddingVertical: 8 },
  row: { flexDirection: "row", borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingVertical: 8 },
  cell: { flex: 1, paddingHorizontal: 8, fontSize: 12, color: "#475569", fontWeight: "700" },
  nameCell: { flex: 2 },
  footer: { flexDirection: "row", justifyContent: "space-between", padding: 10, backgroundColor: "#f8fafc", borderTopWidth: 1, borderTopColor: "#e5e7eb" },
  totalLabel: { fontWeight: "900", color: "#273044" },
  totalValue: { fontWeight: "900", color: "#273044" },
  addButton: { padding: 10, alignItems: "center" },
  addText: { color: "#2563eb", fontWeight: "900" }
});
