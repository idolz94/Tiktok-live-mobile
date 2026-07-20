import { Button } from "@components/button";
import { LinearGradient } from "@components/linear-gradient";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { memo, useCallback } from "react";
import { Text, View } from "react-native";
import { useAuth } from "../hooks/use-auth";

export const LicenseExpiredScreen = memo(() => {
  const { logout } = useAuth();

  // START: Logout rồi navigate thẳng về auth thay vì chờ index.tsx re-evaluate
  const handleLogout = useCallback(async () => {
    await logout();
    router.replace("/(auth)");
  }, [logout]);
  // END: Logout rồi navigate thẳng về auth

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <View style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Tài khoản hết hạn</Text>
          <Text style={styles.description}>
            License của bạn đã hết hạn hoặc chưa được kích hoạt. Vui lòng liên
            hệ hỗ trợ để gia hạn.
          </Text>
        </View>
        <Button
          title="Đăng xuất"
          onPress={handleLogout}
          gradientType="gra_primary"
          containerStyle={styles.btnSave}
        />
      </View>
    </View>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
  root: {
    flex: 1,
  },
  bg: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingVertical: 48,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    rowGap: 16,
  },
  title: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
    textAlign: "center",
  },
  description: {
    color: colors.neutral400,
    ...textPresets.fs16_400,
    textAlign: "center",
    lineHeight: 24,
  },
  btnSave: {
    maxHeight: 48,
    borderRadius: 40,
    overflow: "hidden",
  },
}));
