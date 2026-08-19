import type { OrderProduct } from "@app-types/index";
import { formatMoney } from "@features/orders/utils/order";
import { createStyles } from "@utils/createStyles";
import { memo } from "react";
import { Text, View } from "react-native";

export const ProductRow = memo(({ product }: { product: OrderProduct }) => {
  const total = Number(product.totalAmount ?? product.price * product.quantity);
  return (
    <View style={styles.productRow}>
      <View style={styles.productInfo}>
        <Text numberOfLines={1} style={styles.productName}>
          {product.name || product.code || "Sản phẩm"}
        </Text>
        <Text style={styles.productMeta}>
          {[product.color, product.size].filter(Boolean).join(" • ") || "Phân loại mặc định"}
        </Text>
      </View>
      <View style={styles.productPriceBox}>
        <Text style={styles.productQuantity}>x{product.quantity}</Text>
        <Text style={styles.productPrice}>{formatMoney(total)}</Text>
      </View>
    </View>
  );
});

ProductRow.displayName = "ProductRow";

const styles = createStyles(({ colors, textPresets }) => ({
  productRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  productInfo: { flex: 1, minWidth: 0 },
  productName: { color: colors.neutral500, fontSize: 13, fontWeight: "600" },
  productMeta: { marginTop: 3, color: colors.textMuted, ...textPresets.fs12_400 },
  productPriceBox: { alignItems: "flex-end" },
  productQuantity: { color: colors.textMuted, ...textPresets.fs12_400 },
  productPrice: { marginTop: 3, color: colors.neutral900, fontSize: 13, fontWeight: "600" },
}));
