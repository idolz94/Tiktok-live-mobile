import { HairlineWidth } from "@themes/index";
import { createStyles } from "@utils/createStyles";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onClose: () => void;
};

export const AccountConnected = ({ onClose }: Props) => {
  return (
    <View style={styles.container}>
      <Pressable onPress={onClose}>
        <Text>AccountConnected</Text>
      </Pressable>
    </View>
  );
};

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    padding: 16,
    borderBottomWidth: HairlineWidth * 2,
    borderBottomColor: colors.border10,
  },
}));
