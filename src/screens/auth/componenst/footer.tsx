import { images } from "@/assets/images";
import { Image } from "@/components/image";
import { createStyles } from "@/utils/createStyles";
import { Separator } from "@components/separator";
import { Dispatch, memo, SetStateAction } from "react";
import isEqual from "react-fast-compare";
import { Pressable, Text, View } from "react-native";
import { Mode } from "../type";

type Props = {
  isLogin: boolean;
  setMode: Dispatch<SetStateAction<Mode>>;
};

export const Footer = memo(({ isLogin, setMode }: Props) => {
  return (
    <>
      <View style={styles.dividerRow}>
        <Separator type="horizontal" size={2} containerStyle={{ flex: 1 }} />
        <Text style={styles.dividerText}>Tư vấn</Text>
        <Separator type="horizontal" size={2} containerStyle={{ flex: 1 }} />
      </View>

      <View style={styles.socialContainer}>
        <Pressable>
          <Image source={images.logo_facebook} style={styles.socialIcon} />
        </Pressable>
        <Pressable>
          <Image source={images.logo_zalo} style={styles.socialIcon} />
        </Pressable>
        <Pressable>
          <Image source={images.logo_tiktok} style={styles.socialIcon} />
        </Pressable>
      </View>

      <Pressable
        onPress={() =>
          setMode((current: string) =>
            current === "login" ? "register" : "login",
          )
        }
      >
        <Text style={styles.toggle}>
          {isLogin
            ? "Chưa có tài khoản? Đăng ký"
            : "Đã có tài khoản? Đăng nhập"}
        </Text>
      </Pressable>
    </>
  );
}, isEqual);

const styles = createStyles(({ colors, textPresets }) => ({
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  dividerText: {
    color: colors.text,
    ...textPresets.fs14_800,
  },
  toggle: {
    textAlign: "center",
    color: colors.primaryDark,
    ...textPresets.fs14_800,
  },
  socialContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: 24,
  },
  socialIcon: {
    width: 64,
    height: 64,
  },
}));
