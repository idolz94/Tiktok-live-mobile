import { OrderFilter } from "@app-types/index";
import { Lottie } from "@assets/lotties";
import { Icon } from "@components/icon";
import { useThemes } from "@hooks/use-theme";
import { HairlineWidth } from "@themes/index";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { OrdersProps, OrderStatCardData } from "../types/order";
import { ListOrders } from "./list-orders";

const OrderStatCard = memo(
  ({
    lottie,
    value,
    label,
    filterKey,
    isActive,
    bgColor,
    onPressCard,
  }: OrderStatCardData & {
    isActive: boolean;
    onPressCard: (filterKey: OrderFilter) => void;
  }) => {
    const { colors } = useThemes();
    const handlePress = useCallback(() => {
      onPressCard(filterKey);
    }, [onPressCard, filterKey]);

    return (
      <Pressable
        style={[
          styles.infoCard,
          {
            backgroundColor: bgColor,
            borderColor: isActive ? colors.primary : "transparent",
            borderWidth: HairlineWidth * 2,
          },
        ]}
        onPress={handlePress}
      >
        <Lottie name={lottie} style={styles.infoCardIcon} focused={isActive} />
        <View style={styles.infoCardTextGroup}>
          <Text style={styles.valueCount}>{value}</Text>
          <Text style={styles.txtCardFlag}>{label}</Text>
        </View>
      </Pressable>
    );
  },
);

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
        lottie: "chart",
        value: confirmedOrders,
        label: "Đã chốt",
        bgColor: colors.successPastel,
      },
      {
        filterKey: "paid",
        lottie: "customer",
        value: paidOrders,
        label: "Đã cọc",
        bgColor: colors.info200,
      },
      {
        filterKey: "unpaid",
        lottie: "truck",
        value: unpaidOrders,
        label: "Chưa cọc",
        bgColor: colors.pink200,
      },
      {
        filterKey: "draft",
        lottie: "time",
        value: draftOrders,
        label: "Đơn nháp",
        bgColor: colors.surfaceGray,
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
      <Text style={styles.txtCurrentLive}>Phiên live hiện tại</Text>
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
      <ListOrders orders={orders} />
    </ScrollView>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    paddingTop: 16,
    paddingBottom: 48 + 8,
  },
  grid: {
    rowGap: 8,
    marginTop: 8,
    paddingHorizontal: 16,
  },
  columnWrapper: {
    flexDirection: "row",
    columnGap: 8,
  },
  txtCurrentLive: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
    paddingHorizontal: 16,
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
    padding: 16,
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
