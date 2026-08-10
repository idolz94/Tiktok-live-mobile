import { Avatar } from "@components/avatar";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { CustomerDetailSheet } from "@components/customer-detail-sheet";
import {
  CollapsibleHeader,
  useCollapsibleHeaderHeight,
} from "@components/header/collapsible-header";
import { LinearGradient } from "@components/linear-gradient";
import { createStyles } from "@utils/createStyles";
import { getCustomerTypeIcon } from "@features/customers/customer-type-icon";
import { getCustomersApi, type CustomerListItem } from "@features/customers/service/api";
import { memo, useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Image, Pressable, Text, View } from "react-native";
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

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const loadCustomers = async (force = false) => {
    try {
      setLoading(true);
      setError("");
      setCustomers(await getCustomersApi(force));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Không tải được khách hàng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCustomers();
  }, []);

  const visibleCustomers = useMemo(
    () => customers.filter((customer) => Number(customer.totalOrders || 0) >= 1),
    [customers],
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
        <Animated.ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: headerHeight },
            visibleCustomers.length === 0 && styles.listContentEmpty,
          ]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {visibleCustomers.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Chưa có khách hàng</Text>
              <Text style={styles.emptyText}>
                Khách sẽ xuất hiện sau khi có comment live hoặc đơn hàng phù
                hợp.
              </Text>
            </View>
          ) : (
            <CustomerListCard
              customers={visibleCustomers}
              onPress={handlePressCustomer}
            />
          )}
        </Animated.ScrollView>
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
}));
