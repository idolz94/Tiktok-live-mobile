import { Order } from "@app-types/index";
import { memo, useCallback } from "react";
import { View } from "react-native";
import { OrderItem } from "./order-item";
import { FlashList } from "@shopify/flash-list";
import { createStyles } from "@utils/createStyles";

export interface ListOrdersProps {
  orders: Order[];
  onToggleDeposit?: (orderId: string) => void;
  depositLoadingIds?: Set<string>;
  onOpenOverview?: (orderId: string) => void;
}

export const ListOrders = memo(({ orders, onToggleDeposit, depositLoadingIds, onOpenOverview }: ListOrdersProps) => {
  const keyExtractor = useCallback((item: Order) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Order }) => (
      <OrderItem
        item={item}
        onToggleDeposit={onToggleDeposit}
        depositLoading={depositLoadingIds?.has(item.id)}
        onOpenOverview={onOpenOverview}
      />
    ),
    [onToggleDeposit, depositLoadingIds, onOpenOverview],
  );

  return (
    <View>
      <FlashList
        data={orders}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

const styles = createStyles(() => ({
  listContent: {},
}));

