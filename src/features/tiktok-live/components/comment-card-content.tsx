import React, { memo, useCallback, useMemo } from "react";
import { View, Text } from "react-native";
import { CommentItemProps } from "../types/types";
import { renderTikTokEmojiTokens } from "./tiktok-emoji-text";
import { Avatar } from "@components/avatar";
import { Button } from "@components/button";
import { createStyles } from "@utils/createStyles";

export const CommentCardContent = memo(
  ({ item, onCreateOrder, disabled }: CommentItemProps) => {
    const handleOnCreateOrder = useCallback(async () => {
      await onCreateOrder(item);
    }, [onCreateOrder, item]);

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
          </View>
        </View>
        <Button
          title="Tạo đơn"
          disabled={disabled}
          onPress={handleOnCreateOrder}
          loadingType="center"
          containerStyle={styles.btnCreateOrder}
          txtBtnStyle={styles.txtCreateOrder}
        />
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
