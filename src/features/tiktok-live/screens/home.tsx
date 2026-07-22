/**
 * HomeScreen — màn hình chính (tab index).
 * Di chuyển từ `src/app/(tabs)/index.tsx` sang feature theo cấu trúc route-mỏng/feature-dày.
 * (PROJECT_GUIDE mục 4 & 8)
 */
import { useThemes } from "@hooks/use-theme";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { useAuth } from "@features/auth/hooks/use-auth";
import { useOrderManager } from "@features/orders/hooks/use-order-manager";
import { useRef, useState } from "react";
import { Text, View } from "react-native";
import { LinearGradient } from "@components/linear-gradient";
import PagerView from "react-native-pager-view";
import { createStyles } from "@utils/createStyles";
import { HomeHeader } from "@components/home/header";
import { TiktokPage } from "@features/tiktok-live/components/tiktok-page";

export type TopTab = "connect" | "history";

export function HomeScreen() {
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { currentLiveSessionId } = useTikTokLiveSocketContext();
  const { user } = useAuth();
  const { colors, textPresets } = useThemes();

  useOrderManager({
    comments: [],
    liveSessionId: currentLiveSessionId,
    onAfterCreateOrder: () => setActiveIndex(1),
    hasOrders: user?.hasOrders ?? false,
  });

  const onTabPress = (i: number) => {
    setActiveIndex(i);
    pagerRef.current?.setPage(i);
  };

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <HomeHeader activeIndex={activeIndex} onTabPress={onTabPress} />
      <PagerView
        ref={pagerRef}
        style={styles.pager}
        initialPage={0}
        onPageSelected={(e) => setActiveIndex(e.nativeEvent.position)}
      >
        <TiktokPage key="tiktok" />
        <View style={styles.page} key="facebook">
          <Text style={[{ color: colors.neutral400 }, textPresets.fs14_400]}>Facebook sắp ra mắt</Text>
        </View>
      </PagerView>

      {/* <TopSegmentTabs activeTab={topTab} onChange={setTopTab} />
      <Home
        topTab={topTab}
        liveTab={orderManager.liveTab}
        comments={comments}
        orders={orderManager.orders}
        filteredOrders={orderManager.filteredOrders}
        orderFilter={orderManager.orderFilter}
        orderSearchText={orderManager.orderSearchText}
        buyingCount={orderManager.buyingCount}
        paidOrders={orderManager.paidOrders}
        draftOrders={orderManager.draftOrders}
        confirmedOrders={orderManager.confirmedOrders}
        orderProductCount={orderManager.orderProductCount}
        onChangeLiveTab={orderManager.setLiveTab}
        onChangeOrderFilter={orderManager.setOrderFilter}
        onChangeOrderSearchText={orderManager.setOrderSearchText}
        onClearComments={clearComments}
        onClearOrders={orderManager.clearOrders}
        // onCreateOrderFromComment={orderManager.createOrderFromComment}
        onCreateOrderFromComment={handleCreateOrder}
        onUpdateOrder={orderManager.updateOrder}
        onDeleteOrder={orderManager.deleteOrder}
        onAddProductToOrder={orderManager.addProductToOrder}
        onToggleDeposit={orderManager.toggleDepositStatus}
        onConfirmOrder={orderManager.confirmOrder}
        liveHistory={liveHistory}
        onOpenOrderOverview={(id) => router.push(`/order-detail?id=${id}`)}
      /> */}
    </View>
  );
}

const styles = createStyles(() => ({
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
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}));
