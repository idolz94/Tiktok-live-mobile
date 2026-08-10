import { OrderFilter } from "@app-types/index";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { useToast } from "@components/toast";
import { Icon } from "@components/icon";
import { EmptyState } from "@components/empty-state";
import { Skeleton } from "@components/skeleton";
import { HairlineWidth } from "@themes/index";
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

function StatCardSkeleton() {
  return (
    <View style={skeletonStyles.card}>
      <Skeleton width={32} height={32} borderRadius={8} />
      <View style={skeletonStyles.cardText}>
        <Skeleton width={40} height={22} borderRadius={6} />
        <Skeleton width={60} height={14} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
    </View>
  );
}

function OrderRowSkeleton() {
  return (
    <View style={skeletonStyles.row}>
      <Skeleton width={42} height={42} borderRadius={21} />
      <View style={skeletonStyles.rowBody}>
        <Skeleton width="60%" height={15} borderRadius={4} />
        <Skeleton width="40%" height={13} borderRadius={4} style={{ marginTop: 6 }} />
        <Skeleton width="80%" height={13} borderRadius={4} style={{ marginTop: 4 }} />
      </View>
      <Skeleton width={64} height={28} borderRadius={8} />
    </View>
  );
}

function OrdersSkeleton() {
  return (
    <View style={skeletonStyles.root}>
      <Skeleton width={160} height={24} borderRadius={6} style={{ marginBottom: 12 }} />
      <View style={skeletonStyles.grid}>
        <View style={skeletonStyles.row2}>
          <StatCardSkeleton />
          <StatCardSkeleton />
        </View>
        <View style={skeletonStyles.row2}>
          <StatCardSkeleton />
          <StatCardSkeleton />
        </View>
      </View>
      <View style={skeletonStyles.footerRow}>
        <Skeleton width={100} height={20} borderRadius={4} />
        <Skeleton width={80} height={20} borderRadius={4} />
      </View>
      {[0, 1, 2, 3, 4].map((i) => (
        <OrderRowSkeleton key={i} />
      ))}
    </View>
  );
}

const skeletonStyles = createStyles(({ colors }) => ({
  root: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  card: {
    flex: 1,
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    columnGap: 12,
    backgroundColor: colors.surfaceAlt,
    borderWidth: HairlineWidth * 3,
    borderColor: colors.border10,
  },
  cardText: {
    flex: 1,
  },
  grid: {
    rowGap: 8,
  },
  row2: {
    flexDirection: "row",
    columnGap: 8,
  },
  footerRow: {
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
    paddingVertical: 14,
    borderBottomWidth: HairlineWidth,
    borderBottomColor: colors.border10,
  },
  rowBody: {
    flex: 1,
  },
}));

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
  const toast = useToast();

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
        onRemove={async (id) => {
          await deleteOrder(id);
          toast.success({ title: "Đã xoá đơn hàng" });
        }}
      />
    ),
    [depositLoadingIds, toggleDepositStatus, deleteOrder, toast],
  );

  useEffect(() => {
    listRef.current?.scrollToOffset({ offset: 0, animated: false });
  }, [orderFilter]);

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
      {orderLoading && orders.length === 0 ? (
        <OrdersSkeleton />
      ) : (
        <FlashList
          ref={listRef}
          data={filteredOrders}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          extraData={listExtraData}
          ListHeaderComponent={listHeader}
          ListEmptyComponent={
            !orderLoading && filteredOrders.length === 0 ? (
              <EmptyState image="order" title="Chưa có đơn nào được tạo" />
            ) : null
          }
          refreshing={orderLoading}
          onRefresh={reloadOrders}
          contentContainerStyle={styles.container}
        />
      )}
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
