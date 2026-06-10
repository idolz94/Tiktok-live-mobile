import { createStyles } from "@utils/createStyles";
import { Text, View } from "react-native";

export const ConnectedLive = () => {
  return (
    <View style={styles.container}>
      <Text>ConnectedLive</Text>
    </View>
  );
};

const styles = createStyles(({}) => ({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
}));
