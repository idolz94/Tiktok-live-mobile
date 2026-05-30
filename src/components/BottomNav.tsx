import { BottomTab } from "@/types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const ITEMS: { key: BottomTab; icon: string; label: string }[] = [
  { key: "home", icon: "⌂", label: "Trang chủ" },
  { key: "customers", icon: "👥", label: "Khách hàng" },
  { key: "shipping", icon: "🚚", label: "Vận đơn" },
  { key: "reports", icon: "▣", label: "Báo cáo" },
  { key: "settings", icon: "⚙", label: "Cài đặt" }
];

export default function BottomNav({ active, onChange }: { active: BottomTab; onChange: (tab: BottomTab) => void }) {
  return (
    <View style={styles.wrapper}>
      {ITEMS.map((item) => {
        const isActive = active === item.key;
        return (
          <TouchableOpacity key={item.key} style={styles.item} onPress={() => onChange(item.key)}>
            <Text style={[styles.icon, isActive && styles.active]}>{item.icon}</Text>
            <Text style={[styles.label, isActive && styles.active]}>{item.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    minHeight: 74,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb"
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 23, color: "#9ca3af" },
  label: { marginTop: 2, fontSize: 11, fontWeight: "800", color: "#9ca3af" },
  active: { color: "#f2c300" }
});
