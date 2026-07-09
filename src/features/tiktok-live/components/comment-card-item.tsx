import { Separator } from "@components/separator";
import { createStyles } from "@utils/createStyles";
import { memo, useEffect, useState, type ReactNode } from "react";
import { Text, View } from "react-native";
import { CommentItemProps } from "../types/types";
import { isPriorityComment } from "../utils/comment";
import { CommentCardContent } from "./comment-card-content";
import {
  default as Animated,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

const isOwnComment = (item: CommentItemProps["item"]) => {
  const raw = item?.raw as Record<string, unknown> | undefined;
  const live = String(raw?.liveUsername || "")
    .toLowerCase()
    .replace(/^@/, "");
  const commenter = String(raw?.tiktok_username || raw?.tiktokUsername || "")
    .toLowerCase()
    .replace(/^@/, "");

  return live !== "" && commenter !== "" && live === commenter;
};

const BORDER_RADIUS = 16;
const PULSE_DURATION = 900; // half-cycle: dim→bright→dim over 1800ms total

const PriorityBorder = memo(({ children }: { children: ReactNode }) => {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(1, { duration: PULSE_DURATION, easing: Easing.inOut(Easing.sin) }),
        withTiming(0.3, { duration: PULSE_DURATION, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [opacity]);

  const animatedStyle = useAnimatedStyle(() => ({
    borderColor: `rgba(44, 168, 123, ${opacity.value})`,
  }));

  return (
    <Animated.View style={[styles.borderWrapper, animatedStyle]}>
      {children}
    </Animated.View>
  );
});

const UserJoinedRow = memo(({ username }: { username: string }) => (
  <View style={styles.dividerRow}>
    <Separator type="horizontal" size={1} containerStyle={styles.dividerFlex} />
    <View style={styles.dividerCenter}>
      <Text>New</Text>
      <Text style={styles.dividerText}>{username} đã vào live</Text>
    </View>
    <Separator type="horizontal" size={1} containerStyle={styles.dividerFlex} />
  </View>
));

export const CommentCardItem = memo(
  ({ item, onCreateOrder, onPrintOrder, isCommentOrderCreated }: CommentItemProps) => {
    const [localOrderId, setLocalOrderId] = useState("");
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const isCreatedOrder = Boolean(
      isCommentOrderCreated(item) ||
      item.isOrderCreated ||
      item.orderId ||
      localOrderId,
    );

    const isOwner = item.intent === "user" || isOwnComment(item);

    if (item.type === "user_joined") {
      return (
        <UserJoinedRow
          username={
            item.displayName ??
            item.username ??
            item.customerTikTokName ??
            "Unknown user"
          }
        />
      );
    }

    const hasPriorityBorder = !isOwner && isPriorityComment(item);

    // START create/print order UI flow
    const orderId = localOrderId || item.orderId || "";

    const createOrderFromItem = async () => {
      if (isCreatingOrder || isCreatedOrder) return;

      try {
        setIsCreatingOrder(true);
        const result = await onCreateOrder(item);
        if (result.success) setLocalOrderId(result.orderId);
      } finally {
        setIsCreatingOrder(false);
      }
    };

    const printOrderFromItem = () => {
      onPrintOrder?.(item, orderId);
    };
    // END create/print order UI flow

    const content = (
      <CommentCardContent
        item={item}
        isOwner={isOwner}
        isCreatedOrder={isCreatedOrder}
        isCreatingOrder={isCreatingOrder}
        onCreateOrder={createOrderFromItem}
        onPrintOrder={onPrintOrder ? printOrderFromItem : undefined}
      />
    );

    if (hasPriorityBorder) {
      return <PriorityBorder>{content}</PriorityBorder>;
    }

    return <View style={styles.cardContainer}>{content}</View>;
  },
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.item.intent === next.item.intent &&
    prev.item.aiStatus === next.item.aiStatus &&
    prev.item.finalScore === next.item.finalScore &&
    prev.item.priorityLevel === next.item.priorityLevel &&
    prev.item.isOrderCreated === next.item.isOrderCreated,
);

CommentCardItem.displayName = "CommentCardItem";

const styles = createStyles(({ colors, textPresets }) => ({
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
    paddingTop: 4,
    paddingBottom: 16,
  },
  dividerFlex: {
    flex: 1,
  },
  dividerCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  cardContainer: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.neutral100,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    columnGap: 16,
    backgroundColor: colors.neutral100,
    marginBottom: 8,
  },
  dividerText: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
  },
  borderWrapper: {
    borderWidth: 2,
    borderRadius: BORDER_RADIUS,
    backgroundColor: colors.neutral100,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    columnGap: 16,
    padding: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
}));
