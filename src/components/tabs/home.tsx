import { CommentCard } from "./comment-card";
import { OrderCard } from "./order-card";
import { OrderFilterBar } from "./order-filter-bar";
import { LiveHistoryItem } from "@modules/tiktok-live/types";
import { PlaceholderView } from "./placeholder-view";
import { SectionHeader } from "./section-header";
import { StatsRow } from "./stats-row";
import {
  LiveComment,
  LiveTab,
  Order,
  OrderFilter,
  OrderProduct,
  TopTab,
} from "@app-types/index";
import { createStyles } from "@utils/createStyles";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export const Home = ({
  topTab,
  liveTab,
  comments,
  orders,
  filteredOrders,
  orderFilter,
  orderSearchText,
  buyingCount,
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
  liveHistory,
}: {
  topTab: TopTab;
  liveTab: LiveTab;
  comments: LiveComment[];
  orders: Order[];
  filteredOrders: Order[];
  orderFilter: OrderFilter;
  orderSearchText: string;
  buyingCount: number;
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
}) => {
  if (topTab === "history") {
    return (
      <View style={styles.history}>
        <PlaceholderView liveHistory={liveHistory} />
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <View style={styles.liveTabs}>
        <TouchableOpacity
          style={[styles.liveTab, liveTab === "live" && styles.activeLiveTab]}
          onPress={() => onChangeLiveTab("live")}
        >
          <Text
            style={[
              styles.liveTabText,
              liveTab === "live" && styles.activeLiveTabText,
            ]}
          >
            ♪ LIVE
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.liveTab, liveTab === "orders" && styles.activeLiveTab]}
          onPress={() => onChangeLiveTab("orders")}
        >
          <Text
            style={[
              styles.liveTabText,
              liveTab === "orders" && styles.activeLiveTabText,
            ]}
          >
            ▧ Đơn đã tạo
          </Text>
        </TouchableOpacity>
      </View>

      {liveTab === "live" ? (
        <ScrollView contentContainerStyle={styles.content}>
          <StatsRow
            commentsCount={comments.length}
            buyingCount={buyingCount}
            ordersCount={orders.length}
          />
          <SectionHeader
            title="Comment realtime"
            actionText="Xóa comment"
            onAction={onClearComments}
          />
          {comments.length === 0 ? (
            <View style={styles.empty}>
              <Text style={styles.emptyText}>
                Chưa có comment. Hãy chạy Python SSE server, app sẽ tự kết nối.
              </Text>
            </View>
          ) : (
            comments.map((item) => (
              <CommentCard
                key={item.id}
                item={item}
                onCreateOrder={onCreateOrderFromComment}
              />
            ))
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
            paidCount={paidOrders}
            draftCount={draftOrders}
            confirmedCount={confirmedOrders}
          />
          <ScrollView contentContainerStyle={styles.content}>
            <SectionHeader
              title="Đơn đã tạo"
              actionText="Xóa đơn"
              onAction={onClearOrders}
            />
            {filteredOrders.length === 0 ? (
              <View style={styles.empty}>
                <Text style={styles.emptyText}>Chưa có đơn nào.</Text>
              </View>
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
};

const styles = createStyles(({ colors, textPresets }) => ({
  flex: { flex: 1 },
  history: { flex: 1, padding: 14 },
  liveTabs: {
    minHeight: 58,
    flexDirection: "row",
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.primaryLight,
  },
  liveTab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderBottomWidth: 3,
    borderBottomColor: "transparent",
  },
  activeLiveTab: { borderBottomColor: colors.warningAlt },
  liveTabText: { ...textPresets.fs17_800, color: colors.dustyTealLight },
  activeLiveTabText: { color: colors.warningAlt },
  content: { paddingHorizontal: 12, paddingBottom: 28 },
  empty: { padding: 36, alignItems: "center" },
  emptyText: { color: colors.textMuted, textAlign: "center", lineHeight: 22 },
}));
