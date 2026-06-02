import { BottomTab } from "@app-types/index";
import { createStyles } from "@utils/createStyles";
import { Text, TouchableOpacity, View } from "react-native";

const ITEMS: { key: BottomTab; icon: string; label: string }[] = [
  { key: "home", icon: "⌂", label: "Trang chủ" },
  { key: "customers", icon: "👥", label: "Khách hàng" },
  { key: "shipping", icon: "🚚", label: "Vận đơn" },
  { key: "reports", icon: "▣", label: "Báo cáo" },
  { key: "settings", icon: "⚙", label: "Cài đặt" },
];

export const BottomNav = ({
  active,
  onChange,
}: {
  active: BottomTab;
  onChange: (tab: BottomTab) => void;
}) => {
  return (
    <View style={styles.wrapper}>
      {ITEMS.map((item) => {
        const isActive = active === item.key;
        return (
          <TouchableOpacity
            key={item.key}
            style={styles.item}
            onPress={() => onChange(item.key)}
          >
            <Text style={[styles.icon, isActive && styles.active]}>
              {item.icon}
            </Text>
            <Text style={[styles.label, isActive && styles.active]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = createStyles(({ colors }) => ({
  wrapper: {
    minHeight: 74,
    paddingTop: 8,
    paddingBottom: 10,
    flexDirection: "row",
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  item: { flex: 1, alignItems: "center", justifyContent: "center" },
  icon: { fontSize: 23, color: colors.mediumGray },
  label: {
    marginTop: 2,
    fontSize: 11,
    fontWeight: "800",
    color: colors.mediumGray,
  },
  active: { color: colors.warningAlt },
}));
