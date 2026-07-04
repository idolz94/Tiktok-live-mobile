import { LiveComment } from "@app-types/index";
import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { createStyles } from "@utils/createStyles";
import { memo, useMemo } from "react";
import { Text, View } from "react-native";
import { renderTikTokEmojiTokens } from "./tiktok-emoji-text";

type CommentCardContentProps = {
  item: LiveComment;
  isOwner: boolean;
  isCreatedOrder: boolean;
  isCreatingOrder: boolean;
  onCreateOrder: () => void;
  onPrintOrder?: () => void;
};

export const CommentCardContent = memo(
  ({
    item,
    isOwner,
    isCreatedOrder,
    isCreatingOrder,
    onCreateOrder,
    onPrintOrder,
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
        {!isOwner && item.intent !== "normal" && item.intent !== "spam" && (
          <Button
            title={isCreatedOrder ? "In lại" : "Tạo đơn"}
            disabled={isCreatedOrder ? !onPrintOrder : isCreatingOrder}
            onPress={isCreatedOrder ? onPrintOrder : onCreateOrder}
            loading={isCreatingOrder}
            loadingType="center"
            containerStyle={styles.btnCreateOrder}
            txtBtnStyle={styles.txtCreateOrder}
          />
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
