/**
 * DevTipsPreview — overlay preview tip "Nhận xét phiên live" sau 5s vào live.
 * Chỉ render khi __DEV__ && EXPO_PUBLIC_TIPS_PREVIEW === "1" (mock data, không gọi API).
 * Xóa file này + revert 2 dòng trong connected-live.tsx sau khi đã check UI.
 */
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { memo, useEffect, useRef, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

const MOCK_SUMMARY =
  "Phiên hiệu quả — tốc độ bình luận tốt nhưng tỷ lệ chốt còn thấp. Thử ưu đãi phí ship để tăng chuyển đổi.";

const MOCK_HIGHLIGHTS = [
  {
    code: "pace_good",
    level: "good" as const,
    title: "Tốc độ tốt",
    detail: "12 bình luận/phút — duy trì nhịp này.",
  },
  {
    code: "conv_low",
    level: "warning" as const,
    title: "Tỷ lệ chốt thấp",
    detail: "Nhiều câu hỏi chưa chốt đơn — cân nhắc ghim giá.",
    action: "Gợi ý: ghim bảng giá trong live.",
  },
  {
    code: "tip_ship",
    level: "info" as const,
    title: "Gợi ý vận chuyển",
    detail: "Thử giảm phí ship cho đơn trên 200k.",
  },
] as const;

export const DevTipsPreview = memo(function DevTipsPreview() {
  const { colors } = useThemes();
  const enabled = __DEV__ && process.env.EXPO_PUBLIC_TIPS_PREVIEW === "1";
  const [open, setOpen] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!enabled) return;
    timerRef.current = setTimeout(() => setOpen(true), 5000);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [enabled]);

  if (!enabled || !open) return null;

  return (
    <View style={styles.overlay} pointerEvents="box-none">
      <Pressable style={styles.backdrop} onPress={() => setOpen(false)} />
      <View style={styles.bubble}>
        <ScrollView bounces={false} contentContainerStyle={styles.content}>
          <Text style={styles.summary}>{MOCK_SUMMARY}</Text>
          {MOCK_HIGHLIGHTS.map((h, idx) => (
            <View
              key={`${h.code}-${idx}`}
              style={[
                styles.card,
                {
                  backgroundColor:
                    h.level === "good"
                      ? colors.successLight
                      : h.level === "warning"
                        ? colors.warningLight
                        : colors.infoLight,
                },
              ]}
            >
              <Text style={styles.cardTitle}>{h.title}</Text>
              <Text style={styles.cardDetail}>{h.detail}</Text>
              {"action" in h && h.action ? (
                <Text style={styles.cardAction}>{h.action}</Text>
              ) : null}
            </View>
          ))}
          <Text style={styles.hint}>Tap nền mờ để đóng. Flag: EXPO_PUBLIC_TIPS_PREVIEW=1</Text>
        </ScrollView>
      </View>
    </View>
  );
});

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
  },
  backdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.18)",
  },
  bubble: {
    position: "absolute",
    left: 16,
    right: 16,
    top: "22%",
    maxHeight: "70%",
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: 12,
    ...shadows.sd2,
    elevation: 10,
  },
  content: {
    rowGap: 8,
  },
  summary: {
    color: colors.neutral500,
    ...textPresets.fs14_400,
  },
  card: {
    padding: 12,
    borderRadius: 16,
    rowGap: 4,
  },
  cardTitle: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  cardDetail: {
    color: colors.neutral500,
    ...textPresets.fs12_400,
  },
  cardAction: {
    color: colors.neutral500,
    ...textPresets.fs12_500,
  },
  hint: {
    marginTop: 4,
    color: colors.neutral300,
    ...textPresets.fs12_400,
    textAlign: "center",
  },
}));
