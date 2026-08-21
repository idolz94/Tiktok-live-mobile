import { Avatar } from "@components/avatar";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { CustomerDetailSheet } from "@components/customer-detail-sheet";
import {
  CollapsibleHeader,
  useCollapsibleHeaderHeight,
} from "@components/header/collapsible-header";
import { LinearGradient } from "@components/linear-gradient";
import { Icon } from "@components/icon";
import { createStyles } from "@utils/createStyles";
import { getCustomerTypeIcon } from "@features/customers/customer-type-icon";
import {
  getCustomersApi,
  type CustomerListItem,
} from "@features/customers/service/api";
import { formatMoneyCompact } from "@features/orders/utils/order";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useThemes } from "@hooks/use-theme";
import Animated, {
  useAnimatedScrollHandler,
  useSharedValue,
} from "react-native-reanimated";
import { useTabScrollToTop } from "@hooks/use-tab-scroll-to-top";

const CustomerRow = memo(
  ({
    customer,
    onPress,
  }: {
    customer: CustomerListItem;
    onPress: (id: string) => void;
  }) => {
    const username = customer.displayName || customer.tiktokUsername || "Khách hàng";
    const tiktokUsername = customer.tiktokUsername ? `@${customer.tiktokUsername}` : "";
    const customerTypeIcon = getCustomerTypeIcon(customer.customerType);

    return (
      <Pressable onPress={() => onPress(customer.id)} style={styles.row}>
        <Avatar uri={customer.avatarUrl || ""} username={username} size={42} />
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.name}>
            {username}
          </Text>
          {!!tiktokUsername && (
            <View style={styles.tiktokLine}>
              <Text numberOfLines={1} style={styles.tiktokText}>
                {tiktokUsername}
              </Text>
            </View>
          )}
          <View style={styles.metaLine}>
            {customerTypeIcon ? (
              <View style={styles.customerTypeBadge}>
                <Image source={customerTypeIcon} style={styles.customerTypeIcon} />
                <Text style={styles.customerTypeText}>
                  {customer.customerType}
                </Text>
              </View>
            ) : null}
            <Text style={styles.metaText}>{customer.totalOrders || 0} đơn</Text>
          </View>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>
    );
  },
);

const CustomerListCard = memo(
  ({
    customers,
    onPress,
  }: {
    customers: CustomerListItem[];
    onPress: (id: string) => void;
  }) => {
    const { shadows } = useThemes();
    return (
      <View style={styles.cardList}>
        {customers.map((customer) => (
          <View key={customer.id} style={[styles.card, shadows.sd2]}>
            <CustomerRow customer={customer} onPress={onPress} />
          </View>
        ))}
      </View>
    );
  },
);

// Di chuyển từ src/app/(tabs)/customers.tsx sang feature theo cấu trúc route-mỏng/feature-dày
// (PROJECT_GUIDE mục 4 & 8): route giờ chỉ là wrapper mỏng render screen này qua named export.
export function CustomersScreen() {
  const scrollRef = useRef<any>(null);
  useTabScrollToTop("customers", scrollRef);

  const { show } = useBottomSheet();
  const [customers, setCustomers] = useState<CustomerListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const scrollY = useSharedValue(0);
  const headerHeight = useCollapsibleHeaderHeight();
  const { colors, shadows: themeShadows } = useThemes();

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const loadCustomers = async (force = false) => {
    try {
      setLoading(true);
      setError("");
      const list = await getCustomersApi(force);
      setCustomers(list);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"totalSpent" | "totalOrders" | "createdAt">("totalSpent");
  const [topExpanded, setTopExpanded] = useState(true);

  useEffect(() => {
    void loadCustomers();
  }, []);

  const visibleCustomers = useMemo(
    () => customers.filter((customer) => Number(customer.totalOrders || 0) >= 1),
    [customers],
  );

  const filterTypes = useMemo(() => {
    const s = new Set<string>();
    for (const c of visibleCustomers) if (c.customerType) s.add(c.customerType);
    return [...s];
  }, [visibleCustomers]);

  const filteredCustomers = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = visibleCustomers;
    if (q) {
      out = out.filter((c) => {
        const name = (c.displayName ?? "").toLowerCase();
        const username = (c.tiktokUsername ?? "").toLowerCase();
        return name.includes(q) || username.includes(q);
      });
    }
    if (typeFilter) {
      out = out.filter((c) => (c.customerType ?? "—") === typeFilter);
    }
    const sorted = [...out];
    if (sortBy === "totalSpent") sorted.sort((a, b) => (b.totalSpent ?? 0) - (a.totalSpent ?? 0));
    else if (sortBy === "totalOrders") sorted.sort((a, b) => (b.totalOrders ?? 0) - (a.totalOrders ?? 0));
    else sorted.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    return sorted;
  }, [visibleCustomers, query, typeFilter, sortBy]);

  // ponytail: top 3 by totalSpent — compact, moved inside scroll so it doesn't push list off-screen
  const topCustomers = useMemo(
    () => [...visibleCustomers].sort((a, b) => (b.totalSpent ?? 0) - (a.totalSpent ?? 0)).slice(0, 3),
    [visibleCustomers],
  );

  const handlePressCustomer = (id: string) =>
    show({
      content: <CustomerDetailSheet customerKey={id} />,
      showDragIndicator: true,
      snapPoints: ["96%"],
    });

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <CollapsibleHeader title="Khách hàng" scrollY={scrollY} />

      {loading ? (
        <View style={[styles.statusBox, { paddingTop: headerHeight }]}>
          <ActivityIndicator color="#FF6B8A" />
          <Text style={styles.statusText}>Đang tải khách hàng...</Text>
        </View>
      ) : error ? (
        <View style={[styles.statusBox, { paddingTop: headerHeight }]}>
          <Text style={styles.errorText}>{error}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={() => void loadCustomers(true)}
          >
            <Text style={styles.retryText}>Tải lại</Text>
          </Pressable>
        </View>
      ) : (
        <>
          {/* ponytail: pinned above list so search + filters don't scroll away; horizontal filter scroll is isolated, not nested inside vertical ScrollView */}
          <View style={[styles.filterBar, { paddingTop: headerHeight }]}>
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Icon name="search" size={16} tintColor="neutral400" />
                <TextInput
                  value={query}
                  onChangeText={setQuery}
                  placeholder="Tên, @username"
                  placeholderTextColor="#9AA0AD"
                  style={styles.searchInput}
                  returnKeyType="search"
                  clearButtonMode="while-editing"
                />
                {!!query && (
                  <Pressable onPress={() => setQuery("")} hitSlop={8}>
                    <Icon name="close" size={14} tintColor="neutral400" />
                  </Pressable>
                )}
              </View>
            </View>

            {filterTypes.length > 1 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterRow}>
                <Pressable
                  onPress={() => setTypeFilter(null)}
                  style={[styles.filterPill, !typeFilter && styles.filterPillActive]}
                >
                  <Text style={[styles.filterPillText, !typeFilter && styles.filterPillTextActive]}>Tất cả</Text>
                </Pressable>
                {filterTypes.map((t) => (
                  <Pressable
                    key={t}
                    onPress={() => setTypeFilter((prev) => (prev === t ? null : t))}
                    style={[styles.filterPill, typeFilter === t && styles.filterPillActive]}
                  >
                    <Text style={[styles.filterPillText, typeFilter === t && styles.filterPillTextActive]}>{t}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <View style={styles.sortRow}>
              {(["totalSpent", "totalOrders", "createdAt"] as const).map((k) => (
                <Pressable
                  key={k}
                  onPress={() => setSortBy(k)}
                  style={[styles.sortPill, sortBy === k && styles.sortPillActive]}
                >
                  <Text style={[styles.sortPillText, sortBy === k && styles.sortPillTextActive]}>
                    {k === "totalSpent" ? "Chi tiêu" : k === "totalOrders" ? "Số đơn" : "Mới nhất"}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>

          {/* ponytail: top 3 horizontal bars — moved into scroll so it doesn't hijack fixed area; collapsible */}
          <Animated.ScrollView
            ref={scrollRef}
            style={styles.scrollView}
            contentContainerStyle={[
              styles.listContent,
              filteredCustomers.length === 0 && styles.listContentEmpty,
            ]}
            onScroll={scrollHandler}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
          >
            {topCustomers.length > 0 && (() => {
              const max = Math.max(...topCustomers.map((c) => c.totalSpent ?? 0), 1);
              return (
                <View style={[styles.topCard, { borderColor: colors.border10, backgroundColor: colors.white }, themeShadows.sd1]}>
                  <Pressable
                    onPress={() => setTopExpanded((v) => !v)}
                    style={styles.topCardHeader}
                    hitSlop={8}
                  >
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.topCardTitle, { color: colors.neutral900 }]}>Top khách hàng</Text>
                      <Text style={[styles.topCardSubtitle, { color: colors.neutral400 }]}>Theo tổng chi tiêu</Text>
                    </View>
                    <Text style={[styles.topCardToggle, { color: colors.neutral400 }]}>{topExpanded ? "Thu gọn" : "Mở rộng"}</Text>
                    <Text style={{ color: colors.neutral400, fontSize: 14 }}>{topExpanded ? "⌃" : "⌄"}</Text>
                  </Pressable>
                  {topExpanded && (
                    <View style={styles.topBarsCol}>
                      {topCustomers.map((c, idx) => (
                        <Pressable key={c.id} onPress={() => handlePressCustomer(c.id)} style={styles.topBarRow}>
                          <Text style={[styles.topBarRank, { color: colors.neutral400 }]}>{idx + 1}</Text>
                          <Avatar uri={c.avatarUrl || ""} username={c.displayName || c.tiktokUsername || "Khách hàng"} size={28} />
                          <Text style={[styles.topBarName, { color: colors.neutral900 }]} numberOfLines={1}>{c.displayName || c.tiktokUsername || "Khách hàng"}</Text>
                          <View style={styles.topBarTrack}>
                            <View style={[styles.topBarFill, { width: `${Math.max(6, Math.round(((c.totalSpent ?? 0) / max) * 100))}%`, backgroundColor: colors.primary }]} />
                          </View>
                          <Text style={[styles.topBarValue, { color: colors.neutral900 }]}>{formatMoneyCompact(c.totalSpent ?? 0)}</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}
                </View>
              );
            })()}

            {filteredCustomers.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyTitle}>
                  {visibleCustomers.length === 0 ? "Chưa có khách hàng" : "Không tìm thấy"}
                </Text>
                <Text style={styles.emptyText}>
                  {visibleCustomers.length === 0
                    ? "Khách sẽ xuất hiện sau khi có comment live hoặc đơn hàng phù hợp."
                    : "Thử đổi từ khoá hoặc bộ lọc."}
                </Text>
              </View>
            ) : (
              <CustomerListCard
                customers={filteredCustomers}
                onPress={handlePressCustomer}
              />
            )}
          </Animated.ScrollView>
        </>
      )}
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  root: {
    flex: 1,
  },
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 34,
    rowGap: 12,
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  cardList: {
    rowGap: 8,
  },
  card: {
    borderRadius: 16,
    backgroundColor: colors.white,
    shadowColor: colors.neutral900,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  info: { flex: 1, marginLeft: 12, minWidth: 0 },
  name: {
    color: colors.textDarkGray,
    ...textPresets.fs15_900,
  },
  tiktokLine: {
    marginTop: 4,
    flexDirection: "row",
    alignItems: "center",
  },
  tiktokText: {
    marginLeft: 5,
    flex: 1,
    color: colors.textDarkGray,
    ...textPresets.fs12_400,
  },
  metaLine: {
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
  },
  customerTypeBadge: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    marginRight: 8,
  },
  customerTypeIcon: {
    width: 20,
    height: 20,
    // ponytail: multiply hides the #F5F5F5 baked background against light surfaces without editing assets
    blendMode: "multiply",
  },
  customerTypeText: {
    color: colors.textDarkGray,
    ...textPresets.fs11_800,
  },
  metaText: {
    color: colors.textMuted,
    ...textPresets.fs11_400,
  },
  chevron: {
    marginLeft: 10,
    color: colors.textLightMuted,
    fontSize: 28,
    fontWeight: "300",
  },
  statusBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 28,
  },
  statusText: {
    marginTop: 12,
    color: colors.textMuted,
    ...textPresets.fs15_800,
  },
  errorText: {
    color: colors.error,
    textAlign: "center",
    ...textPresets.fs15_800,
  },
  retryButton: {
    marginTop: 14,
    borderRadius: 999,
    backgroundColor: colors.primary,
    paddingHorizontal: 18,
    paddingVertical: 10,
  },
  retryText: {
    color: colors.white,
    ...textPresets.fs14_800,
  },
  filterBar: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    rowGap: 12,
  },
  scrollView: {
    flex: 1,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  searchBox: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 14,
    height: 40,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 0,
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  filterRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingRight: 4,
  },
  filterPill: {
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterPillActive: {
    backgroundColor: colors.neutral900,
  },
  filterPillText: {
    color: colors.textMuted,
    ...textPresets.fs12_800,
  },
  filterPillTextActive: {
    color: colors.white,
  },
  sortRow: {
    flexDirection: "row",
    gap: 8,
  },
  sortPill: {
    flex: 1,
    alignItems: "center",
    borderRadius: 999,
    backgroundColor: colors.white,
    paddingVertical: 8,
  },
  sortPillActive: {
    backgroundColor: colors.primary,
  },
  sortPillText: {
    color: colors.textMuted,
    ...textPresets.fs12_800,
  },
  sortPillTextActive: {
    color: colors.white,
  },
  empty: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    color: colors.neutral900,
    ...textPresets.fs18_900,
  },
  emptyText: {
    marginTop: 8,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    ...textPresets.fs15_400,
  },
  topCard: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 14,
    gap: 2,
  },
  topCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topCardToggle: {
    fontSize: 12,
    fontWeight: "600",
  },
  topCardTitle: {
    ...textPresets.fs14_800,
  },
  topCardSubtitle: {
    fontSize: 12,
    marginBottom: 6,
  },
  topBarsCol: {
    gap: 10,
    paddingTop: 8,
  },
  topBarRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  topBarRank: {
    width: 14,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "700",
  },
  topBarName: {
    flex: 1,
    fontSize: 12,
    fontWeight: "600",
  },
  topBarTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#F2F4F7",
    overflow: "hidden",
  },
  topBarFill: {
    height: "100%",
    borderRadius: 999,
    minWidth: 6,
  },
  topBarValue: {
    fontSize: 11,
    fontWeight: "600",
    minWidth: 52,
    textAlign: "right",
  },
}));
