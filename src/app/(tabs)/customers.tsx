import { Avatar } from "@components/avatar";
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
import { router } from "expo-router";
import { useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
  StyleSheet,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type CustomerTab = "all" | "new" | "tiktok";

const TAB_LABELS: Record<CustomerTab, string> = {
  all: "Tất cả",
  new: "Chưa TikTok",
  tiktok: "TikTok",
};

function TikTokMark() {
  return (
    <View style={styles.tiktokMark}>
      <Text style={styles.tiktokMarkText}>♪</Text>
    </View>
  );
}

export default function CustomersTab() {
  const [activeTab, setActiveTab] = useState<CustomerTab>("all");
  const { top } = useSafeAreaInsets();
  const { comments, currentLiveSessionId } = useTikTokLiveSocketContext();
  const { user } = useAuth();

  const orderManager = useOrderManager({
    comments,
    liveSessionId: currentLiveSessionId,
    hasOrders: user?.hasOrders ?? false,
  });

  const customers: CustomerSummaryWithTikTok[] = orderManager.customers;
  const tiktokCustomers = useMemo(
    () => customers.filter((customer) => !!customer.customerTikTokUsername),
    [customers],
  );
  const newCustomers = useMemo(
    () => customers.filter((customer) => !customer.customerTikTokUsername),
    [customers],
  );

  const displayedCustomers =
    activeTab === "tiktok"
      ? tiktokCustomers
      : activeTab === "new"
        ? newCustomers
        : customers;

  const counts: Record<CustomerTab, number> = {
    all: customers.length,
    new: newCustomers.length,
    tiktok: tiktokCustomers.length,
  };

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
            displayedCustomers.map((customer, index) => {
              const tiktokUsername = customer.customerTikTokUsername || "";
              const customerKey = tiktokUsername || customer.username;
              const isLast = index === displayedCustomers.length - 1;

              return (
                <View key={customerKey}>
                  <Pressable
                    onPress={() =>
                      router.push({
                        pathname: "/customer-detail",
                        params: { customerKey },
                      })
                    }
                    style={styles.row}
                  >
                    <Avatar
                      uri={customer.avatar}
                      username={customer.username}
                      size={42}
                    />
                    <View style={styles.info}>
                      <Text numberOfLines={1} style={styles.name}>
                        {customer.username}
                      </Text>
                      {!!tiktokUsername && (
                        <View style={styles.tiktokLine}>
                          <TikTokMark />
                          <Text numberOfLines={1} style={styles.tiktokText}>
                            {tiktokUsername}
                          </Text>
                        </View>
                      )}
                      <View style={styles.metaLine}>
                        <Text style={styles.customerTypeBadge}>Lẻ</Text>
                        <Text style={styles.metaText}>
                          {customer.totalOrders} đơn
                        </Text>
                        <Text style={styles.metaDot}>•</Text>
                        <Text style={styles.metaText}>
                          {customer.totalComments} comment
                        </Text>
                      </View>
                    </View>
                    <Text style={styles.chevron}>›</Text>
                  </Pressable>
                  {!isLast && <View style={styles.divider} />}
                </View>
              );
            })
          )}
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  headerBackground: {
    height: 290,
    ...StyleSheet.absoluteFill,
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
  },
  listContentEmpty: {
    flexGrow: 1,
    justifyContent: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
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
  tiktokMark: {
    width: 14,
    height: 14,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  tiktokMarkText: {
    color: colors.textDarkGray,
    fontSize: 10,
    fontWeight: "900",
    lineHeight: 12,
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
  metaDot: {
    marginHorizontal: 6,
    color: colors.textMuted,
    ...textPresets.fs11_400,
  },
  chevron: {
    marginLeft: 10,
    color: colors.textLightMuted,
    fontSize: 28,
    fontWeight: "300",
  },
  divider: {
    height: 1,
    marginLeft: 54,
    backgroundColor: colors.borderLight,
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
