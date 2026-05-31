import { OrderFilter } from "@types";
import { createStyles } from "@utils/createStyles";
import {
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

type FilterItem = { key: OrderFilter; label: string; count?: number };

export const OrderFilterBar = ({
  searchText,
  onChangeSearch,
  activeFilter,
  onChangeFilter,
  productCount,
  unpaidCount,
  paidCount,
  draftCount,
  confirmedCount,
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
}) => {
  const filters: FilterItem[] = [
    { key: "all", label: "Tất cả", count: productCount },
    { key: "unpaid", label: "Chưa cọc", count: unpaidCount },
    { key: "paid", label: "Đã cọc", count: paidCount },
    { key: "draft", label: "Nháp", count: draftCount },
    { key: "confirmed", label: "Đã chốt", count: confirmedCount },
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
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterList}
      >
        {filters.map((item) => {
          const active = activeFilter === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.filter, active && styles.activeFilter]}
              onPress={() => onChangeFilter(item.key)}
            >
              <Text style={[styles.filterText, active && styles.activeText]}>
                {item.label} {item.count ?? 0}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  wrapper: {
    backgroundColor: colors.white,
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  input: {
    minHeight: 44,
    borderWidth: 1,
    borderColor: colors.borderLight,
    borderRadius: 12,
    paddingHorizontal: 12,
    fontSize: 15,
    color: colors.text,
    backgroundColor: colors.surface,
  },
  filterList: { paddingTop: 10, paddingBottom: 2 },
  filter: {
    marginRight: 8,
    borderRadius: 999,
    backgroundColor: colors.surfaceAlt,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  activeFilter: { backgroundColor: colors.warningAlt },
  filterText: {
    color: colors.textDarkGray,
    ...textPresets.fs12_800,
  },
  activeText: { color: colors.text },
}));
