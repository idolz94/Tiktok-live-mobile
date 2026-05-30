import { OrderFilter } from "@/types";
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

type FilterItem = { key: OrderFilter; label: string; count?: number };

export default function OrderFilterBar({
  searchText,
  onChangeSearch,
  activeFilter,
  onChangeFilter,
  productCount,
  unpaidCount,
  paidCount,
  draftCount,
  confirmedCount
}: {
  searchText: string;
  onChangeSearch: (value: string) => void;
  activeFilter: OrderFilter;
  onChangeFilter: (filter: OrderFilter) => void;
  productCount: number;
  unpaidCount: number;
  paidCount: number;
  draftCount: number;
  confirmedCount: number;
}) {
  const filters: FilterItem[] = [
    { key: "all", label: "Tất cả", count: productCount },
    { key: "unpaid", label: "Chưa cọc", count: unpaidCount },
    { key: "paid", label: "Đã cọc", count: paidCount },
    { key: "draft", label: "Nháp", count: draftCount },
    { key: "confirmed", label: "Đã chốt", count: confirmedCount }
  ];

  return (
    <View style={styles.wrapper}>
      <TextInput
        style={styles.input}
        value={searchText}
        onChangeText={onChangeSearch}
        placeholder="Tìm đơn hàng..."
        placeholderTextColor="#94a3b8"
      />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterList}>
        {filters.map((item) => {
          const active = activeFilter === item.key;
          return (
            <TouchableOpacity key={item.key} style={[styles.filter, active && styles.activeFilter]} onPress={() => onChangeFilter(item.key)}>
              <Text style={[styles.filterText, active && styles.activeText]}>{item.label} {item.count ?? 0}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#e5e7eb" },
  input: { minHeight: 44, borderWidth: 1, borderColor: "#e2e8f0", borderRadius: 12, paddingHorizontal: 12, fontSize: 15, color: "#273044", backgroundColor: "#f8fafc" },
  filterList: { paddingTop: 10, paddingBottom: 2 },
  filter: { marginRight: 8, borderRadius: 999, backgroundColor: "#f1f5f9", paddingHorizontal: 12, paddingVertical: 8 },
  activeFilter: { backgroundColor: "#f2c300" },
  filterText: { color: "#475569", fontWeight: "800" },
  activeText: { color: "#273044" }
});
