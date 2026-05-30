import { LiveComment } from "@/types";
import { formatTime } from "@/utils/date";
import Avatar from "@/components/Avatar";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CommentCard({ item, onCreateOrder }: { item: LiveComment; onCreateOrder: (item: LiveComment) => void }) {
  const isBuying = item.intent === "buying";
  const commentText = item.comment || item.text || "";

  return (
    <View style={[styles.card, isBuying ? styles.buyingCard : styles.normalCard]}>
      <Avatar uri={item.avatar} username={item.username} size={46} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.username}>{item.username || "Unknown user"}</Text>
          <View style={[styles.tag, isBuying ? styles.buyingTag : styles.normalTag]}>
            <Text style={[styles.tagText, isBuying ? styles.buyingText : styles.normalText]}>{isBuying ? "Có thể chốt" : "Thường"}</Text>
          </View>
        </View>
        <Text style={styles.comment}>{commentText}</Text>
        <View style={styles.footer}>
          <Text style={styles.time}>{formatTime(item.created_at || item.createdAt)}</Text>
          <TouchableOpacity style={styles.button} onPress={() => onCreateOrder(item)}>
            <Text style={styles.buttonText}>Tạo đơn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    shadowColor: "#0f172a",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 2
  },
  buyingCard: { borderColor: "#86efac", backgroundColor: "#f0fdf4" },
  normalCard: { borderColor: "#e5e7eb", backgroundColor: "#fff" },
  body: { flex: 1, marginLeft: 12 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  username: { flex: 1, fontSize: 15, fontWeight: "900", color: "#273044", marginRight: 8 },
  tag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  buyingTag: { backgroundColor: "#dcfce7" },
  normalTag: { backgroundColor: "#f1f5f9" },
  tagText: { fontSize: 12, fontWeight: "800" },
  buyingText: { color: "#15803d" },
  normalText: { color: "#475569" },
  comment: { marginTop: 8, fontSize: 16, lineHeight: 23, color: "#334155" },
  footer: { marginTop: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  time: { fontSize: 12, color: "#94a3b8" },
  button: { borderRadius: 12, backgroundColor: "#2563eb", paddingHorizontal: 16, paddingVertical: 10 },
  buttonText: { color: "#fff", fontWeight: "900" }
});
