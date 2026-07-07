import { Avatar } from "@components/avatar";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { CustomerDetailSheet } from "@components/customer-detail-sheet";
import { Icon } from "@components/icon";
import { LinearGradient } from "@components/linear-gradient";
import { Screen } from "@components/screen";
import { useAuth } from "@features/auth/hooks/use-auth";
import {
  CustomerSummaryWithTikTok,
  useOrderManager,
} from "@features/orders/hooks/use-order-manager";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { createStyles } from "@utils/createStyles";
import { useCustomerRefreshStore } from "@features/customers/stores/customer-refresh-store";
import { memo, useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemes } from "@hooks/use-theme";

type CustomerTab = "all" | "new" | "tiktok";

const TAB_LABELS: Record<CustomerTab, string> = {
  all: "Tất cả",
  new: "Chưa TikTok",
  tiktok: "TikTok",
};

const CustomerRow = memo(
  ({
    customer,
    onPress,
  }: {
    customer: CustomerSummaryWithTikTok;
    onPress: (key: string) => void;
  }) => {
    const tiktokUsername = customer.customerTikTokUsername || "";
    const customerKey = tiktokUsername || customer.username;
    const handlePress = useCallback(() => onPress(customerKey), [customerKey, onPress]);

    return (
      <Pressable onPress={handlePress} style={styles.row}>
        <Avatar uri={customer.avatar} username={customer.username} size={42} />
        <View style={styles.info}>
          <Text numberOfLines={1} style={styles.name}>
            {customer.username}
          </Text>
          {!!tiktokUsername && (
            <View style={styles.tiktokLine}>
              <Text numberOfLines={1} style={styles.tiktokText}>
                @{tiktokUsername}
              </Text>
            </View>
          )}
          <View style={styles.metaLine}>
            <Text style={styles.customerTypeBadge}>{customer.customerType || "Lẻ"}</Text>
            <Text style={styles.metaText}>{customer.totalOrders} đơn</Text>
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
    customers: CustomerSummaryWithTikTok[];
    onPress: (key: string) => void;
  }) => {
    const { shadows } = useThemes();
    return (
      <View style={styles.cardList}>
        {customers.map((customer) => {
          const tiktokUsername = customer.customerTikTokUsername || "";
          const key = tiktokUsername || customer.username;
          return (
            <View key={key} style={[styles.card, shadows.sd2]}>
              <CustomerRow
                customer={customer}
                onPress={onPress}
              />
            </View>
          );
        })}
      </View>
    );
  },
);

export default function CustomersTab() {
  const [activeTab, setActiveTab] = useState<CustomerTab>("all");
  const { top } = useSafeAreaInsets();
  const { show } = useBottomSheet();
  const { comments, currentLiveSessionId } = useTikTokLiveSocketContext();
  const { user } = useAuth();

  const orderManager = useOrderManager({
    comments,
    liveSessionId: currentLiveSessionId,
    hasOrders: user?.hasOrders ?? false,
    allStatuses: true,
  });

  const refreshTick = useCustomerRefreshStore((s) => s.tick);
  useEffect(() => {
    if (refreshTick === 0) return;
    void orderManager.reloadOrders();
  }, [refreshTick]);

  const customers: CustomerSummaryWithTikTok[] = orderManager.customers.filter(
    (c) => c.totalOrders >= 1,
  );
  const tiktokCustomers = useMemo(
    () => customers.filter((c) => !!c.customerTikTokUsername),
    [customers],
  );
  const newCustomers = useMemo(
    () => customers.filter((c) => !c.customerTikTokUsername),
    [customers],
  );

  const displayedCustomers =
    activeTab === "tiktok" ? tiktokCustomers : activeTab === "new" ? newCustomers : customers;

  const counts: Record<CustomerTab, number> = {
    all: customers.length,
    new: newCustomers.length,
    tiktok: tiktokCustomers.length,
  };

  const handlePressCustomer = useCallback(
    (key: string) =>
      show({
        content: <CustomerDetailSheet customerKey={key} />,
        showDragIndicator: true,
        snapPoints: ["96%"],
      }),
    [show],
  );

  return (
    <Screen>
      <LinearGradient
        type="gra_background"
        style={styles.headerBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <View style={[styles.header, { paddingTop: top + 12 }]}>
        <Text style={styles.title}>Khách hàng</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.headerButton}>
            <Icon name="filter" size={20} tintColor="#000000" />
          </Pressable>
          <Pressable style={styles.headerButton}>
            <Icon name="search" size={20} tintColor="#000000" />
          </Pressable>
        </View>
      </View>

      <View style={styles.tabs}>
        {(Object.keys(TAB_LABELS) as CustomerTab[]).map((tab) => {
          const active = activeTab === tab;
          return (
            <Pressable
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={[styles.tab, active && styles.tabActive]}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>
                {TAB_LABELS[tab]} ({counts[tab]})
              </Text>
            </Pressable>
          );
        })}
      </View>

      {orderManager.orderLoading ? (
        <View style={styles.statusBox}>
          <ActivityIndicator color="#FF6B8A" />
          <Text style={styles.statusText}>Đang tải khách hàng...</Text>
        </View>
      ) : orderManager.orderError ? (
        <View style={styles.statusBox}>
          <Text style={styles.errorText}>{orderManager.orderError}</Text>
          <Pressable style={styles.retryButton} onPress={orderManager.reloadOrders}>
            <Text style={styles.retryText}>Tải lại</Text>
          </Pressable>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.listContent,
            displayedCustomers.length === 0 && styles.listContentEmpty,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {displayedCustomers.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Chưa có khách hàng</Text>
              <Text style={styles.emptyText}>
                Khách sẽ xuất hiện sau khi có comment live hoặc đơn hàng phù hợp.
              </Text>
            </View>
          ) : (
            <CustomerListCard customers={displayedCustomers} onPress={handlePressCustomer} />
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  header: {
    minHeight: 119,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  title: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 28,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 16,
  },
  headerButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.white,
  },
  tabs: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  tab: {
    height: 40,
    justifyContent: "center",
    borderRadius: 40,
    backgroundColor: colors.white,
    paddingHorizontal: 24,
  },
  tabActive: {
    backgroundColor: colors.primary,
  },
  tabText: {
    color: colors.neutral300,
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 22,
  },
  tabTextActive: {
    color: colors.text,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 34,
    rowGap: 8,
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
    marginRight: 8,
    borderRadius: 999,
    backgroundColor: colors.neutral50,
    paddingHorizontal: 10,
    paddingVertical: 3,
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
  empty: {
    alignItems: "center",
    padding: 32,
  },
  emptyTitle: {
    color: colors.text,
    ...textPresets.fs18_900,
  },
  emptyText: {
    marginTop: 8,
    color: colors.textMuted,
    textAlign: "center",
    lineHeight: 21,
    ...textPresets.fs15_400,
  },
}));
