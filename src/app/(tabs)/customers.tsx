import { Avatar } from "@components/avatar";
import { useBottomSheet } from "@components/bottom-sheet/hook";
import { CustomerDetailSheet } from "@components/customer-detail-sheet";
import { Icon } from "@components/icon";
import { LinearGradient } from "@components/linear-gradient";
import { useAuth } from "@features/auth/hooks/use-auth";
import {
  CustomerSummaryWithTikTok,
  useOrderManager,
} from "@features/orders/hooks/use-order-manager";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { createStyles } from "@utils/createStyles";
import { useCustomerRefreshStore } from "@features/customers/stores/customer-refresh-store";
import { getCustomerTypeIcon } from "@features/customers/customer-type-icon";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  LayoutChangeEvent,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useThemes } from "@hooks/use-theme";
import Animated, {
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
  interpolate,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { useTabScrollToTop } from "@hooks/use-tab-scroll-to-top";

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
    const handlePress = useCallback(
      () => onPress(customerKey),
      [customerKey, onPress],
    );

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
                {tiktokUsername}
              </Text>
            </View>
          )}
          <View style={styles.metaLine}>
            {(() => {
              const icon = getCustomerTypeIcon(customer.customerType);
              return icon ? (
                <View style={styles.customerTypeBadge}>
                  <Image source={icon} style={styles.customerTypeIcon} />
                  <Text style={styles.customerTypeText}>
                    {customer.customerType}
                  </Text>
                </View>
              ) : null;
            })()}
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
              <CustomerRow customer={customer} onPress={onPress} />
            </View>
          );
        })}
      </View>
    );
  },
);

export default function CustomersTab() {
  const [activeTab, setActiveTab] = useState<CustomerTab>("all");
  const scrollRef = useRef<any>(null);
  useTabScrollToTop("customers", scrollRef);

  const { top } = useSafeAreaInsets();
  const { show } = useBottomSheet();
  const { comments, currentLiveSessionId } = useTikTokLiveSocketContext();
  const { user } = useAuth();

  const { width: SCREEN_WIDTH } = Dimensions.get("window");

  const HEADER_MAX_HEIGHT = top + 76;
  const HEADER_MIN_HEIGHT = top + 50;
  const SCROLL_DISTANCE = 80;

  const scrollY = useSharedValue(0);
  const [titleWidth, setTitleWidth] = useState(130);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const onTitleLayout = useCallback((e: LayoutChangeEvent) => {
    setTitleWidth(e.nativeEvent.layout.width);
  }, []);

  const centerTranslateX = useMemo(() => {
    return SCREEN_WIDTH / 2 - 16 - titleWidth / 2;
  }, [titleWidth, SCREEN_WIDTH]);

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const height = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
      "clamp",
    );
    return {
      height,
    };
  });

  const blurAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, 1],
      "clamp",
    );
    return {
      opacity,
    };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const transX = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, centerTranslateX],
      "clamp",
    );
    const transY = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [0, -25],
      "clamp",
    );
    const scale = interpolate(
      scrollY.value,
      [0, SCROLL_DISTANCE],
      [1, 0.8],
      "clamp",
    );
    return {
      transform: [{ translateX: transX }, { translateY: transY }, { scale }],
    };
  });

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
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <Animated.View style={[StyleSheet.absoluteFill, blurAnimatedStyle]}>
          <BlurView
            intensity={30}
            tint="light"
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
        <Animated.View
          onLayout={onTitleLayout}
          style={[styles.titleContainer, titleAnimatedStyle]}
        >
          <Text style={styles.title}>Khách hàng</Text>
        </Animated.View>
      </Animated.View>

      {orderManager.orderLoading ? (
        <View style={[styles.statusBox, { paddingTop: HEADER_MAX_HEIGHT }]}>
          <ActivityIndicator color="#FF6B8A" />
          <Text style={styles.statusText}>Đang tải khách hàng...</Text>
        </View>
      ) : orderManager.orderError ? (
        <View style={[styles.statusBox, { paddingTop: HEADER_MAX_HEIGHT }]}>
          <Text style={styles.errorText}>{orderManager.orderError}</Text>
          <Pressable
            style={styles.retryButton}
            onPress={orderManager.reloadOrders}
          >
            <Text style={styles.retryText}>Tải lại</Text>
          </Pressable>
        </View>
      ) : (
        <Animated.ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.listContent,
            { paddingTop: HEADER_MAX_HEIGHT },
            displayedCustomers.length === 0 && styles.listContentEmpty,
          ]}
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
        >
          {displayedCustomers.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyTitle}>Chưa có khách hàng</Text>
              <Text style={styles.emptyText}>
                Khách sẽ xuất hiện sau khi có comment live hoặc đơn hàng phù
                hợp.
              </Text>
            </View>
          ) : (
            <CustomerListCard
              customers={displayedCustomers}
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
  header: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  titleContainer: {
    position: "absolute",
    left: 16,
    bottom: 12,
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
