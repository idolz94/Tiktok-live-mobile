import Avatar from "@/components/Avatar";
import { CustomerItem } from "@/features/customers/customerMapper";
import { ScrollView, StyleSheet, Text, View } from "react-native";

export default function CustomersView({ customers }: { customers: CustomerItem[] }) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Khách hàng</Text>
      <Text style={styles.subtitle}>Khách chỉ được thêm sau khi tạo đơn thành công.</Text>
      {customers.length === 0 ? (
        <View style={styles.empty}><Text style={styles.emptyText}>Chưa có khách hàng.</Text></View>
      ) : (
        customers.map((customer) => (
          <View key={customer.username} style={styles.card}>
            <Avatar uri={customer.avatar} username={customer.username} size={54} />
            <View style={styles.info}>
              <Text style={styles.name}>{customer.username}</Text>
              <Text numberOfLines={1} style={styles.comment}>{customer.latestComment}</Text>
              <View style={styles.badges}>
                <Text style={styles.badge}>{customer.totalComments} comment</Text>
                <Text style={styles.badge}>{customer.totalOrders} đơn</Text>
              </View>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 18, paddingBottom: 34 },
  title: { fontSize: 26, fontWeight: "900", color: "#273044" },
  subtitle: { marginTop: 8, marginBottom: 16, fontSize: 15, color: "#64748b" },
  card: { marginBottom: 14, borderRadius: 20, backgroundColor: "#fff", padding: 16, flexDirection: "row", alignItems: "center" },
  info: { flex: 1, marginLeft: 14 },
  name: { fontSize: 19, fontWeight: "900", color: "#273044" },
  comment: { marginTop: 6, fontSize: 15, color: "#475569" },
  badges: { flexDirection: "row", marginTop: 10 },
  badge: { marginRight: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 999, backgroundColor: "#f1f5f9", color: "#475569", fontWeight: "800" },
  empty: { padding: 40, alignItems: "center" },
  emptyText: { color: "#64748b", fontWeight: "700" }
});
