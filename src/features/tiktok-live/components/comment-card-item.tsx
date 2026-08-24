import { Separator } from "@components/separator";
import { createStyles } from "@utils/createStyles";
import { memo, useEffect, useMemo, useState, type ReactNode } from "react";
import { StyleSheet, Text, View, type LayoutChangeEvent } from "react-native";
import { Rect, Svg } from "react-native-svg";
import { CommentItemProps } from "../types/types";
import { getIntentBadgeLabel, getIntentGroup } from "../constants/intent";
import { CommentCardContent, type CommentBadge } from "./comment-card-content";
import {
  default as Animated,
  Easing,
  runOnJS,
  useAnimatedProps,
  useSharedValue,
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
const PULSE_DURATION = 500; // half-cycle: dim→bright→dim over 1000ms total

const PriorityBorder = memo(({ children }: { children: ReactNode }) => (
  <View style={styles.borderWrapper}>{children}</View>
));

const ConsultBorder = memo(({ children }: { children: ReactNode }) => (
  <View style={styles.consultBorderWrapper}>{children}</View>
));

// ponytail: tier "sẵn sàng chốt" (score>=75) — viền không còn nháy đổi màu (opacity fade) mà là
// 1 đoạn sáng "chạy đuổi" quanh viền card, vẽ bằng SVG Rect bo góc + strokeDasharray/strokeDashoffset
// animate liên tục. Cần đo width/height thật của card qua onLayout vì chiều cao đổi theo độ dài comment.
const AnimatedRect = Animated.createAnimatedComponent(Rect);
const SWEEP_STROKE_WIDTH = 2;
const SWEEP_DASH_RATIO = 0.28; // đoạn sáng chiếm ~28% chu vi, còn lại trong suốt
const SWEEP_DURATION = 1500; // ms cho 1 vòng chạy hết chu vi

const HotBorder = memo(({ children }: { children: ReactNode }) => {
  const [size, setSize] = useState({ width: 0, height: 0 });
  // ponytail: chỉ flash 1 lần lúc card mới lên tier đỏ (~SWEEP_DURATION), xong tự chuyển về viền đỏ
  // tĩnh — tránh nhiều card cùng chạy đuổi liên tục gây rối mắt khi live đông + nhẹ hiệu năng hơn hẳn
  // so với animate vô hạn trên nhiều item cùng lúc.
  const [settled, setSettled] = useState(false);
  const offset = useSharedValue(0);

  const perimeter = useMemo(() => {
    if (!size.width || !size.height) return 0;
    const r = Math.min(BORDER_RADIUS, size.width / 2, size.height / 2);
    return 2 * (size.width + size.height) - 8 * r + 2 * Math.PI * r;
  }, [size.width, size.height]);

  useEffect(() => {
    if (!perimeter || settled) return;
    offset.value = 0;
    offset.value = withTiming(
      -perimeter,
      { duration: SWEEP_DURATION, easing: Easing.linear },
      (finished) => {
        if (finished) runOnJS(setSettled)(true);
      },
    );
  }, [perimeter, offset, settled]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: offset.value,
  }));

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize((prev) => (prev.width === width && prev.height === height ? prev : { width, height }));
  };

  if (settled) {
    return (
      <View style={styles.hotBorderSettledWrapper} onLayout={onLayout}>
        {children}
      </View>
    );
  }

  const dash = perimeter * SWEEP_DASH_RATIO;
  const rectWidth = Math.max(size.width - SWEEP_STROKE_WIDTH, 0);
  const rectHeight = Math.max(size.height - SWEEP_STROKE_WIDTH, 0);
  const rectRadius = Math.max(BORDER_RADIUS - SWEEP_STROKE_WIDTH / 2, 0);

  return (
    <View style={styles.hotBorderWrapper} onLayout={onLayout}>
      {children}
      {perimeter > 0 && (
        <Svg
          width={size.width}
          height={size.height}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        >
          <Rect
            x={SWEEP_STROKE_WIDTH / 2}
            y={SWEEP_STROKE_WIDTH / 2}
            width={rectWidth}
            height={rectHeight}
            rx={rectRadius}
            ry={rectRadius}
            fill="none"
            stroke="rgba(255, 66, 66, 0.18)"
            strokeWidth={SWEEP_STROKE_WIDTH}
          />
          <AnimatedRect
            x={SWEEP_STROKE_WIDTH / 2}
            y={SWEEP_STROKE_WIDTH / 2}
            width={rectWidth}
            height={rectHeight}
            rx={rectRadius}
            ry={rectRadius}
            fill="none"
            stroke="rgba(255, 66, 66, 1)"
            strokeWidth={SWEEP_STROKE_WIDTH}
            strokeLinecap="round"
            strokeDasharray={`${dash} ${Math.max(perimeter - dash, 0)}`}
            animatedProps={animatedProps}
          />
        </Svg>
      )}
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
  ({ item, onCreateOrder, onPrintOrder, isCommentOrderCreated }: CommentItemProps) => {
    const [localOrderId, setLocalOrderId] = useState("");
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);
    const isCreatedOrder = Boolean(
      isCommentOrderCreated(item) ||
      item.isOrderCreated ||
      item.orderId ||
      localOrderId,
    );

    // Reset localOrderId nếu order đã bị xoá (isCommentOrderCreated trả false và item không có orderId)
    useEffect(() => {
      if (localOrderId && !isCommentOrderCreated(item) && !item.isOrderCreated && !item.orderId) {
        setLocalOrderId("");
      }
    }, [isCommentOrderCreated, item, localOrderId]);

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

    // Tier theo intent group + finalScore:
    // - ready (buy/already_ordered, hoặc intent lạ/không rõ) + score>=75 -> viền đỏ "chạy đuổi" (SVG)
    // - consult (undecided/ask_product_demo) + score>=25 -> border xanh dương tĩnh, không nháy
    // - còn lại (question: ask_price/ask_stock/ask_shipping/ask_how_to_buy/ask_product, hoặc score
    //   25-74 không rõ intent) -> border xanh lá nháy (giữ nguyên hành vi cũ)
    // Badge intent (nếu có) được render ở góc dưới-phải, ngay dưới nút "Tạo đơn" — xem CommentCardContent.
    const score = Number(item.finalScore ?? 0);
    const intentGroup = getIntentGroup(item.intent);
    const isReady = !isOwner && score >= 75 && (intentGroup === "ready" || intentGroup === "none");
    const isConsult = !isOwner && !isReady && score >= 25 && intentGroup === "consult";
    const isQuestion = !isOwner && !isReady && !isConsult && score >= 25;

    let badge: CommentBadge | null = null;
    if (isReady) {
      badge = { label: getIntentBadgeLabel(item.intent) || "Nổi bật", variant: "ready" };
    } else if (isConsult) {
      badge = { label: getIntentBadgeLabel(item.intent) || "Cần tư vấn", variant: "consult" };
    } else if (isQuestion && intentGroup === "question") {
      const label = getIntentBadgeLabel(item.intent);
      if (label) badge = { label, variant: "question" };
    }

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
        badge={badge}
      />
    );

    if (isReady) {
      return <HotBorder>{content}</HotBorder>;
    }

    if (isConsult) {
      return <ConsultBorder>{content}</ConsultBorder>;
    }

    if (isQuestion) {
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
    prev.item.isOrderCreated === next.item.isOrderCreated &&
    prev.isCommentOrderCreated === next.isCommentOrderCreated,
);

CommentCardItem.displayName = "CommentCardItem";
PriorityBorder.displayName = "PriorityBorder";
ConsultBorder.displayName = "ConsultBorder";
HotBorder.displayName = "HotBorder";

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
    borderColor: colors.success,
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
  hotBorderWrapper: {
    borderWidth: 2,
    borderColor: "transparent",
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
  hotBorderSettledWrapper: {
    borderWidth: 2,
    borderColor: colors.error,
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
  consultBorderWrapper: {
    borderWidth: 2,
    borderColor: colors.info,
    borderRadius: BORDER_RADIUS,
    backgroundColor: colors.infoLight,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    columnGap: 16,
    padding: 12,
    overflow: "hidden",
    marginBottom: 8,
  },
}));
