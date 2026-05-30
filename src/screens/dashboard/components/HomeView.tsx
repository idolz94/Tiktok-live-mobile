import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LiveHistoryItem } from "@/features/tiktok-live/types";
import CommentCard from "@/components/CommentCard";
import OrderCard from "@/components/OrderCard";
import OrderFilterBar from "@/components/OrderFilterBar";
import { LiveComment, LiveTab, Order, OrderFilter, OrderProduct, TopTab } from "@/types";
import PlaceholderView from "@/screens/dashboard/components/PlaceholderView";
import SectionHeader from "@/screens/dashboard/components/SectionHeader";
import StatsRow from "@/screens/dashboard/components/StatsRow";

export default function HomeView({
  topTab,
  liveTab,
  comments,
  orders,
  filteredOrders,
  orderFilter,
  orderSearchText,
  buyingCount,
  unpaidOrders,
  paidOrders,
  draftOrders,
  confirmedOrders,
  orderProductCount,
  onChangeLiveTab,
  onChangeOrderFilter,
  onChangeOrderSearchText,
  onClearComments,
  onClearOrders,
  onCreateOrderFromComment,
  onUpdateOrder,
  onDeleteOrder,
  onAddProductToOrder,
  onToggleDeposit,
  onConfirmOrder,
  onOpenOrderOverview,
  liveHistory
}: {
  topTab: TopTab;
  liveTab: LiveTab;
  comments: LiveComment[];
  orders: Order[];
  filteredOrders: Order[];
  orderFilter: OrderFilter;
  orderSearchText: string;
  buyingCount: number;
  unpaidOrders: number;
  paidOrders: number;
  draftOrders: number;
  confirmedOrders: number;
  orderProductCount: number;
  onChangeLiveTab: (tab: LiveTab) => void;
  onChangeOrderFilter: (filter: OrderFilter) => void;
  onChangeOrderSearchText: (value: string) => void;
  onClearComments: () => void;
  onClearOrders: () => void;
  onCreateOrderFromComment: (item: LiveComment) => void;
  onUpdateOrder: (id: string, field: keyof Order, value: string) => void;
  onDeleteOrder: (id: string) => void;
  onAddProductToOrder: (orderId: string, product: OrderProduct) => void;
  onToggleDeposit: (orderId: string) => void;
  onConfirmOrder: (orderId: string) => void;
  onOpenOrderOverview: (orderId: string) => void;
  liveHistory: LiveHistoryItem[];
}) {
  if (topTab === "history") {
    return <View style={styles.history}><PlaceholderView liveHistory={liveHistory} /></View>;
  }

  return (
    <View style={styles.flex}>
      <View style={styles.liveTabs}>
        <TouchableOpacity style={[styles.liveTab, liveTab === "live" && styles.activeLiveTab]} onPress={() => onChangeLiveTab("live")}>
          <Text style={[styles.liveTabText, liveTab === "live" && styles.activeLiveTabText]}>♪ LIVE</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.liveTab, liveTab === "orders" && styles.activeLiveTab]} onPress={() => onChangeLiveTab("orders")}>
          <Text style={[styles.liveTabText, liveTab === "orders" && styles.activeLiveTabText]}>▧ Đơn đã tạo</Text>
        </TouchableOpacity>
      </View>

      {liveTab === "live" ? (
        <ScrollView contentContainerStyle={styles.content}>
          <StatsRow commentsCount={comments.length} buyingCount={buyingCount} ordersCount={orders.length} />
          <SectionHeader title="Comment realtime" actionText="Xóa comment" onAction={onClearComments} />
          {comments.length === 0 ? (
            <View style={styles.empty}><Text style={styles.emptyText}>Chưa có comment. Hãy chạy Python SSE server, app sẽ tự kết nối.</Text></View>
          ) : (
            comments.map((item) => <CommentCard key={item.id} item={item} onCreateOrder={onCreateOrderFromComment} />)
          )}
        </ScrollView>
      ) : (
        <View style={styles.flex}>
          <OrderFilterBar
            searchText={orderSearchText}
            onChangeSearch={onChangeOrderSearchText}
            activeFilter={orderFilter}
            onChangeFilter={onChangeOrderFilter}
            productCount={orderProductCount}
            unpaidCount={unpaidOrders}
            paidCount={paidOrders}
            draftCount={draftOrders}
            confirmedCount={confirmedOrders}
          />
          <ScrollView contentContainerStyle={styles.content}>
            <SectionHeader title="Đơn đã tạo" actionText="Xóa đơn" onAction={onClearOrders} />
            {filteredOrders.length === 0 ? (
              <View style={styles.empty}><Text style={styles.emptyText}>Chưa có đơn nào.</Text></View>
            ) : (
              filteredOrders.map((item) => (
                <OrderCard
                  key={item.id}
                  item={item}
                  onUpdate={onUpdateOrder}
                  onDelete={onDeleteOrder}
                  onAddProduct={onAddProductToOrder}
                  onToggleDeposit={onToggleDeposit}
                  onConfirmOrder={onConfirmOrder}
                  onOpenOverview={onOpenOrderOverview}
                />
              ))
            )}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  history: { flex: 1, padding: 14 },
  liveTabs: { minHeight: 58, flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#dbeafe" },
  liveTab: { flex: 1, alignItems: "center", justifyContent: "center", borderBottomWidth: 3, borderBottomColor: "transparent" },
  activeLiveTab: { borderBottomColor: "#f2c300" },
  liveTabText: { fontSize: 17, color: "#9ab2ad", fontWeight: "900" },
  activeLiveTabText: { color: "#f2c300" },
  content: { paddingHorizontal: 12, paddingBottom: 28 },
  empty: { padding: 36, alignItems: "center" },
  emptyText: { color: "#64748b", textAlign: "center", lineHeight: 22 }
});
