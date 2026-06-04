import { router } from "expo-router";
import { useRef, useState } from "react";
import { View } from "react-native";
import { LiveComment } from "@app-types/index";
import { useOrderManager } from "@modules/orders/hooks/use-order-manager";
import { useTikTokLiveSocket } from "@modules/tiktok-live/hooks/use-tiktok-live-socket";
import { useAuthStore } from "@stores/auth";
import { createOrderCommentKey } from "@utils/comment";
import { Home } from "../../components/tabs/home";
import { TopSegmentTabs } from "../../components/tabs/top-segment-tabs";

export type TopTab = "connect" | "history";

export default function HomeTab() {
  const [topTab, setTopTab] = useState<TopTab>("connect");
  const createdCommentKeysRef = useRef<Set<string>>(new Set());
  const user = useAuthStore((state) => state.user);
  const registeredTikTokUsername = user?.tiktokUsername || "";

  const { comments, clearComments, currentLiveSessionId, liveHistory } =
    useTikTokLiveSocket({
      initialUsername: registeredTikTokUsername,
    });

  const orderManager = useOrderManager({
    comments,
    liveSessionId: currentLiveSessionId,
    onAfterCreateOrder: () => router.back(),
  });

  const handleCreateOrder = async (comment: LiveComment) => {
    const commentKey = createOrderCommentKey(comment);

    if (createdCommentKeysRef.current.has(commentKey)) {
      alert("Comment này đã tạo đơn rồi.");
      return false;
    }

    try {
      createdCommentKeysRef.current.add(commentKey);

      await orderManager.createOrderFromComment(comment);

      return true;
    } catch (error) {
      createdCommentKeysRef.current.delete(commentKey);

      console.log("CREATE ORDER ERROR:", error);
      alert(error instanceof Error ? error.message : "Tạo đơn thất bại");

      return false;
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <TopSegmentTabs activeTab={topTab} onChange={setTopTab} />
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
      />
    </View>
  );
}
