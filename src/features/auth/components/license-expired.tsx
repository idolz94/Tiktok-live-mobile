import { Button } from "@components/button";
import { Screen } from "@components/screen";
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
    <Screen>
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
    </Screen>
  );
});

const styles = createStyles(({ colors, textPresets }) => ({
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
