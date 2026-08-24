import { LiveComment } from "@app-types/index";
import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { createStyles } from "@utils/createStyles";
import { memo, useEffect, useMemo } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { renderTikTokEmojiTokens } from "./tiktok-emoji-text";

export type CommentBadge = {
  label: string;
  variant: "ready" | "consult" | "question";
};

type CommentCardContentProps = {
  item: LiveComment;
  isOwner: boolean;
  isCreatedOrder: boolean;
  isCreatingOrder: boolean;
  onCreateOrder: () => void;
  onPrintOrder?: () => void;
  // ponytail: badge intent (Chốt đơn/Cần tư vấn/Hỏi giá...) hiển thị ở góc dưới-phải,
  // ngay dưới nút "Tạo đơn" (góc trên-phải) thay vì 1 dải riêng phía trên card.
  badge?: CommentBadge | null;
};

const STAR_PULSE_DURATION = 700;

const PulsingStar = memo(() => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.3, { duration: STAR_PULSE_DURATION, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: STAR_PULSE_DURATION, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.45, { duration: STAR_PULSE_DURATION, easing: Easing.inOut(Easing.ease) }),
        withTiming(1, { duration: STAR_PULSE_DURATION, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    );
  }, [opacity, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Text style={styles.starText}>★</Text>
    </Animated.View>
  );
});

PulsingStar.displayName = "PulsingStar";

const CommentBadgePill = memo(({ badge }: { badge: CommentBadge }) => (
  <View
    style={[
      styles.badgeRow,
      badge.variant === "ready" && styles.badgeRowReady,
      badge.variant === "consult" && styles.badgeRowConsult,
      badge.variant === "question" && styles.badgeRowQuestion,
    ]}
  >
    {badge.variant === "ready" && <PulsingStar />}
    <Text
      style={[
        styles.badgeText,
        badge.variant === "ready" && styles.badgeTextReady,
        badge.variant === "consult" && styles.badgeTextConsult,
        badge.variant === "question" && styles.badgeTextQuestion,
      ]}
    >
      {badge.label}
    </Text>
  </View>
));

CommentBadgePill.displayName = "CommentBadgePill";

export const CommentCardContent = memo(
  ({
    item,
    isOwner,
    isCreatedOrder,
    isCreatingOrder,
    onCreateOrder,
    onPrintOrder,
    badge,
  }: CommentCardContentProps) => {
    const processedText = useMemo(
      () => renderTikTokEmojiTokens(item.comment),
      [item.comment],
    );

    return (
      <>
        <View style={styles.leftCard}>
          <Avatar
            uri={item.avatar || item.avatarUrl}
            username={item.displayName ?? item.username ?? "Unknown user"}
            size={40}
          />
          <View style={styles.commentTextGroup}>
            <Text style={styles.nameTiktok}>
              {item.displayName || item.username || "Unknown user"}
            </Text>
            <Text numberOfLines={4} style={styles.comment}>
              {processedText}
            </Text>
            <Text numberOfLines={4} style={styles.createAtTime}>
              {new Date(item.createdAt ?? "").toLocaleTimeString()}
            </Text>
          </View>
        </View>
        {!isOwner && (
          <View style={styles.rightColumn}>
            <Button
              title={isCreatedOrder ? "In lại" : "Tạo đơn"}
              disabled={isCreatedOrder ? !onPrintOrder : isCreatingOrder}
              onPress={isCreatedOrder ? onPrintOrder : onCreateOrder}
              loading={isCreatingOrder}
              loadingType="center"
              containerStyle={styles.btnCreateOrder}
              txtBtnStyle={styles.txtCreateOrder}
            />
            {badge && <CommentBadgePill badge={badge} />}
          </View>
        )}
      </>
    );
  },
);

CommentCardContent.displayName = "CommentCardContent";

const styles = createStyles(({ colors, textPresets }) => ({
  leftCard: {
    flex: 1,
    columnGap: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  commentTextGroup: {
    rowGap: 8,
    flex: 1,
  },
  nameTiktok: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  comment: {
    color: colors.neutral400,
    ...textPresets.fs14_400,
  },
  createAtTime: {
    color: colors.neutral300,
    ...textPresets.fs12_400,
  },
  rightColumn: {
    alignItems: "flex-end",
    rowGap: 8,
  },
  btnCreateOrder: {
    maxWidth: 80,
    paddingVertical: 7,
    paddingHorizontal: 16,
    backgroundColor: colors.primaryLight,
    borderRadius: 40,
    opacity: 1,
  },
  txtCreateOrder: {
    color: colors.primary,
    ...textPresets.fs12_500,
  },
  badgeRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.neutral100,
  },
  badgeRowReady: {
    borderColor: colors.warning,
  },
  badgeRowConsult: {
    borderColor: colors.info,
  },
  badgeRowQuestion: {
    borderColor: colors.success,
  },
  badgeText: {
    color: colors.neutral500,
    ...textPresets.fs12_500,
  },
  badgeTextReady: {
    color: colors.warning,
  },
  badgeTextConsult: {
    color: colors.info,
  },
  badgeTextQuestion: {
    color: colors.success,
  },
  starText: {
    color: colors.warning,
    fontSize: 13,
    lineHeight: 14,
    fontWeight: "700",
  },
}));
