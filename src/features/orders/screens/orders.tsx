import { OrderFilter } from "@app-types/index";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { Icon } from "@components/icon";
import { EmptyState } from "@components/empty-state";
import { useThemes } from "@hooks/use-theme";
import { FlashList, FlashListRef } from "@shopify/flash-list";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useEffect, useMemo, useRef } from "react";
import { useTabScrollToTop } from "@hooks/use-tab-scroll-to-top";
import { Pressable, Text, View } from "react-native";
import {
  OrdersProps,
  OrderStatCardData,
  OrderWithTikTok,
} from "../types/order";
import { OrderFilterBar } from "../components/order-filter";
import { OrderItem } from "../components/order-item";
import { OrderStatCard } from "../components/order-stat-card";

export const Orders = memo(({ orderManager }: OrdersProps) => {
  const {
    paidOrders,
    draftOrders,
    confirmedOrders,
    orders,
    filteredOrders,
    orderProductCount,
    setOrderFilter,
    orderFilter,
    reloadOrders,
    orderLoading,
    toggleDepositStatus,
    depositLoadingIds,
    deleteOrder,
  } = orderManager;

  const { colors } = useThemes();
  const { show, hide } = useBottomSheet();

  const listRef = useRef<FlashListRef<OrderWithTikTok>>(null);
  useTabScrollToTop("index", listRef, { isFlatList: true });

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
        bgColor: colors.successLight,
      },
      {
        filterKey: "paid",
        lottie: "customer",
        value: paidOrders,
        label: "Đã cọc",
        bgColor: colors.infoLight,
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
        bgColor: colors.surfaceAlt,
      },
    ],
    [confirmedOrders, paidOrders, unpaidOrders, draftOrders],
  );

  const handlePressCard = useCallback(
    (filterKey: OrderFilter) => {
      setOrderFilter((currentFilter) =>
        currentFilter === filterKey ? "all" : filterKey,
      );
    },
    [setOrderFilter],
  );

  const handlePressFilter = useCallback(() => {
    show({
      showDragIndicator: true,
      content: (
        <OrderFilterBar
          orderFilter={orderFilter}
          setOrderFilter={setOrderFilter}
          onClose={hide}
        />
      ),
    });
  }, [hide, orderFilter, setOrderFilter, show]);

  const activeFilterLabel = useMemo(
    () =>
      orderFilter !== "all"
        ? (cards.find((c) => c.filterKey === orderFilter)?.label ?? "Lọc đơn")
        : "Lọc đơn",
    [orderFilter, cards],
  );

  const keyExtractor = useCallback((item: OrderWithTikTok) => item.id, []);

  const listExtraData = useMemo(
    () => ({ depositLoadingIds, orderFilter }),
    [depositLoadingIds, orderFilter],
  );

  const renderItem = useCallback(
    ({ item }: { item: OrderWithTikTok }) => (
      <OrderItem
        item={item}
        depositLoading={depositLoadingIds.has(item.id)}
        onToggleDeposit={toggleDepositStatus}
        onRemove={deleteOrder}
      />
    ),
    [depositLoadingIds, toggleDepositStatus, deleteOrder],
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [orderFilter]);

  useEffect(() => {
    if (orderFilter !== "all" && orders.length > 0 && filteredOrders.length === 0) {
      setOrderFilter("all");
    }
  }, [filteredOrders.length, orderFilter, orders.length, setOrderFilter]);

  const listHeader = useMemo(
    () =>
      orders.length === 0 ? null : (
        <>
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
        </>
      ),
    [
      activeFilterLabel,
      cards,
      colors.neutral900,
      handlePressCard,
      handlePressFilter,
      orderFilter,
      orderProductCount,
      orders.length,
    ],
  );

  return (
    <View style={styles.root}>
      {/* START: FlashList làm list gốc để tránh nested VirtualizedList trong ScrollView bị mất item khi filter */}
      <FlashList
        ref={listRef}
        data={filteredOrders}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        extraData={listExtraData}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          orders.length === 0 ? (
            <EmptyState image="order" title="Chưa có đơn nào được tạo" />
          ) : null
        }
        // START: Pull to refresh gọi lại API lấy danh sách đơn hàng mới nhất
        refreshing={orderLoading}
        onRefresh={reloadOrders}
        // END: Pull to refresh gọi lại API lấy danh sách đơn hàng mới nhất
        contentContainerStyle={styles.container}
      />
      {/* END: FlashList làm list gốc để tránh nested VirtualizedList trong ScrollView bị mất item khi filter */}
    </View>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
  root: {
    flex: 1,
  },
  container: {
    paddingTop: 16,
    paddingBottom: 8,
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
