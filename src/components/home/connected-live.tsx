import { LiveComment } from "@app-types/index";
import { Separator } from "@components/separator";
import { useTikTokLiveSocketContext } from "@contexts/tiktok-live-socket";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback } from "react";
import { Platform, Text, View, FlatList } from "react-native";

interface CommentItemProps {
  item: LiveComment;
}

const CommentItem = memo(
  ({ item }: CommentItemProps) => {
    if (item.type === "user_joined") {
      return (
        <View style={styles.dividerRow}>
          <Separator type="horizontal" size={1} containerStyle={{ flex: 1 }} />
          <View style={{ alignItems: "center", justifyContent: "center" }}>
            <Text>New</Text>
            <Text style={styles.dividerText}>{item.username} đã vào live</Text>
          </View>
          <Separator type="horizontal" size={1} containerStyle={{ flex: 1 }} />
        </View>
      );
    }

    return (
      <View
        style={{
          width: "100%",
          height: 50,
          borderWidth: 1,
          borderRadius: 16,
          overflow: "hidden",
          padding: 16,
        }}
      >
        <Text>{item.comment}</Text>
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

export const ConnectedLive = memo(() => {
  const { comments } = useTikTokLiveSocketContext();

  const keyExtractor = useCallback((item: LiveComment) => item.id, []);

  const renderItem = useCallback(
    ({ item }: { item: LiveComment }) => <CommentItem item={item} />,
    [],
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={comments}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        scrollEnabled
        windowSize={5}
        maxToRenderPerBatch={8}
        updateCellsBatchingPeriod={50}
        initialNumToRender={12}
        removeClippedSubviews={Platform.OS === "ios"}
        inverted={true}
      />
    </View>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    paddingBottom: 100,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
    paddingTop: 4,
  },
  dividerText: {
    color: colors.neutral900,
    ...textPresets.fs12_500,
  },
}));
