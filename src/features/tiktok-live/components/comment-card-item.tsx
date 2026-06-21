import { LiveComment } from "@app-types/index";
import { Separator } from "@components/separator";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useEffect, useState, type ReactNode } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";
import { CommentItemProps } from "../types/types";
import { isPriorityComment } from "../utils/comment";
import { CommentCardContent } from "./comment-card-content";
import {
  default as Animated,
  Easing,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withTiming,
} from "react-native-reanimated";

const AnimatedRect = Animated.createAnimatedComponent(Rect);

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
const STROKE_WIDTH = 2;
const SWEEP_FRACTION = 0.22;
const SWEEP_DURATION = 2400;

const PriorityBorder = memo(({ children }: { children: ReactNode }) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const dashOffset = useSharedValue(0);

  const onLayout = useCallback((e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  }, []);

  // Perimeter of a rounded rect: 2*(w+h) - 8*r + 2*pi*r
  const perimeter =
    size.width > 0 && size.height > 0
      ? 2 * (size.width + size.height) -
        8 * BORDER_RADIUS +
        2 * Math.PI * BORDER_RADIUS
      : 0;

  const sweepLength = perimeter * SWEEP_FRACTION;

  useEffect(() => {
    if (perimeter <= 0) return;
    dashOffset.value = 0;
    dashOffset.value = withRepeat(
      withTiming(-perimeter, {
        duration: SWEEP_DURATION,
        easing: Easing.linear,
      }),
      -1,
      false,
    );
  }, [perimeter, dashOffset]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: dashOffset.value,
  }));
  // Three overlapping dashes, same dashoffset (same center point) but
  // different length/opacity, layered wide-dim -> narrow-bright so the
  // result reads as a round glow with a bright core, fading evenly to
  // both sides — not a comet tail. Order matters: SVG paints later
  // siblings on top, so the narrowest/brightest layer must come last.
  const tail = [
    {
      lengthFactor: 1,
      color: "#2CA87B",
      opacity: 0.25,
      width: STROKE_WIDTH + 3,
    },
    {
      lengthFactor: 0.6,
      color: "#FFA66D",
      opacity: 0.55,
      width: STROKE_WIDTH + 1.5,
    },
    { lengthFactor: 0.3, color: "#FF6B8A", opacity: 1, width: STROKE_WIDTH },
  ];

  return (
    <View style={styles.borderWrapper} onLayout={onLayout}>
      {perimeter > 0 && (
        <Svg
          style={StyleSheet.absoluteFill}
          width={size.width}
          height={size.height}
        >
          {tail.map((seg, i) => (
            <AnimatedRect
              key={i}
              x={STROKE_WIDTH / 2}
              y={STROKE_WIDTH / 2}
              width={Math.max(size.width - STROKE_WIDTH, 0)}
              height={Math.max(size.height - STROKE_WIDTH, 0)}
              rx={BORDER_RADIUS - STROKE_WIDTH / 2}
              ry={BORDER_RADIUS - STROKE_WIDTH / 2}
              fill="none"
              stroke={seg.color}
              strokeOpacity={seg.opacity}
              strokeWidth={seg.width}
              strokeDasharray={`${sweepLength * seg.lengthFactor} ${Math.max(
                perimeter - sweepLength * seg.lengthFactor,
                0,
              )}`}
              strokeLinecap="round"
              animatedProps={animatedProps}
            />
          ))}
        </Svg>
      )}
      <View style={styles.innerCardBorderAnimated}>{children}</View>
    </View>
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
  ({ item, onCreateOrder, isCommentOrderCreated }: CommentItemProps) => {
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

    const handleCreateOrder = async (
      commentItem: LiveComment,
    ): Promise<{ success: boolean; orderId: string }> => {
      if (isCreatingOrder || isCreatedOrder)
        return { success: false, orderId: "" };
      try {
        setIsCreatingOrder(true);
        const result = await onCreateOrder(commentItem);
        if (result.success) setLocalOrderId(result.orderId);
        return result;
      } catch {
        return { success: false, orderId: "" };
      } finally {
        setIsCreatingOrder(false);
      }
    };

    const content = (
      <CommentCardContent
        item={item}
        onCreateOrder={handleCreateOrder}
        isCommentOrderCreated={isCommentOrderCreated}
        disabled={isCreatingOrder}
      />
    );

    if (hasPriorityBorder) {
      return <PriorityBorder>{content}</PriorityBorder>;
    }

    return <View style={styles.cardContainer}>{content}</View>;
  },
  (prev, next) =>
    prev.item.id === next.item.id &&
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
    position: "relative",
    borderRadius: BORDER_RADIUS,
    marginBottom: 8,
  },
  innerCardBorderAnimated: {
    margin: STROKE_WIDTH,
    borderRadius: BORDER_RADIUS - STROKE_WIDTH,
    backgroundColor: colors.neutral100,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    columnGap: 16,
    padding: 12,
    overflow: "hidden",
  },
}));
