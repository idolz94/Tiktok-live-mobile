import { OrderProduct } from "@app-types/index";
import { createStyles } from "@utils/createStyles";
import {
  formatMoneyFromK,
  getOrderTotal,
  getProductTotal,
} from "@features/orders/utils/order";
import { Text, TouchableOpacity, View } from "react-native";

export const ProductTable = ({
  products,
  onAddProduct,
}: {
  products: OrderProduct[];
  onAddProduct?: () => void;
}) => {
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
          <Text style={[styles.cell, styles.nameCell]} numberOfLines={2}>
            {product.name || product.code || "Sản phẩm"}
          </Text>
          <Text style={styles.cell}>{product.quantity}</Text>
          <Text style={styles.cell}>{formatMoneyFromK(product.price)}</Text>
          <Text style={styles.cell}>
            {formatMoneyFromK(getProductTotal(product))}
          </Text>
        </View>
      ))}
      <View style={styles.footer}>
        <Text style={styles.totalLabel}>Tổng</Text>
        <Text style={styles.totalValue}>
          {formatMoneyFromK(getOrderTotal(products || []))}
        </Text>
      </View>
      {onAddProduct ? (
        <TouchableOpacity style={styles.addButton} onPress={onAddProduct}>
          <Text style={styles.addText}>+ Thêm sản phẩm</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  wrapper: {
    marginTop: 12,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    overflow: "hidden",
  },
  header: {
    flexDirection: "row",
    backgroundColor: colors.surface,
    paddingVertical: 8,
  },
  row: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingVertical: 8,
  },
  cell: {
    flex: 1,
    paddingHorizontal: 8,
    color: colors.textDarkGray,
    ...textPresets.fs12_800,
  },
  nameCell: { flex: 2 },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: {
    ...textPresets.fs12_800,
    color: colors.neutral900,
  },
  totalValue: {
    ...textPresets.fs12_800,
    color: colors.neutral900,
  },
  addButton: { padding: 10, alignItems: "center" },
  addText: { color: colors.primary, ...textPresets.fs12_800 },
}));
