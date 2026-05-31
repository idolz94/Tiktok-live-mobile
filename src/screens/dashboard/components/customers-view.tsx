import { Avatar } from "@components/Avatar";
import { CustomerItem } from "@features/customers/customer-mapper";
import { createStyles } from "@utils/createStyles";
import { ScrollView, Text, View } from "react-native";

export const CustomersView = ({ customers }: { customers: CustomerItem[] }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Khách hàng</Text>
      <Text style={styles.subtitle}>
        Khách chỉ được thêm sau khi tạo đơn thành công.
      </Text>
      {customers.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>Chưa có khách hàng.</Text>
        </View>
      ) : (
        customers.map((customer) => (
          <View key={customer.username} style={styles.card}>
            <Avatar
              uri={customer.avatar}
              username={customer.username}
              size={54}
            />
            <View style={styles.info}>
              <Text style={styles.name}>{customer.username}</Text>
              <Text numberOfLines={1} style={styles.comment}>
                {customer.latestComment}
              </Text>
              <View style={styles.badges}>
                <Text style={styles.badge}>
                  {customer.totalComments} comment
                </Text>
                <Text style={styles.badge}>{customer.totalOrders} đơn</Text>
              </View>
            </View>
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
    marginBottom: 16,
    color: colors.textMuted,
    ...textPresets.fs15_900,
  },
  card: {
    marginBottom: 14,
    borderRadius: 20,
    backgroundColor: colors.white,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  info: { flex: 1, marginLeft: 14 },
  name: { color: colors.text, ...textPresets.fs19_900 },
  comment: {
    marginTop: 6,
    ...textPresets.fs15_900,
    color: colors.textDarkGray,
  },
  badges: { flexDirection: "row", marginTop: 10 },
  badge: {
    marginRight: 10,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    color: colors.textDarkGray,
    ...textPresets.fs15_800,
  },
  empty: { padding: 40, alignItems: "center" },
  emptyText: {
    ...textPresets.fs15_800,
    color: colors.textMuted,
  },
}));
