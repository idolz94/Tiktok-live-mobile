import { useState } from "react";
import { View } from "react-native";
import { router } from "expo-router";
import { useLiveSocket } from "@contexts/live-socket-context";
import {
  useOrderStore,
  useFilteredOrders,
  useOrderStats,
} from "@stores/order/order-store";
import { TopSegmentTabs } from "../../components/tabs/top-segment-tabs";
import { Home } from "../../components/tabs/home";

export type TopTab = "connect" | "history";

export default function HomeTab() {
  const [topTab, setTopTab] = useState<TopTab>("connect");
  const live = useLiveSocket();
  const store = useOrderStore();
  const filteredOrders = useFilteredOrders();
  const stats = useOrderStats();

  return (
    <View style={{ flex: 1 }}>
      <TopSegmentTabs activeTab={topTab} onChange={setTopTab} />
      <Home
        topTab={topTab}
        liveTab={store.liveTab}
        comments={live.comments}
        orders={store.orders}
        filteredOrders={filteredOrders}
        orderFilter={store.orderFilter}
        orderSearchText={store.orderSearchText}
        liveHistory={live.liveHistory}
        buyingCount={live.comments.filter((c) => c.intent === "buying").length}
        {...stats}
        onChangeLiveTab={store.setLiveTab}
        onChangeOrderFilter={store.setOrderFilter}
        onChangeOrderSearchText={store.setOrderSearchText}
        onClearComments={live.clearComments}
        onClearOrders={store.clearOrders}
        onCreateOrderFromComment={(c) => store.createOrderFromComment(c)}
        onUpdateOrder={store.updateOrder}
        onDeleteOrder={store.deleteOrder}
        onAddProductToOrder={store.addProductToOrder}
        onToggleDeposit={store.toggleDepositStatus}
        onConfirmOrder={store.confirmOrder}
        onOpenOrderOverview={(id) => router.push(`/order-detail?id=${id}`)}
      />
    </View>
  );
}
