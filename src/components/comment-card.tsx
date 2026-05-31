import { Avatar } from "@components/avatar";
import { LiveComment } from "@types";
import { createStyles } from "@utils/createStyles";
import { formatTime } from "@utils/date";
import { Text, TouchableOpacity, View } from "react-native";

export const CommentCard = ({
  item,
  onCreateOrder,
}: {
  item: LiveComment;
  onCreateOrder: (item: LiveComment) => void;
}) => {
  const isBuying = item.intent === "buying";
  const commentText = item.comment || item.text || "";

  return (
    <View
      style={[styles.card, isBuying ? styles.buyingCard : styles.normalCard]}
    >
      <Avatar uri={item.avatar} username={item.username} size={46} />
      <View style={styles.body}>
        <View style={styles.titleRow}>
          <Text numberOfLines={1} style={styles.username}>
            {item.username || "Unknown user"}
          </Text>
          <View
            style={[styles.tag, isBuying ? styles.buyingTag : styles.normalTag]}
          >
            <Text
              style={[
                styles.tagText,
                isBuying ? styles.buyingText : styles.normalText,
              ]}
            >
              {isBuying ? "Có thể chốt" : "Thường"}
            </Text>
          </View>
        </View>
        <Text style={styles.comment}>{commentText}</Text>
        <View style={styles.footer}>
          <Text style={styles.time}>
            {formatTime(item.created_at || item.createdAt)}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => onCreateOrder(item)}
          >
            <Text style={styles.buttonText}>Tạo đơn</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = createStyles(({ colors, shadows, textPresets }) => ({
  card: {
    marginBottom: 12,
    padding: 14,
    borderRadius: 20,
    borderWidth: 1,
    flexDirection: "row",
    ...shadows.sd1,
  },
  buyingCard: {
    borderColor: colors.successLight,
    backgroundColor: colors.successBgLight,
  },
  normalCard: { borderColor: colors.border, backgroundColor: colors.white },
  body: { flex: 1, marginLeft: 12 },
  titleRow: { flexDirection: "row", alignItems: "center" },
  username: {
    flex: 1,
    color: colors.text,
    marginRight: 8,
    ...textPresets.fs15_900,
  },
  tag: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  buyingTag: { backgroundColor: colors.successBg },
  normalTag: { backgroundColor: colors.surfaceAlt },
  tagText: {
    ...textPresets.fs12_800,
  },
  buyingText: { color: colors.successText },
  normalText: { color: colors.textMuted },
  comment: {
    marginTop: 8,
    color: colors.text,
    ...textPresets.fs16_900,
  },
  footer: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  time: { fontSize: 12, color: colors.textLightMuted },
  button: {
    borderRadius: 12,
    backgroundColor: colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  buttonText: {
    color: colors.white,
    ...textPresets.fs14_800,
  },
}));
