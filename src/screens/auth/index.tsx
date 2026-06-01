import { images } from "@/assets/images";
import { Image } from "@/components/image";
import { Screen } from "@/components/screen";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@hooks/use-auth";
import { createStyles } from "@utils/createStyles";
import { BlurView } from "expo-blur";
import { useCallback, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Alert, StyleSheet, View } from "react-native";
import { MainContent } from "./componenst/main-content";
import { LoginForm, LoginSchema, Mode } from "./type";

export const AuthScreen = () => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<Mode>("login");

  const isLogin = mode === "login";

  const formMethod = useForm<LoginForm>({
    mode: "all",
    defaultValues: {
      phone: "0816507286",
      password: "123456",
      remember: true,
    },
    resolver: zodResolver(LoginSchema),
  });

  const submit = useCallback(() => {
    formMethod.handleSubmit(({ phone, password }) => {
      const action = isLogin ? login : register;
      const title = isLogin ? "Đăng nhập thất bại" : "Đăng ký thất bại";

      const result = action(phone, password);

      if (!result.ok) {
        Alert.alert(title, result.message);
      }
    })();
  }, [formMethod, isLogin]);

  return (
    <Screen>
      <View style={styles.safeArea}>
        <Image
          source={images.logo_banner}
          style={styles.imgBlur}
          resizeMode="cover"
        />
        <BlurView
          intensity={50}
          style={StyleSheet.absoluteFill}
          tint="light"
          blurMethod="dimezisBlurViewSdk31Plus"
        />
        <FormProvider {...formMethod}>
          <MainContent
            mode={mode}
            setMode={setMode}
            isLogin={isLogin}
            submit={submit}
          />
        </FormProvider>
      </View>
    </Screen>
  );
};

const styles = createStyles(({ colors }) => ({
  safeArea: {
    flex: 1,
    paddingTop: 40,
    paddingBottom: 10,
  },
  imgBlur: {
    width: "100%",
    height: "100%",
    position: "absolute",
    opacity: 0.5,
  },
}));
