import { LiveComment } from "@app-types/index";
import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { LinearGradient } from "@components/linear-gradient";
import { Separator } from "@components/separator";
import { useTikTokLiveSocketContext } from "@contexts/tiktok-live-socket";
import { OrderManager } from "@modules/orders/hooks/use-order-manager";
import { createOrderCommentKey, isPriorityComment } from "@utils/comment";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  Text,
  View,
} from "react-native";

interface CommentItemProps {
  item: LiveComment;
  onCreateOrder: (
    item: LiveComment,
  ) => Promise<{ success: boolean; orderId: string }>;
  isCommentOrderCreated: (item: LiveComment) => boolean;
}

export type ConnectedLiveProps = {
  orderManager: OrderManager;
  onNavigateToOrders?: () => void;
};

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

const CommentCardContent = memo(({ item, onCreateOrder }: CommentItemProps) => {
  return (
    <>
      <View style={styles.leftCard}>
        <Avatar
          uri={item.avatar || item.avatarUrl}
          username={item.username}
          size={40}
        />
        <View style={styles.commentTextGroup}>
          <Text style={styles.nameTiktok}>
            {item.displayName || item.username || "Unknown user"}
          </Text>
          <Text numberOfLines={4} style={styles.comment}>
            {item.comment}
          </Text>
        </View>
      </View>
      <Button
        title="Tạo đơn"
        onPress={async () => await onCreateOrder(item)}
        loadingType="center"
        containerStyle={styles.btnCreateOrder}
        txtBtnStyle={styles.txtCreateOrder}
      />
    </>
  );
});

const CommentItem = memo(
  ({ item, onCreateOrder, isCommentOrderCreated }: CommentItemProps) => {
    const [localOrderId, setLocalOrderId] = useState("");

    const isCreatedOrder = Boolean(
      isCommentOrderCreated(item) ||
      item.isOrderCreated ||
      item.orderId ||
      localOrderId,
    );

    if (item.type === "user_joined") {
      return <UserJoinedRow username={item.username} />;
    }

    const isOwner = item?.raw?.liveUsername === item?.raw?.tiktok_username;
    const hasPriorityBorder = !isOwner && isPriorityComment(item);

    const handleCreateOrder = async (
      commentItem: LiveComment,
    ): Promise<{ success: boolean; orderId: string }> => {
      if (isCreatedOrder) return { success: false, orderId: "" };
      try {
        const result = await onCreateOrder(commentItem);
        if (result.success) setLocalOrderId(result.orderId);
        return result;
      } catch {
        return { success: false, orderId: "" };
      }
    };

    if (hasPriorityBorder) {
      return (
        <LinearGradient
          type="gra_border_animated"
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContainer}
        >
          <View style={styles.innerCardBorderAnimated}>
            <CommentCardContent
              item={item}
              onCreateOrder={handleCreateOrder}
              isCommentOrderCreated={isCommentOrderCreated}
            />
          </View>
        </LinearGradient>
      );
    }

    return (
      <View style={styles.cardContainer}>
        <CommentCardContent
          item={item}
          onCreateOrder={handleCreateOrder}
          isCommentOrderCreated={isCommentOrderCreated}
        />
      </View>
    );
  },
  (prev, next) =>
    prev.item.id === next.item.id &&
    prev.item.aiStatus === next.item.aiStatus &&
    prev.item.finalScore === next.item.finalScore &&
    prev.item.priorityLevel === next.item.priorityLevel &&
    prev.item.isOrderCreated === next.item.isOrderCreated,
);

const ItemSeparator = () => <View style={styles.separator} />;

export const ConnectedLive = memo(
  ({ orderManager, onNavigateToOrders }: ConnectedLiveProps) => {
    const { comments, isConnected } =
      useTikTokLiveSocketContext();

    const createdCommentKeysRef = useRef<Set<string>>(new Set());
    const [createdCommentKeys, setCreatedCommentKeys] = useState<Set<string>>(
      new Set(),
    );

    const isCommentOrderCreated = useCallback(
      (comment: LiveComment) => {
        return Boolean(
          comment.isOrderCreated ||
          comment.orderId ||
          createdCommentKeys.has(createOrderCommentKey(comment)),
        );
      },
      [createdCommentKeys],
    );

    const handleCreateOrder = useCallback(
      async (comment: LiveComment) => {
        const commentKey = createOrderCommentKey(comment);

        if (createdCommentKeysRef.current.has(commentKey)) {
          alert("Comment này đã tạo đơn rồi.");
          return { success: false, orderId: "" };
        }

        try {
          createdCommentKeysRef.current.add(commentKey);
          const result = await orderManager.createOrderFromComment(comment);
          setCreatedCommentKeys((prev) => new Set(prev).add(commentKey));

          Alert.alert(
            "Tạo đơn thành công",
            'Di chuyển sang "Đơn đã tạo" để kiểm tra',
            [
              { text: "Huỷ", style: "cancel" },
              { text: "OK", onPress: () => onNavigateToOrders?.() },
            ],
          );

          return { success: true, orderId: result?.orderId ?? "" };
        } catch (error) {
          createdCommentKeysRef.current.delete(commentKey);
          setCreatedCommentKeys((prev) => {
            const next = new Set(prev);
            next.delete(commentKey);
            return next;
          });

          if (__DEV__) console.error("CREATE ORDER ERROR:", error);
          alert(error instanceof Error ? error.message : "Tạo đơn thất bại");

          return { success: false, orderId: "" };
        }
      },
      [orderManager],
    );

    const keyExtractor = useCallback((item: LiveComment) => item.id, []);

    const renderItem = useCallback(
      ({ item }: { item: LiveComment }) => (
        <CommentItem
          item={item}
          onCreateOrder={handleCreateOrder}
          isCommentOrderCreated={isCommentOrderCreated}
        />
      ),
      [handleCreateOrder, isCommentOrderCreated],
    );

    if (isConnected && comments.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" />
          <Text style={styles.loadingText}>
            Đang lấy comment, vui lòng chờ trong giây lát
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <FlatList
          data={comments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          inverted
          scrollEnabled
          windowSize={5}
          maxToRenderPerBatch={8}
          updateCellsBatchingPeriod={50}
          initialNumToRender={12}
          removeClippedSubviews={Platform.OS === "ios"}
          ItemSeparatorComponent={ItemSeparator}
          contentContainerStyle={styles.listContent}
        />
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  // Layout
  container: {
    flex: 1,
    paddingBottom: 48 * 2 - 16,
  },
  listContent: {
    paddingHorizontal: 16,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },

  // Divider row (user_joined)
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

  // Cards
  cardContainer: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    columnGap: 16,
  },
  gradientContainer: {
    borderRadius: 16,
    padding: 1,
  },
  innerCardBorderAnimated: {
    backgroundColor: colors.neutral100,
    borderRadius: 15,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    columnGap: 16,
    padding: 12,
  },

  // Card internals
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
  separator: {
    height: 8,
  },

  // Typography
  loadingText: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
    textAlign: "center",
  },
  dividerText: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
  },
  nameTiktok: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  comment: {
    color: colors.neutral400,
    ...textPresets.fs14_400,
  },

  // Button
  btnCreateOrder: {
    flex: 1,
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
}));
