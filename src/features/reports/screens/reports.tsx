import { useBottomSheet } from "@components/bottom-sheet/hook";
import {
  CollapsibleHeader,
  useCollapsibleHeaderHeight,
} from "@components/header/collapsible-header";
import { Icon } from "@components/icon";
import { LinearGradient } from "@components/linear-gradient";
import { Skeleton } from "@components/skeleton";
import { Ionicons } from "@expo/vector-icons";
import type { StatSectionData } from "@features/orders/service/api";
import { DatePickerSheet } from "@features/reports/components/date-picker-modal";
import { FilterSheet } from "@features/reports/components/filter-sheet";
import { useReports } from "@features/reports/hooks/use-reports";
import {
  REPORT_PERIODS,
  type ReportFilter,
  type ReportPeriod,
} from "@features/reports/types";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { useCallback, useRef } from "react";
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { BarChart as GiftedBarChart } from "react-native-gifted-charts";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";

function splitCompact(value: number): { num: string; unit: string } {
  const n = Math.round(value || 0);
  if (n >= 1_000_000_000)
    return { num: `${+(n / 1_000_000_000).toFixed(1)}`, unit: "tỉ" };
  if (n >= 1_000_000)
    return { num: `${+(n / 1_000_000).toFixed(1)}`, unit: "tr" };
  return { num: n.toLocaleString("vi-VN"), unit: "đ" };
}

function formatMoneyYLabel(label: string): string {
  const v = Number(label);
  if (!Number.isFinite(v)) return label;
  return `${+(v / 1_000_000).toFixed(1)}`;
}

function pctValue(curr: number, prev: number): number {
  if (prev === 0) return curr > 0 ? 100 : 0;
  return Math.round(((curr - prev) / prev) * 100);
}

function pctLabel(pct: number): string {
  return (pct >= 0 ? "+" : "") + pct + "%";
}

function fmtShort(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function dateLabel(period: ReportPeriod, filter: ReportFilter): string {
  if (period === "custom") {
    if (filter.customFrom && filter.customTo) {
      return `${fmtShort(filter.customFrom)} – ${fmtShort(filter.customTo)}`;
    }
    return "Tuỳ chỉnh";
  }
  const now = new Date();
  const from = new Date(now);
  from.setHours(0, 0, 0, 0);
  const to = new Date(now);
  to.setHours(0, 0, 0, 0);
  if (period === "7d") from.setDate(from.getDate() - 6);
  else if (period === "1m") from.setDate(from.getDate() - 29);
  else if (period === "6m") {
    from.setMonth(from.getMonth() - 5);
    from.setDate(1);
  } else if (period === "1y") {
    from.setFullYear(from.getFullYear() - 1);
    from.setMonth(0);
    from.setDate(1);
  }
  return period === "1d" ? "Hôm nay" : `${fmtShort(from)} - ${fmtShort(to)}`;
}

// Di chuyển từ src/app/(tabs)/reports.tsx sang feature theo cấu trúc route-mỏng/feature-dày
// (PROJECT_GUIDE mục 4 & 8): route giờ chỉ là wrapper mỏng render screen này qua named export.
export function ReportsScreen() {
  const { colors } = useThemes();
  const scrollY = useSharedValue(0);
  const headerHeight = useCollapsibleHeaderHeight();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const { show, hide, replace } = useBottomSheet();
  const {
    period,
    setPeriod,
    filter,
    setFilter,
    stats,
    loading,
    refreshing,
    error,
    refresh,
    chartData,
  } = useReports();

  const filterSheetId = useRef<string | null>(null);
  const datePickerSheetId = useRef<string | null>(null);

  const openDatePicker = useCallback(() => {
    datePickerSheetId.current = show({
      content: (
        <DatePickerSheet
          initialFrom={filter.customFrom}
          initialTo={filter.customTo}
          onConfirm={(from, to) => {
            setFilter((prev) => ({ ...prev, customFrom: from, customTo: to }));
            setPeriod("custom");
            hide(datePickerSheetId.current ?? undefined);
          }}
          onClose={() => hide(datePickerSheetId.current ?? undefined)}
        />
      ),
      enablePanDownToClose: true,
      showDragIndicator: false,
    });
  }, [show, hide, filter.customFrom, filter.customTo, setFilter, setPeriod]);

  const openFilter = useCallback(() => {
    filterSheetId.current = show({
      content: (
        <FilterSheet
          filter={filter}
          period={period}
          onApply={(f, preset) => {
            if (preset) {
              setPeriod(preset);
              setFilter({ ...f, customFrom: null, customTo: null });
            } else {
              setFilter(f);
            }
            hide(filterSheetId.current ?? undefined);
          }}
          onCustomDate={() => {
            replace(
              {
                content: (
                  <DatePickerSheet
                    initialFrom={filter.customFrom}
                    initialTo={filter.customTo}
                    onConfirm={(from, to) => {
                      setFilter((prev) => ({
                        ...prev,
                        customFrom: from,
                        customTo: to,
                      }));
                      setPeriod("custom");
                      hide(filterSheetId.current ?? undefined);
                    }}
                    onClose={() => hide(filterSheetId.current ?? undefined)}
                  />
                ),
                enablePanDownToClose: true,
                showDragIndicator: false,
              },
              filterSheetId.current ?? undefined,
            );
          }}
        />
      ),
      snapPoints: ["75%"],
      enablePanDownToClose: true,
      showDragIndicator: false,
    });
  }, [show, hide, replace, filter, period, setFilter, setPeriod]);

  const activeFilter = filter.depositStatus !== null || filter.status !== null;

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <CollapsibleHeader
        title="Báo cáo thống kê"
        scrollY={scrollY}
        rightContent={
          <Pressable
            onPress={openFilter}
            hitSlop={8}
            style={[
              styles.filterBtn,
              {
                backgroundColor: activeFilter
                  ? colors.primaryLight
                  : colors.neutral50,
                borderColor: activeFilter ? colors.primary : colors.border10,
              },
            ]}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={activeFilter ? colors.primary : colors.neutral400}
            />
            {activeFilter && (
              <View
                style={[styles.filterDot, { backgroundColor: colors.primary }]}
              />
            )}
          </Pressable>
        }
      />
      <Animated.ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingTop: headerHeight }}
        showsVerticalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refresh}
            tintColor={colors.primary}
          />
        }
      >
        {/* Period tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsRow}
        >
          {REPORT_PERIODS.map((p) => (
            <Pressable
              key={p.id}
              onPress={() => {
                if (p.id === "custom") {
                  openDatePicker();
                } else {
                  setPeriod(p.id);
                }
              }}
              style={[styles.tab, period === p.id && styles.tabActive]}
            >
              <Text
                style={[
                  styles.tabText,
                  period === p.id && styles.tabTextActive,
                ]}
              >
                {p.id === "custom" && filter.customFrom && filter.customTo
                  ? `${fmtShort(filter.customFrom)}–${fmtShort(filter.customTo)}`
                  : p.label}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {error ? (
          <View style={styles.center}>
            <Text style={styles.errorText}>{error}</Text>
            <Pressable onPress={refresh} style={styles.retryBtn}>
              <Text style={styles.retryBtnText}>Thử lại</Text>
            </Pressable>
          </View>
        ) : loading || !stats ? (
          <ReportsSkeleton />
        ) : (
          <>
            {/* Summary card */}
            <View style={styles.cardSection}>
              <View style={styles.summaryCard}>
                <View style={styles.summaryHeader}>
                  <Text style={styles.summaryDate}>
                    {dateLabel(period, filter)}
                  </Text>
                  <Pressable onPress={refresh} hitSlop={8}>
                    <Icon name="print" size={18} tintColor="neutral400" />
                  </Pressable>
                </View>

                <View style={styles.summaryRevRow}>
                  <View style={[styles.dot, styles.dotBlue]} />
                  <View style={styles.summaryRevInfo}>
                    <Text style={styles.summarySubLabel}>Tổng doanh thu</Text>
                    <View style={styles.summaryValueRow}>
                      <View style={styles.summaryAmountRow}>
                        <Text style={styles.summaryAmount}>
                          {stats.revenue.total.toLocaleString("vi-VN")}
                        </Text>
                        <Text style={styles.summaryUnit}>₫</Text>
                      </View>
                      <PctBadge
                        curr={stats.revenue.total}
                        prev={stats.prev.revenue}
                      />
                    </View>
                  </View>
                </View>

                <View style={styles.summaryDivider} />

                <View style={styles.summaryBottomRow}>
                  <View
                    style={[styles.summarySubCol, styles.summarySubColBorder]}
                  >
                    <View style={[styles.dot, styles.dotGreen]} />
                    <View style={styles.summaryRevInfo}>
                      <Text style={styles.summarySubLabel}>Sản phẩm</Text>
                      <View style={styles.summaryValueRow}>
                        <Text style={styles.summarySubAmount}>
                          {stats.products.total}
                        </Text>
                        <PctBadge
                          curr={stats.products.total}
                          prev={stats.prev.products}
                        />
                      </View>
                    </View>
                  </View>
                  <View style={styles.summarySubCol}>
                    <View style={[styles.dot, styles.dotOrange]} />
                    <View style={styles.summaryRevInfo}>
                      <Text style={styles.summarySubLabel}>Đơn hàng</Text>
                      <View style={styles.summaryValueRow}>
                        <Text style={styles.summarySubAmount}>
                          {stats.orders.total}
                        </Text>
                        <PctBadge
                          curr={stats.orders.total}
                          prev={stats.prev.orders}
                        />
                      </View>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {/* Revenue section */}
            <Section
              title="Phân tích doanh thu"
              subtitle="Đơn vị tính: triệu đồng"
              stats={stats.revenue}
              chart={chartData.revenue}
              color="#468ADF"
              isMoney
            />
            <View style={styles.sectionDivider} />

            {/* Products section */}
            <Section
              title="Phân tích sản phẩm"
              stats={stats.products}
              chart={chartData.products}
              color="#2CA87B"
            />
            <View style={styles.sectionDivider} />

            {/* Orders section */}
            <Section
              title="Phân tích đơn hàng"
              stats={stats.orders}
              chart={chartData.orders}
              color="#FFC86A"
            />
            <View style={styles.sectionDivider} />

            {/* Customers section */}
            <Section
              title="Phân tích khách hàng"
              stats={stats.customers}
              chart={chartData.customers}
              color="#FF4242"
            />
            <View style={{ height: 32 }} />
          </>
        )}
      </Animated.ScrollView>

      {refreshing ? (
        <View style={styles.refreshIndicator} pointerEvents="none">
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : null}
    </View>
  );
}

function PctBadge({ curr, prev }: { curr: number; prev: number }) {
  const { colors } = useThemes();
  const pct = pctValue(curr, prev);
  const positive = pct >= 0;
  return (
    <View
      style={[
        styles.pctBadge,
        {
          backgroundColor: positive
            ? colors.successLight
            : "rgba(255,232,232,1)",
        },
      ]}
    >
      <Text
        style={[
          styles.pctBadgeText,
          { color: positive ? colors.success : colors.error },
        ]}
      >
        {pctLabel(pct)}
      </Text>
    </View>
  );
}

function Section({
  title,
  subtitle,
  stats,
  chart,
  color,
  isMoney = false,
}: {
  title: string;
  subtitle?: string;
  stats: StatSectionData;
  chart: { date: string; value: number; label: string }[];
  color: string;
  isMoney?: boolean;
}) {
  const { colors } = useThemes();

  const barData = chart.map((d) => ({
    value: d.value,
    label: d.label,
    frontColor: color,
  }));

  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.neutral400}
          />
        </View>
        {/* <View style={[styles.switcher, { backgroundColor: colors.neutral50 }]}>
          <View
            style={[
              styles.switcherBtn,
              styles.switcherBtnActive,
              { backgroundColor: colors.neutral100 },
            ]}
          >
            <Icon name="chart_pie" size={16} tintColor="neutral900" />
          </View>
          <View style={styles.switcherBtn}>
            <Icon name="more" size={16} tintColor="neutral400" />
          </View>
        </View> */}
      </View>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}

      {/* Bar chart via gifted-charts */}
      <GiftedBarChart
        data={barData}
        barWidth={chart.length <= 7 ? 28 : 18}
        spacing={chart.length <= 7 ? 12 : 6}
        roundedTop
        // roundedBottom
        hideRules={false}
        rulesColor={colors.neutral50}
        rulesType="solid"
        noOfSections={3}
        maxValue={Math.max(...chart.map((d) => d.value), 1)}
        yAxisTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        xAxisLabelTextStyle={{ color: colors.textMuted, fontSize: 10 }}
        formatYLabel={isMoney ? formatMoneyYLabel : undefined}
        yAxisColor="transparent"
        xAxisColor={colors.border10}
        hideYAxisText={false}
        isAnimated
        width={undefined}
        height={148}
        barBorderRadius={3}
      />

      {/* Metric cards */}
      <View style={styles.metricRow}>
        <MetricCard label="Trung bình" value={stats.avg} isMoney={isMoney} />
        <MetricCard label="Cao nhất" value={stats.max} isMoney={isMoney} />
      </View>
    </View>
  );
}

function ReportsSkeleton() {
  const { colors } = useThemes();
  return (
    <>
      {/* Summary card skeleton */}
      <View style={styles.cardSection}>
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Skeleton width={120} height={16} borderRadius={4} />
            <Icon name="print" size={18} tintColor="neutral400" />
          </View>

          <View style={styles.summaryRevRow}>
            <View style={[styles.dot, styles.dotBlue]} />
            <View style={styles.summaryRevInfo}>
              <Text style={styles.summarySubLabel}>Tổng doanh thu</Text>
              <View style={styles.summaryValueRow}>
                <View style={styles.summaryAmountRow}>
                  <Skeleton
                    width={140}
                    height={28}
                    borderRadius={6}
                    style={{ marginTop: 4 }}
                  />
                </View>
                <Skeleton
                  width={50}
                  height={20}
                  borderRadius={4}
                  style={{ marginLeft: 8 }}
                />
              </View>
            </View>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryBottomRow}>
            <View style={[styles.summarySubCol, styles.summarySubColBorder]}>
              <View style={[styles.dot, styles.dotGreen]} />
              <View style={styles.summaryRevInfo}>
                <Text style={styles.summarySubLabel}>Sản phẩm</Text>
                <View style={styles.summaryValueRow}>
                  <Skeleton
                    width={60}
                    height={20}
                    borderRadius={4}
                    style={{ marginTop: 4 }}
                  />
                  <Skeleton
                    width={45}
                    height={16}
                    borderRadius={4}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </View>
            </View>
            <View style={styles.summarySubCol}>
              <View style={[styles.dot, styles.dotOrange]} />
              <View style={styles.summaryRevInfo}>
                <Text style={styles.summarySubLabel}>Đơn hàng</Text>
                <View style={styles.summaryValueRow}>
                  <Skeleton
                    width={60}
                    height={20}
                    borderRadius={4}
                    style={{ marginTop: 4 }}
                  />
                  <Skeleton
                    width={45}
                    height={16}
                    borderRadius={4}
                    style={{ marginLeft: 8 }}
                  />
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>

      <SectionSkeleton
        title="Phân tích doanh thu"
        subtitle="Đơn vị tính: triệu đồng"
      />
      <View style={styles.sectionDivider} />
      <SectionSkeleton title="Phân tích sản phẩm" />
      <View style={styles.sectionDivider} />
      <SectionSkeleton title="Phân tích đơn hàng" />
      <View style={styles.sectionDivider} />
      <SectionSkeleton title="Phân tích khách hàng" />
      <View style={{ height: 32 }} />
    </>
  );
}

function SectionSkeleton({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const { colors } = useThemes();
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <View style={styles.sectionTitleWrap}>
          <Text style={styles.sectionTitle}>{title}</Text>
          <Ionicons
            name="information-circle-outline"
            size={18}
            color={colors.neutral400}
          />
        </View>
        <View style={[styles.switcher, { backgroundColor: colors.neutral50 }]}>
          <View
            style={[
              styles.switcherBtn,
              styles.switcherBtnActive,
              { backgroundColor: colors.neutral100 },
            ]}
          >
            <Icon name="chart_pie" size={16} tintColor="neutral900" />
          </View>
          <View style={styles.switcherBtn}>
            <Icon name="more" size={16} tintColor="neutral400" />
          </View>
        </View>
      </View>
      {subtitle ? <Text style={styles.sectionSubtitle}>{subtitle}</Text> : null}

      {/* Bar chart placeholder */}
      <View
        style={{
          height: 148,
          justifyContent: "flex-end",
          paddingVertical: 10,
          paddingHorizontal: 16,
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "flex-end",
            justifyContent: "space-between",
            height: 100,
          }}
        >
          <Skeleton width={18} height={40} borderRadius={3} />
          <Skeleton width={18} height={60} borderRadius={3} />
          <Skeleton width={18} height={80} borderRadius={3} />
          <Skeleton width={18} height={50} borderRadius={3} />
          <Skeleton width={18} height={70} borderRadius={3} />
          <Skeleton width={18} height={90} borderRadius={3} />
          <Skeleton width={18} height={65} borderRadius={3} />
        </View>
      </View>

      {/* Metric cards skeleton */}
      <View style={styles.metricRow}>
        <MetricCardSkeleton label="Trung bình" />
        <MetricCardSkeleton label="Cao nhất" />
      </View>
    </View>
  );
}

function MetricCardSkeleton({ label }: { label: string }) {
  const { colors } = useThemes();
  return (
    <View
      style={[
        styles.metricCard,
        { backgroundColor: colors.neutral50, borderColor: colors.border10 },
      ]}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Skeleton
          width={60}
          height={18}
          borderRadius={4}
          style={{ marginTop: 4 }}
        />
      </View>
    </View>
  );
}

function MetricCard({
  label,
  value,
  isMoney,
}: {
  label: string;
  value: number;
  isMoney?: boolean;
}) {
  const { colors } = useThemes();
  const parts = isMoney
    ? splitCompact(value)
    : { num: String(value), unit: "" };
  return (
    <View
      style={[
        styles.metricCard,
        { backgroundColor: colors.neutral50, borderColor: colors.border10 },
      ]}
    >
      <Text style={styles.metricLabel}>{label}</Text>
      <View style={styles.metricValueRow}>
        <Text style={styles.metricValue}>{parts.num}</Text>
        {parts.unit ? (
          <Text style={styles.metricUnit}>{parts.unit}</Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  root: { flex: 1 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  filterBtn: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  filterDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  scroll: { flex: 1 },
  tabsRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 40,
    backgroundColor: "#fff",
    minWidth: 72,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: colors.primary },
  tabText: {
    ...textPresets.fs14_500,
    color: colors.neutral400,
    textAlign: "center",
  },
  tabTextActive: { color: "#fff" },
  center: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  refreshIndicator: {
    position: "absolute",
    top: 30,
    left: 0,
    right: 0,
    alignItems: "center",
  },
  errorText: {
    ...textPresets.fs14_500,
    color: colors.error,
    textAlign: "center",
  },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: colors.primary,
  },
  retryBtnText: { ...textPresets.fs14_500, color: "#fff" },
  cardSection: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  summaryCard: {
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border10,
    overflow: "hidden",
    backgroundColor: colors.neutral100,
    shadowColor: "#110C22",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: colors.neutral50,
  },
  summaryDate: { ...textPresets.fs14_500, color: colors.neutral400 },
  summaryRevRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  summaryRevInfo: { flex: 1 },
  summarySubLabel: {
    ...textPresets.fs12_400,
    color: colors.neutral400,
    marginBottom: 4,
  },
  summaryValueRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  summaryAmountRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  summaryAmount: { fontSize: 18, fontWeight: "600", color: colors.neutral900 },
  summaryUnit: { ...textPresets.fs14_500, color: colors.neutral900 },
  summaryDivider: { height: 0.5, backgroundColor: colors.border10 },
  summaryBottomRow: { flexDirection: "row" },
  summarySubCol: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    padding: 14,
  },
  summarySubColBorder: {
    borderRightWidth: 0.5,
    borderRightColor: colors.border10,
  },
  summarySubAmount: {
    fontSize: 18,
    fontWeight: "600",
    color: colors.neutral900,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 1,
    marginTop: 6,
  },
  dotBlue: { backgroundColor: colors.info },
  dotGreen: { backgroundColor: colors.success },
  dotOrange: { backgroundColor: "#FFC86A" },
  pctBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  pctBadgeText: { fontSize: 10, fontWeight: "500" },
  sectionDivider: { height: 8, backgroundColor: colors.neutral50 },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleWrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: colors.neutral900 },
  sectionSubtitle: { ...textPresets.fs12_400, color: colors.neutral400 },
  switcher: {
    flexDirection: "row",
    borderRadius: 40,
    padding: 3,
    alignItems: "center",
    gap: 2,
    alignSelf: "flex-end",
  },
  switcherBtn: {
    width: 32,
    height: 30,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  switcherBtnActive: {
    shadowColor: "#110C22",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  metricRow: { flexDirection: "row", gap: 8 },
  metricCard: {
    flex: 1,
    padding: 14,
    borderRadius: 8,
    borderWidth: 0.5,
    gap: 4,
  },
  metricLabel: { ...textPresets.fs12_400, color: colors.neutral400 },
  metricValueRow: { flexDirection: "row", alignItems: "baseline", gap: 2 },
  metricValue: { fontSize: 18, fontWeight: "600", color: colors.neutral900 },
  metricUnit: { ...textPresets.fs12_400, color: colors.neutral300 },
}));
