import { images } from "@assets/images";
import { Icon } from "@components/icon";
import { Image } from "@components/image";
import { Separator } from "@components/separator";
import { HairlineWidth } from "@themes/index";
import { createStyles } from "@utils/createStyles";
import { Pressable, Text, View } from "react-native";

type Props = {
  onClose: () => void;
};

export const AccountConnected = ({ onClose }: Props) => {
  return (
    <View style={styles.container}>
      <View style={styles.left}>
        <Image source={images.logo_app} style={styles.avatar} />
        <View style={{ rowGap: 2 }}>
          <Text style={styles.name}>Nguyễn Văn A</Text>
          <View style={styles.info}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 4,
              }}
            >
              <Icon name="followers" size={16} tintColor="neutral300" />
              <Text style={styles.textCount}>1.000</Text>
            </View>
            <Separator type="vertical" size={1} />
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                columnGap: 4,
              }}
            >
              <Icon name="heart" size={16} tintColor="neutral300" />
              <Text style={styles.textCount}>1.000</Text>
            </View>
          </View>
        </View>
      </View>
      <View style={styles.right}>
        <Pressable onPress={onClose}>
          <Icon name="disconnect" size={24} tintColor="neutral900" />
        </Pressable>
        <Pressable>
          <Icon name="filter" size={24} tintColor="neutral900" />
        </Pressable>
        <Pressable>
          <Icon name="arrow_down" size={24} tintColor="neutral900" />
        </Pressable>
      </View>
    </View>
  );
};

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.neutral100,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderBottomWidth: HairlineWidth * 2,
    borderBottomColor: colors.border10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  left: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 99,
  },
  name: {
    color: colors.neutral900,
    ...textPresets.fs16_500,
  },
  info: {
    flexDirection: "row",
    columnGap: 12,
    alignItems: "center",
  },
  textCount: {
    color: colors.neutral300,
    ...textPresets.fs12_400,
  },
  right: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
  },
}));
