import { Order } from "@app-types/index";
import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { Icon } from "@components/icon";
import { Separator } from "@components/separator";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback } from "react";
import { Text, View } from "react-native";
import { formatMoneyFromK, getOrderTotal, statusLabel } from "../utils/order";

interface OrderItemProps {
  item: Order;
}

function createDisplayCode(orderCode: string) {
  const numbers = orderCode.replace(/\D/g, "");
  return (numbers || orderCode).slice(-6).padStart(6, "0");
}

export const OrderItem = memo(({ item }: OrderItemProps) => {
  const products = item.products?.length ? item.products : [];
  const total = item.subtotalAmount || getOrderTotal(products);
  const displayName = item.customerName || item.username || "Khách live";

  const onOpenCustomer = useCallback(() => {}, []);
  const onPrintOrder = useCallback(() => {}, []);
  const onOpenMoreMenu = useCallback(() => {}, []);
  const onOpenNoteEditor = useCallback(() => {}, []);
  const onDeleteOrder = useCallback(() => {}, []);
  const onToggleDeposit = useCallback(() => {}, []);
  const onOpenOrderOverview = useCallback(() => {}, []);
  const onSaveOrderChanges = useCallback(() => {}, []);
  const onOpenTikTokProfile = useCallback(() => {}, []);
  const onUpdateOrder = useCallback(() => {}, []);

  return (
    <View style={styles.container}>
      <View style={styles.top}>
        <View style={styles.header}>
          <Avatar
            uri={item.avatar || item.avatarUrl}
            username={displayName}
            size={40}
          />
          <View style={styles.info}>
            <Text>{displayName}</Text>
            <Text>{`OrderID: ${createDisplayCode(item.orderCode || item.id)}`}</Text>
          </View>
          <View style={styles.actions}>
            <Icon name="more" size={24} tintColor="neutral900" />
            <Icon name="more" size={24} tintColor="neutral900" />
            <Icon name="more" size={24} tintColor="neutral900" />
          </View>
        </View>
        <View style={styles.tags}>
          <Text>VIP</Text>
          <Text>Khách lẻ</Text>
        </View>
      </View>

      <View style={styles.productRow}>
        <View style={styles.productInfo}>
          <View style={styles.productNameWrap}>
            <Text numberOfLines={2}>
              {item.productName || item.comment || "Sản phẩm"}
            </Text>
          </View>
          <Text>{new Date(item.createdAt).toLocaleTimeString()}</Text>
        </View>
        <Text>{`${formatMoneyFromK(Number(item.price || 0) * Number(item.quantity || 1))} x ${item.quantity}`}</Text>
      </View>

      <Separator type="horizontal" size={1} style={styles.separator} />

      <View style={styles.subtotalRow}>
        <View style={styles.subtotalLabels}>
          <Text>Tạm tính</Text>
          <Text>Thu tiền hộ (COD)</Text>
        </View>
        <View style={styles.subtotalValues}>
          <Text>{formatMoneyFromK(total)}</Text>
          <Text>{item.discountAmount}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title={statusLabel(item.status)}
          loading={false}
          onPress={onToggleDeposit}
          gradientType="gra_primary"
        />
        <Button
          title="Lưu thay đổi"
          loading={false}
          onPress={onOpenOrderOverview}
          gradientType="gra_primary"
        />
      </View>
    </View>
  );
});

const styles = createStyles(({ colors }) => ({
  container: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: colors.neutral100,
    marginBottom: 8,
  },
  top: {
    rowGap: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 16,
    justifyContent: "space-between",
  },
  info: {
    justifyContent: "center",
    alignItems: "flex-start",
    flex: 1,
  },
  actions: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
  tags: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    paddingLeft: 72,
  },
  productRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 12,
  },
  productInfo: {
    flex: 1,
    rowGap: 2,
  },
  productNameWrap: {
    flexShrink: 1,
  },
  separator: {
    marginVertical: 12,
  },
  subtotalRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  subtotalLabels: {
    rowGap: 4,
  },
  subtotalValues: {
    rowGap: 4,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 12,
    marginTop: 16,
  },
}));
