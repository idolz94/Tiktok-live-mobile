import { Order } from "@app-types/index";
import { memo, useCallback } from "react";
import { Text, View } from "react-native";
import { OrderItem } from "./order-item";
import { FlashList } from "@shopify/flash-list";
import { createStyles } from "@utils/createStyles";

export interface ListOrdersProps {
  orders: Order[];
}

export const ListOrders = memo(({ orders }: ListOrdersProps) => {
  const keyExtractor = useCallback((item: Order) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: Order }) => <OrderItem item={item} />,
    [],
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

const styles = createStyles(({ colors, textPresets }) => ({
  listContent: {
    // paddingHorizontal: 16,
  },
}));
