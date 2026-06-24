import { LiveComment } from "@app-types/index";
import { FlashList } from "@shopify/flash-list";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback } from "react";
import { ActivityIndicator, Text, View } from "react-native";
import { ConnectedLiveProps } from "../types/types";
import { CommentCardItem } from "./comment-card-item";
import { useConnectedLive } from "./use-connected-live";

export const ConnectedLive = memo(
  (props: ConnectedLiveProps) => {
    const { comments, isConnected, listRef, isCommentOrderCreated, handleCreateOrder, handlePrintOrder } =
      useConnectedLive(props);

    const keyExtractor = useCallback((item: LiveComment) => item.id, []);

    const renderItem = useCallback(
      ({ item }: { item: LiveComment }) => (
        <CommentCardItem
          item={item}
          onCreateOrder={handleCreateOrder}
          onPrintOrder={handlePrintOrder}
          isCommentOrderCreated={isCommentOrderCreated}
        />
      ),
      [handleCreateOrder, handlePrintOrder, isCommentOrderCreated],
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
          ref={listRef}
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
  container: {
    flex: 1,
    paddingTop: 12,
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
  loadingText: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
    textAlign: "center",
  },
}));
