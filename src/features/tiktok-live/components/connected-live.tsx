import { LiveComment } from "@app-types/index";
import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { LinearGradient } from "@components/linear-gradient";
import { Separator } from "@components/separator";
import { useTikTokLiveSocketContext } from "@features/tiktok-live/contexts/tiktok-live-socket";
import { OrderManager } from "@features/orders/hooks/use-order-manager";
import { createOrderCommentKey, isPriorityComment } from "@features/tiktok-live/utils/comment";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useRef, useState } from "react";
import { FlashList } from "@shopify/flash-list";
import { ActivityIndicator, Alert, Image, Text, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

const UserJoinedRow = memo(
  ({ username, avatarUrl }: { username: string; avatarUrl?: string }) => {
    const initial = username.trim().charAt(0).toUpperCase() || "?";

    return (
      <View style={styles.dividerRow}>
        <Separator type="horizontal" size={1} containerStyle={styles.dividerFlex} />
        <View style={styles.dividerCenter}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.joinAvatar} />
          ) : (
            <View style={styles.joinAvatarFallback}>
              <Text style={styles.joinAvatarFallbackText}>{initial}</Text>
            </View>
          )}
          <Text style={styles.dividerText}>{username} đã vào live</Text>
        </View>
        <Separator type="horizontal" size={1} containerStyle={styles.dividerFlex} />
      </View>
    );
  },
);

const CommentActionButton = memo(
  ({
    isCreatedOrder,
    isCreatingOrder,
    onCreateOrder,
    item,
  }: {
    isCreatedOrder: boolean;
    isCreatingOrder: boolean;
    onCreateOrder: (item: LiveComment) => Promise<{ success: boolean; orderId: string }>;
    item: LiveComment;
  }) => {
    if (isCreatedOrder) {
      return (
        <Button
          title="In lại"
          onPress={async () => await onCreateOrder(item)}
          containerStyle={styles.btnCreateOrder}
          txtBtnStyle={styles.txtCreateOrder}
        />
      );
    }

    return (
      <Button
        title={isCreatingOrder ? "Đang tạo" : "Tạo đơn"}
        onPress={async () => await onCreateOrder(item)}
        loadingType={isCreatingOrder ? "center" : undefined}
        containerStyle={styles.btnCreateOrder}
        txtBtnStyle={styles.txtCreateOrder}
        disabled={isCreatingOrder}
      />
    );
  },
);

const CommentCardContent = memo(
  ({
    item,
    onCreateOrder,
    isCreatedOrder,
    isCreatingOrder,
    isOwner,
  }: {
    item: LiveComment;
    onCreateOrder: (item: LiveComment) => Promise<{ success: boolean; orderId: string }>;
    isCreatedOrder: boolean;
    isCreatingOrder: boolean;
    isOwner: boolean;
  }) => {
    return (
      <>
        <View style={styles.leftCard}>
          <Avatar
            uri={item.avatar || item.avatarUrl}
            username={item.displayName ?? item.username ?? "Unknown user"}
            size={40}
          />
          <View style={styles.commentTextGroup}>
            <View style={styles.nameRow}>
              <Text style={styles.nameTiktok}>
                {item.displayName || item.username || "Unknown user"}
              </Text>
              <View style={styles.stickerBadge}>
                <MaterialCommunityIcons name="sticker-emoji" size={12} color="#AD2C4E" />
              </View>
            </View>
            <Text numberOfLines={4} style={styles.comment}>
              {item.comment}
            </Text>
          </View>
        </View>
        {!isOwner && (
          <CommentActionButton
            isCreatedOrder={isCreatedOrder}
            isCreatingOrder={isCreatingOrder}
            onCreateOrder={onCreateOrder}
            item={item}
          />
        )}
      </>
    );
  },
);

const CommentItem = memo(
  ({ item, onCreateOrder, isCommentOrderCreated }: CommentItemProps) => {
    const [isCreatingOrder, setIsCreatingOrder] = useState(false);

    const isCreatedOrder = Boolean(
      isCommentOrderCreated(item) ||
      item.isOrderCreated ||
      item.orderId,
    );

    if (item.type === "user_joined") {
      return (
        <UserJoinedRow
          username={
            item.displayName ??
            item.username ??
            item.customerTikTokName ??
            "Unknown user"
          }
          avatarUrl={item.avatarUrl || item.avatar}
        />
      );
    }

    const rawItem = item?.raw as Record<string, any> | undefined;
    const liveUser = String(rawItem?.liveUsername || "").toLowerCase().replace(/^@/, "");
    const commenter = String(rawItem?.tiktok_username || rawItem?.tiktokUsername || "").toLowerCase().replace(/^@/, "");
    const isOwner = liveUser !== "" && commenter !== "" && liveUser === commenter;
    const hasPriorityBorder = !isOwner && isPriorityComment(item);

    const handleCreateOrder = async (
      commentItem: LiveComment,
    ): Promise<{ success: boolean; orderId: string }> => {
      if (isCreatingOrder || isCreatedOrder) return { success: false, orderId: "" };
      try {
        setIsCreatingOrder(true);
        const result = await onCreateOrder(commentItem);
        return result;
      } catch {
        return { success: false, orderId: "" };
      } finally {
        setIsCreatingOrder(false);
      }
    };

    const cardContent = (
      <CommentCardContent
        item={item}
        onCreateOrder={handleCreateOrder}
        isCreatedOrder={isCreatedOrder}
        isCreatingOrder={isCreatingOrder}
        isOwner={isOwner}
      />
    );

    if (hasPriorityBorder) {
      return (
        <LinearGradient
          type="gra_border_animated"
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradientContainer}
        >
          <View style={styles.innerCardBorderAnimated}>
            {cardContent}
          </View>
        </LinearGradient>
      );
    }

    return (
      <View style={[styles.cardContainer, isOwner && styles.cardContainerOwner]}>
        {cardContent}
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

export const ConnectedLive = memo(
  ({ orderManager, onNavigateToOrders }: ConnectedLiveProps) => {
    const { comments, isConnected } = useTikTokLiveSocketContext();

    const createdCommentKeysRef = useRef<Set<string>>(new Set());

    const isCommentOrderCreated = useCallback((comment: LiveComment) => {
      return Boolean(
        comment.isOrderCreated ||
        comment.orderId ||
        createdCommentKeysRef.current.has(createOrderCommentKey(comment)),
      );
    }, []);

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
        <FlashList
          data={comments}
          renderItem={renderItem}
          keyExtractor={keyExtractor}
          inverted
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  joinAvatar: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  joinAvatarFallback: {
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.primaryLight,
  },
  joinAvatarFallbackText: {
    color: colors.primary,
    ...textPresets.fs10_500,
  },

  // Cards
  cardContainer: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: colors.border10,
    borderRadius: 16,
    overflow: "hidden",
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    columnGap: 16,
    marginBottom: 8,
  },
  cardContainerOwner: {
    opacity: 0.9,
  },
  gradientContainer: {
    borderRadius: 16,
    padding: 1,
    marginBottom: 8,
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
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  stickerBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#FFF0F6",
    alignItems: "center",
    justifyContent: "center",
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
