import { View, Text, ScrollView, Pressable } from "react-native";
import React, { memo, useCallback, useMemo } from "react";
import { createStyles } from "@utils/createStyles";
import { Image } from "@components/image";
import { images } from "@assets/images";
import { HairlineWidth } from "@themes/index";
import { OrderManager } from "@modules/orders/hooks/use-order-manager";
import { Icon } from "@components/icon";
import { useThemes } from "@hooks/use-theme";
import { OrderFilter } from "@app-types/index";

type OrderStatCardData = {
  filterKey: OrderFilter;
  icon: keyof typeof images;
  value: number;
  label: string;
};

export type OrdersProps = {
  orderManager: OrderManager;
};

const OrderStatCard = memo(
  ({
    icon,
    value,
    label,
    filterKey,
    isActive,
    onPressCard,
  }: OrderStatCardData & {
    isActive: boolean;
    onPressCard: (filterKey: OrderFilter) => void;
  }) => {
    const handlePress = useCallback(() => {
      onPressCard(filterKey);
    }, [onPressCard, filterKey]);

    return (
      <Pressable
        style={[styles.infoCard, isActive && styles.infoCardActive]}
        onPress={handlePress}
      >
        <Image source={images[icon]} style={styles.infoCardIcon} />
        <View style={styles.infoCardTextGroup}>
          <Text style={styles.valueCount}>{value}</Text>
          <Text style={styles.txtCardFlag}>{label}</Text>
        </View>
      </Pressable>
    );
  },
);

const OrdersSectionHeader = memo(() => (
  <Text style={styles.txtCurrentLive}>Phiên live hiện tại</Text>
));

export const Orders = memo(({ orderManager }: OrdersProps) => {
  const { colors } = useThemes();

  const {
    paidOrders,
    draftOrders,
    confirmedOrders,
    orders,
    orderProductCount,
    setOrderFilter,
    orderFilter,
  } = orderManager;

  const unpaidOrders = useMemo(
    () =>
      orders?.filter(
        (o) => o.depositStatus !== "paid" && o.depositStatus !== "deposited",
      ).length ?? 0,
    [orders],
  );

  const cards: OrderStatCardData[] = useMemo(
    () => [
      {
        filterKey: "confirmed",
        icon: "order_item",
        value: confirmedOrders,
        label: "Đã chốt",
      },
      { filterKey: "paid", icon: "money", value: paidOrders, label: "Đã cọc" },
      {
        filterKey: "unpaid",
        icon: "no_money",
        value: unpaidOrders,
        label: "Chưa cọc",
      },
      {
        filterKey: "draft",
        icon: "calendar",
        value: draftOrders,
        label: "Đơn nháp",
      },
    ],
    [confirmedOrders, paidOrders, unpaidOrders, draftOrders],
  );

  const handlePressCard = useCallback(
    (filterKey: OrderFilter) => {
      setOrderFilter(orderFilter === filterKey ? "all" : filterKey);
    },
    [orderFilter, setOrderFilter],
  );

  const handlePressFilter = useCallback(() => {
    // TODO: open filter drawer
  }, []);

  const activeFilterLabel = useMemo(
    () =>
      orderFilter !== "all"
        ? (cards.find((c) => c.filterKey === orderFilter)?.label ?? "Lọc đơn")
        : "Lọc đơn",
    [orderFilter, cards],
  );

  return (
    <ScrollView style={styles.container}>
      <OrdersSectionHeader />
      <View style={styles.grid}>
        {Array.from({ length: Math.ceil(cards.length / 2) }, (_, row) => (
          <View key={row} style={styles.columnWrapper}>
            {cards.slice(row * 2, row * 2 + 2).map((card) => (
              <OrderStatCard
                key={card.filterKey}
                {...card}
                isActive={orderFilter === card.filterKey}
                onPressCard={handlePressCard}
              />
            ))}
          </View>
        ))}
      </View>
      <View style={styles.footerRow}>
        <Text style={styles.txtCount}>{orderProductCount} sản phẩm</Text>
        <Pressable style={styles.filterButton} onPress={handlePressFilter}>
          <Icon name="filter" size={24} tintColor={colors.neutral900} />
          <Text>{activeFilterLabel}</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    paddingTop: 16,
    paddingBottom: 48 + 8,
    paddingHorizontal: 16,
  },
  grid: {
    rowGap: 8,
    marginTop: 8,
  },
  columnWrapper: {
    flexDirection: "row",
    columnGap: 8,
  },
  txtCurrentLive: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
  },
  infoCard: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderRadius: 12,
    padding: 16,
    columnGap: 12,
    flexDirection: "row",
    alignItems: "flex-start",
    borderWidth: HairlineWidth * 3,
    borderColor: colors.border10,
    overflow: "hidden",
  },
  infoCardActive: {
    backgroundColor: colors.neutral50,
  },
  infoCardIcon: {
    width: 32,
    height: 32,
  },
  infoCardTextGroup: {
    rowGap: 4,
  },
  valueCount: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
  },
  txtCardFlag: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  footerRow: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  txtCount: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
  },
}));
