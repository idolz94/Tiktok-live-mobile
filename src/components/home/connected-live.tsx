import { useTikTokLiveSocketContext } from "@contexts/tiktok-live-socket";
import { useTikTokComments } from "@modules/tiktok-live/hooks/use-tik-tok-comments";
import { createStyles } from "@utils/createStyles";
import { memo } from "react";
import { Text, View, FlatList } from "react-native";

export const ConnectedLive = memo(() => {
  const { comments } = useTikTokLiveSocketContext();

  return (
    <View style={styles.container}>
      <Text>ConnectedLive</Text>
      <FlatList
        data={comments}
        renderItem={({ item }) => <Text>{item.comment}</Text>}
        keyExtractor={(item) => item.id}
      />
    </View>
  );
});

const styles = createStyles(({}) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
