import type { Order } from "@app-types/index";
import { formatMoney, getOrderTotal } from "@features/orders/utils/order";
import { createStyles } from "@utils/createStyles";
import { memo } from "react";
import { Pressable, Text, View } from "react-native";
import { OrderStatusBadge } from "./order-status-badge";
import { ProductRow } from "./product-row";
import { TrackingRow } from "./tracking-row";

export const OrderCard = memo(({
  order,
  cancelling,
  onCancelShipment,
  onViewDetail,
}: {
  order: Order;
  cancelling: boolean;
  onCancelShipment: (order: Order) => Promise<void>;
  onViewDetail: () => void;
}) => {
  const products = Array.isArray(order.products) ? order.products : [];
  const total = Number(order.totalAmount ?? getOrderTotal(products));

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <View style={styles.orderTitleBox}>
          <Text style={styles.orderCode}>{order.orderCode || order.id}</Text>
        </View>
        <OrderStatusBadge order={order} />
      </View>

      <TrackingRow
        order={order}
        cancelling={cancelling}
        onCancelShipment={() => onCancelShipment(order)}
      />

      <View style={styles.productList}>
        {products.map((product) => (
          <ProductRow key={product.id} product={product} />
        ))}
      </View>

      <View style={styles.orderTotalRow}>
        <Text style={styles.orderTotalLabel}>Tổng đơn hàng</Text>
        <Text style={styles.orderTotalValue}>{formatMoney(total)}</Text>
      </View>

      <View style={styles.orderActions}>
        <Pressable style={styles.detailButton} onPress={onViewDetail}>
          <Text style={styles.detailButtonText}>Xem chi tiết</Text>
        </Pressable>
      </View>
    </View>
  );
});

OrderCard.displayName = "OrderCard";

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  orderCard: { marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 16, backgroundColor: colors.white, padding: 14, ...shadows.sd1 },
  orderHeader: { flexDirection: "row", alignItems: "flex-start", justifyContent: "space-between", gap: 10 },
  orderTitleBox: { flex: 1, minWidth: 0 },
  orderCode: { color: colors.neutral900, fontSize: 14, fontWeight: "600" },
  productList: { marginTop: 12, gap: 10 },
  orderTotalRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderTotalLabel: { color: colors.neutral400, fontSize: 13, fontWeight: "500" },
  orderTotalValue: { color: colors.neutral900, ...textPresets.fs15_800 },
  orderActions: { marginTop: 12, flexDirection: "row", gap: 10 },
  detailButton: { flex: 1, height: 40, borderRadius: 999, alignItems: "center", justifyContent: "center", backgroundColor: colors.primary },
  detailButtonText: { color: colors.white, fontSize: 13, fontWeight: "600" },
}));
