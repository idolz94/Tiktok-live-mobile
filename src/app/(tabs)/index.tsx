import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { useAuth } from "@features/auth/hooks/use-auth";
import { useOrderManager } from "@features/orders/hooks/use-order-manager";
import { useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Screen } from "@components/screen";
import { LinearGradient } from "@components/linear-gradient";
import PagerView from "react-native-pager-view";
import { createStyles } from "@utils/createStyles";
import { HomeHeader } from "@components/home/header";
import { TiktokPage } from "@features/tiktok-live/components/tiktok-page";

export type TopTab = "connect" | "history";

export default function HomeTab() {
  const pagerRef = useRef<PagerView>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const { currentLiveSessionId } = useTikTokLiveSocketContext();
  const { user } = useAuth();

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
    <Screen>
      <LinearGradient
        type="gra_background"
        style={{ height: 290, ...StyleSheet.absoluteFill }}
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
          <Text>Facebook coming soon</Text>
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
    </Screen>
  );
}

const styles = createStyles(() => ({
  pager: {
    flex: 1,
  },
  page: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
}));
