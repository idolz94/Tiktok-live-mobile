import { Order } from "@types";
import { createStyles } from "@utils/createStyles";
import { ScrollView, Text, View } from "react-native";

export const ShippingView = ({ orders }: { orders: Order[] }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Vận đơn</Text>
      <Text style={styles.subtitle}>
        Danh sách đơn có thể tạo vận đơn sau khi chốt.
      </Text>
      {orders.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Chưa có đơn để giao.</Text>
        </View>
      ) : (
        orders.map((order) => (
          <View key={order.id} style={styles.card}>
            <Text style={styles.name}>{order.username}</Text>
            <Text numberOfLines={2} style={styles.comment}>
              {order.comment}
            </Text>
            <Text style={styles.status}>
              {order.status === "confirmed" ? "Đã chốt" : "Đơn nháp"}
            </Text>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  container: { padding: 18, paddingBottom: 34 },
  title: { color: colors.text, ...textPresets.fs26_900 },
  subtitle: {
    marginTop: 8,
    marginBottom: 18,
    color: colors.textMuted,
    ...textPresets.fs15_400,
  },
  card: {
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: colors.white,
    padding: 16,
  },
  name: { color: colors.text, ...textPresets.fs18_900 },
  comment: { marginTop: 6, color: colors.textDarkGray, lineHeight: 22 },
  status: { marginTop: 10, color: colors.warning, ...textPresets.fs15_900 },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: colors.textMuted, ...textPresets.fs15_800 },
}));
