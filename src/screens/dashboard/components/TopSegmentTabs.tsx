import { TopTab } from "@/types";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function TopSegmentTabs({ activeTab, onChange }: { activeTab: TopTab; onChange: (tab: TopTab) => void }) {
  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={[styles.tab, activeTab === "connect" && styles.active]} onPress={() => onChange("connect")}>
        <Text style={[styles.text, activeTab === "connect" && styles.activeText]}>KẾT NỐI LIVE</Text>
      </TouchableOpacity>
      <TouchableOpacity style={[styles.tab, activeTab === "history" && styles.active]} onPress={() => onChange("history")}>
        <Text style={[styles.text, activeTab === "history" && styles.activeText]}>LỊCH SỬ</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { flexDirection: "row", padding: 8, backgroundColor: "#e9fff2" },
  tab: { flex: 1, minHeight: 56, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  active: { backgroundColor: "#fff" },
  text: { fontSize: 16, fontWeight: "900", color: "#8aa09a" },
  activeText: { color: "#273044" }
});
