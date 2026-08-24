import type { Order } from "@app-types/index";
import { Button } from "@components/button";
import { formatMoney, getOrderTotal, statusLabel } from "@features/orders/utils/order";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { memo } from "react";
import { Text, View } from "react-native";
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
  const { colors } = useThemes();
  const products = Array.isArray(order.products) ? order.products : [];
  const total = Number(order.totalAmount ?? getOrderTotal(products));
  // ponytail: đơn không có order_items (vd đơn cũ/đơn ghép mất item) thì productName/price cũng
  // rỗng theo — tránh hiện 1 dòng trống kèm "0 VNĐ" nhìn như lỗi, ẩn hẳn khối sản phẩm và chỉ
  // còn dòng Tạm tính (vẫn đúng vì lấy từ order.totalAmount, không phụ thuộc order_items).
  const fallbackName = order.productName || order.comment;
  const showFallbackRow = products.length === 0 && Boolean(fallbackName);

  return (
    <View style={styles.orderCard}>
      <View style={styles.orderHeader}>
        <Text style={styles.orderCode}>{order.orderCode || order.id}</Text>
        <View
          style={[
            styles.statusBadge,
            {
              backgroundColor:
                order.status === "confirmed" ? colors.success : colors.neutral50,
            },
          ]}
        >
          <Text
            style={[
              styles.statusBadgeText,
              order.status === "confirmed" && { color: colors.neutral100 },
            ]}
          >
            {statusLabel(order.status)}
          </Text>
        </View>
      </View>

      <TrackingRow
        order={order}
        cancelling={cancelling}
        onCancelShipment={() => onCancelShipment(order)}
      />

      {products.length > 0 || showFallbackRow ? (
        <View style={styles.productList}>
          {products.length > 0 ? (
            products.map((product) => (
              <ProductRow key={product.id} product={product} />
            ))
          ) : (
            <View style={styles.fallbackRow}>
              <Text numberOfLines={2} style={styles.fallbackNameText}>
                {fallbackName}
              </Text>
              <Text style={styles.fallbackPrice}>
                {formatMoney(Number(order.price || 0) * Number(order.quantity || 1))}
              </Text>
            </View>
          )}
        </View>
      ) : null}

      <View style={styles.orderTotalRow}>
        <Text style={styles.orderTotalLabel}>Tạm tính</Text>
        <Text style={styles.orderTotalValue}>{formatMoney(total)}</Text>
      </View>

      <View style={styles.orderActions}>
        <Button
          title="Tổng quan đơn hàng"
          loading={false}
          loadingType="center"
          onPress={onViewDetail}
          gradientType="gra_primary"
          containerStyle={styles.detailButton}
          txtBtnStyle={styles.detailButtonText}
        />
      </View>
    </View>
  );
});

OrderCard.displayName = "OrderCard";

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  orderCard: { marginBottom: 12, borderWidth: 1, borderColor: colors.borderLight, borderRadius: 16, backgroundColor: colors.white, padding: 14, ...shadows.sd1 },
  orderHeader: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  orderCode: { color: colors.neutral900, fontSize: 14, fontWeight: "600" },
  statusBadge: { paddingHorizontal: 9, paddingVertical: 4, borderRadius: 999 },
  statusBadgeText: { color: colors.neutral900, ...textPresets.fs12_500 },
  productList: { marginTop: 12, gap: 10 },
  fallbackRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 10 },
  fallbackNameText: { flex: 1, color: colors.neutral500, fontSize: 13, fontWeight: "600" },
  fallbackPrice: { color: colors.neutral900, fontSize: 13, fontWeight: "600" },
  orderTotalRow: { marginTop: 12, paddingTop: 12, borderTopWidth: 1, borderTopColor: colors.borderLight, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  orderTotalLabel: { color: colors.neutral400, fontSize: 13, fontWeight: "500" },
  orderTotalValue: { color: colors.neutral900, ...textPresets.fs15_800 },
  orderActions: { marginTop: 12, flexDirection: "row", gap: 10 },
  detailButton: { flex: 1, borderRadius: 999, overflow: "hidden" },
  detailButtonText: { color: colors.neutral100, ...textPresets.fs14_500 },
}));
