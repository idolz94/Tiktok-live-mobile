import { useCallback, useState } from "react";
import { StyleSheet, View } from "react-native";
import { BottomNav } from "@components/bottom-navigator";
import { useTikTokLiveSocket } from "@hooks/use-tiktok-live-socket";
import { BottomTab, LiveComment, TopTab } from "@types";
import OrderOverviewScreen from "@screens/order-overview";
import { HomeView } from "@screens/dashboard/components/home-view";
import { ReportsView } from "@screens/dashboard/components/reports-view";
import { SessionHeader } from "@screens/dashboard/components/session-header";
import { SettingsView } from "@screens/dashboard/components/settings-view";
import { ShippingView } from "@screens/dashboard/components/shipping-view";
import { TopSegmentTabs } from "@screens/dashboard/components/top-segment-tabs";
import { useOrderManager } from "@screens/dashboard/hooks/use-order-manager";
import { useAuth } from "@/features/auth/hooks/use-auth";
import { SafeAreaView } from "react-native-safe-area-context";
import { CustomersView } from "./components/customers-view";

export const DashboardScreen = () => {
  const { user, logout } = useAuth();

  const {
    status,
    isConnected,
    comments,
    clearComments,
    tiktokUsername,
    changeTikTokUsername,
    currentLiveSession,
    liveHistory,
    liveDurationSeconds,
    liveNowText,
  } = useTikTokLiveSocket();

  const [topTab, setTopTab] = useState<TopTab>("connect");
  const [bottomTab, setBottomTab] = useState<BottomTab>("home");

  const orderManager = useOrderManager({
    comments,
    onAfterCreateOrder: () => setBottomTab("home"),
  });

  const handleCreateOrder = useCallback(
    (comment: LiveComment) => {
      orderManager.createOrderFromComment(comment);
    },
    [orderManager],
  );

  const renderCurrentBottomView = useCallback(() => {
    if (bottomTab === "home") {
      return (
        <HomeView
          topTab={topTab}
          liveTab={orderManager.liveTab}
          comments={comments}
          orders={orderManager.orders}
          filteredOrders={orderManager.filteredOrders}
          orderFilter={orderManager.orderFilter}
          orderSearchText={orderManager.orderSearchText}
          buyingCount={orderManager.buyingCount}
          unpaidOrders={orderManager.unpaidOrders}
          paidOrders={orderManager.paidOrders}
          draftOrders={orderManager.draftOrders}
          confirmedOrders={orderManager.confirmedOrders}
          orderProductCount={orderManager.orderProductCount}
          onChangeLiveTab={orderManager.setLiveTab}
          onChangeOrderFilter={orderManager.setOrderFilter}
          onChangeOrderSearchText={orderManager.setOrderSearchText}
          onClearComments={clearComments}
          onClearOrders={orderManager.clearOrders}
          onCreateOrderFromComment={handleCreateOrder}
          onUpdateOrder={orderManager.updateOrder}
          onDeleteOrder={orderManager.deleteOrder}
          onAddProductToOrder={orderManager.addProductToOrder}
          onToggleDeposit={orderManager.toggleDepositStatus}
          onConfirmOrder={orderManager.confirmOrder}
          onOpenOrderOverview={orderManager.openOrderOverview}
          liveHistory={liveHistory}
        />
      );
    }

    if (bottomTab === "customers")
      return <CustomersView customers={orderManager.customers} />;
    if (bottomTab === "shipping")
      return <ShippingView orders={orderManager.orders} />;
    if (bottomTab === "reports") {
      return (
        <ReportsView
          commentsCount={comments.length}
          buyingCount={orderManager.buyingCount}
          ordersCount={orderManager.orders.length}
          totalRevenue={orderManager.totalRevenue}
        />
      );
    }

    return (
      <SettingsView
        username={user?.fullName || user?.username}
        tiktokUsername={user?.tiktokId || tiktokUsername}
        isConnected={isConnected}
        status={status}
        onChangeTikTokUsername={changeTikTokUsername}
        onLogout={logout}
      />
    );
  }, [
    bottomTab,
    changeTikTokUsername,
    clearComments,
    comments,
    handleCreateOrder,
    isConnected,
    liveHistory,
    logout,
    orderManager,
    status,
    tiktokUsername,
    topTab,
    user?.username,
  ]);

  if (orderManager.selectedOrder) {
    return (
      <OrderOverviewScreen
        order={orderManager.selectedOrder}
        onBack={orderManager.closeOrderOverview}
        onConfirm={orderManager.confirmOrder}
      />
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <SessionHeader
          isConnected={isConnected}
          status={status}
          tiktokUsername={user?.tiktokId || tiktokUsername}
          currentLiveSession={currentLiveSession}
          liveDurationSeconds={liveDurationSeconds}
          liveNowText={liveNowText}
        />
        {bottomTab === "home" ? (
          <TopSegmentTabs activeTab={topTab} onChange={setTopTab} />
        ) : null}
        <View style={styles.content}>{renderCurrentBottomView()}</View>
        <BottomNav active={bottomTab} onChange={setBottomTab} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#f4f7f8" },
  container: { flex: 1, backgroundColor: "#f4f7f8" },
  content: { flex: 1 },
});
