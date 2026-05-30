import { StyleSheet, Text, View } from "react-native";

export default function LiveStatusPill({ isConnected, status }: { isConnected: boolean; status: string }) {
  return (
    <View style={styles.pill}>
      <View style={[styles.dot, isConnected ? styles.dotOn : styles.dotOff]} />
      <Text numberOfLines={1} style={[styles.text, isConnected ? styles.textOn : styles.textOff]}>
        {status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    alignSelf: "center",
    maxWidth: "92%",
    minHeight: 42,
    paddingHorizontal: 18,
    borderRadius: 22,
    backgroundColor: "#fffef6",
    flexDirection: "row",
    alignItems: "center"
  },
  dot: { width: 10, height: 10, borderRadius: 5, marginRight: 10 },
  dotOn: { backgroundColor: "#16a34a" },
  dotOff: { backgroundColor: "#ef4444" },
  text: { fontWeight: "800", fontSize: 14, flexShrink: 1 },
  textOn: { color: "#15803d" },
  textOff: { color: "#b91c1c" }
});
