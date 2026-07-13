import { Ionicons } from "@expo/vector-icons";
import { OrderFilter, OrderWithTikTok } from "@app-types/index";
import { Icon } from "@components/icon";
import { LinearGradient } from "@components/linear-gradient";
import { EmptyState } from "@components/empty-state";
import { OrderFilterBar } from "@features/orders/components/order-filter";
import { OrderItem } from "@features/orders/components/order-item";
import { OrderStatCard } from "@features/orders/components/order-stat-card";
import { OrderStatCardData } from "@features/orders/types/order";
import { useLiveSessionDetail } from "@features/tiktok-live/hooks/use-live-session-detail";
import { formatDuration, removeAt } from "@features/tiktok-live/utils/comment";
import { useThemes } from "@hooks/use-theme";
import { HairlineWidth } from "@themes/index";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { memo, useCallback, useMemo } from "react";
import { FlashList } from "@shopify/flash-list";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomSheet } from "@components/bottom-sheet/hook";

function formatTimeRange(startedAt: string, endedAt: string | null) {
  const fmt = (d: string) =>
    new Date(d).toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  if (!endedAt) return `Phiên ${fmt(startedAt)}`;
  return `Phiên ${fmt(startedAt)} - ${fmt(endedAt)}`;
}

interface Props {
  sessionId: string;
}

export const LiveSessionDetailScreen = memo(({ sessionId }: Props) => {
  const { top } = useSafeAreaInsets();
  const { colors } = useThemes();
  const { show, hide } = useBottomSheet();

  const {
    session,
    filteredOrders,
    orderFilter,
    setOrderFilter,
    toggleFilter,
    confirmedOrders,
    paidOrders,
    unpaidOrders,
    draftOrders,
    productCount,
  } = useLiveSessionDetail(sessionId);

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
    [confirmedOrders, paidOrders, unpaidOrders, draftOrders, colors],
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

  const activeFilterLabel = useMemo(() => {
    if (orderFilter === "all") return "Lọc đơn";
    const found = cards.find((c) => c.filterKey === orderFilter);
    return found?.label ?? "Lọc đơn";
  }, [orderFilter, cards]);

  const keyExtractor = useCallback((item: OrderWithTikTok) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: OrderWithTikTok }) => (
      // ponytail: no onRemove — history is readonly
      <OrderItem
        item={item}
        depositLoading={false}
        onToggleDeposit={() => undefined}
      />
    ),
    [],
  );

  const listHeader = useMemo(
    () => (
      <>
        {/* Header */}
        <View style={[styles.header, { paddingTop: top + 12 }]}>
          <Pressable onPress={() => router.back()} style={styles.backBtn} hitSlop={8}>
            <Ionicons name="chevron-back" size={22} color={colors.neutral900} />
          </Pressable>
          <View style={styles.headerTitles}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {session
                ? formatTimeRange(session.startedAt, session.endedAt)
                : "Chi tiết phiên"}
            </Text>
            {session && (
              <View style={styles.headerMeta}>
                <Icon name="group_user" size={12} tintColor="neutral400" />
                <Text style={styles.headerMetaText}>
                  {removeAt(session.username)}
                </Text>
                <View style={styles.metaDivider} />
                <Icon name="clock" size={12} tintColor="neutral400" />
                <Text style={styles.headerMetaText}>
                  {formatDuration(Number(session.durationSeconds || 0))}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Stat cards 2x2 */}
        <View style={styles.grid}>
          {Array.from({ length: Math.ceil(cards.length / 2) }, (_, row) => (
            <View key={row} style={styles.columnWrapper}>
              {cards.slice(row * 2, row * 2 + 2).map((card) => (
                <OrderStatCard
                  key={card.filterKey}
                  {...card}
                  isActive={orderFilter === card.filterKey}
                  onPressCard={toggleFilter as (key: OrderFilter) => void}
                />
              ))}
            </View>
          ))}
        </View>

        {/* Order list header */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.txtProductCount}>{productCount} sản phẩm</Text>
          <Pressable style={styles.filterButton} onPress={handlePressFilter}>
            <Icon name="filter" size={24} tintColor={colors.neutral900} />
            <Text style={styles.filterLabel}>{activeFilterLabel}</Text>
          </Pressable>
        </View>
      </>
    ),
    [
      session,
      top,
      cards,
      orderFilter,
      toggleFilter,
      productCount,
      activeFilterLabel,
      handlePressFilter,
      colors.neutral900,
    ],
  );

  if (!session) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Không tìm thấy phiên LIVE</Text>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>Quay lại</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.headerBg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <FlashList
        data={filteredOrders}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={
          <EmptyState image="order" title="Chưa có đơn nào được tạo" />
        }
        contentContainerStyle={styles.listContent}
      />
    </View>
  );
});

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  root: {
    flex: 1,
  },
  headerBg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 16,
    columnGap: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.neutral100,
    alignItems: "center",
    justifyContent: "center",
    ...shadows.sd1,
  },
  headerTitles: {
    flex: 1,
    rowGap: 4,
  },
  headerTitle: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
  },
  headerMeta: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
  },
  headerMetaText: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  metaDivider: {
    width: 1,
    height: 10,
    backgroundColor: colors.neutral400,
    marginHorizontal: 2,
  },
  grid: {
    rowGap: 8,
    marginTop: 16,
    paddingHorizontal: 16,
  },
  columnWrapper: {
    flexDirection: "row",
    columnGap: 8,
  },
  listHeaderRow: {
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  txtProductCount: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
  },
  filterButton: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
  },
  filterLabel: {
    color: colors.neutral500,
    ...textPresets.fs14_400,
  },
  listContent: {
    paddingBottom: 24,
  },
  notFound: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    rowGap: 16,
  },
  notFoundText: {
    color: colors.neutral500,
    ...textPresets.fs16_500,
  },
  backButton: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 99,
    backgroundColor: colors.primary,
  },
  backButtonText: {
    color: colors.neutral100,
    ...textPresets.fs14_500,
  },
}));
