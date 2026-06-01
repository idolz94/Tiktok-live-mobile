import { images } from "@/assets/images";
import { Image } from "@/components/image";
import { Separator } from "@components/separator";
import { HairlineWidth } from "@themes";
import { createStyles } from "@utils/createStyles";
import { Dispatch, SetStateAction, useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Pressable, Text, TextInput, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { LoginForm, Mode } from "../type";

type Props = {
  mode: Mode;
  setMode: Dispatch<SetStateAction<Mode>>;
  isLogin: boolean;
  submit: () => void;
};

export const MainContent = ({ mode, setMode, isLogin, submit }: Props) => {
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const {
    control,
    formState: { isValid },
  } = useFormContext<LoginForm>();

  return (
    <KeyboardAwareScrollView
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={styles.banner}>
        <Image
          source={images.logo_banner}
          style={styles.bannerImg}
          resizeMode="contain"
        />
      </View>

      <View style={styles.card}>
        <Text style={styles.title}>Trải nghiệm miễn phí</Text>
        <Pressable
          style={styles.registerButton}
          onPress={() => setMode("register")}
          disabled={mode === "register"}
        >
          <Text style={styles.registerText}>ĐĂNG KÝ NGAY</Text>
        </Pressable>

        <View style={styles.dividerRow}>
          <Separator type="horizontal" size={2} containerStyle={styles.flex} />
          <Text style={styles.dividerText}>hoặc đăng nhập</Text>
          <Separator type="horizontal" size={2} containerStyle={styles.flex} />
        </View>

        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Số điện thoại</Text>
          <View style={styles.inputWrap}>
            <Controller
              control={control}
              name="phone"
              render={({ field: { onChange, value } }) => {
                return (
                  <TextInput
                    value={value}
                    onChangeText={onChange}
                    keyboardType="phone-pad"
                    autoCapitalize="none"
                    placeholder="Nhập số điện thoại"
                    style={styles.input}
                  />
                );
              }}
            />
            <Text style={styles.check}>✓</Text>
          </View>
        </View>

        <View style={{ rowGap: 8 }}>
          <Text style={styles.label}>Mật khẩu</Text>
          <View style={styles.inputWrap}>
            <Controller
              control={control}
              name="password"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  value={value}
                  onChangeText={onChange}
                  secureTextEntry={!isPasswordVisible}
                  placeholder="Nhập mật khẩu"
                  style={styles.input}
                />
              )}
            />
            <Pressable onPress={() => setIsPasswordVisible((value) => !value)}>
              <Text style={styles.eye}>
                {isPasswordVisible ? "Ẩn" : "Hiện"}
              </Text>
            </Pressable>
          </View>
        </View>

        <Controller
          control={control}
          name="remember"
          render={({ field: { onChange, value } }) => (
            <Pressable
              style={styles.rememberRow}
              onPress={() => onChange(!value)}
            >
              <View style={[styles.checkbox, value && styles.checkboxActive]}>
                {value ? <Text style={styles.checkboxText}>✓</Text> : null}
              </View>
              <Text style={styles.rememberText}>Lưu đăng nhập</Text>
            </Pressable>
          )}
        />

        <View style={{ rowGap: 8 }}>
          <Pressable
            style={[styles.submitButton, !isValid && { opacity: 0.5 }]}
            onPress={submit}
          >
            <Text style={styles.submitText}>
              {isLogin ? "ĐĂNG NHẬP" : "ĐĂNG KÝ"}
            </Text>
          </Pressable>
          <Pressable onPress={() => {}}>
            <Text style={styles.forgotPass}>Quên mật khẩu?</Text>
          </Pressable>
        </View>

        <View style={styles.dividerRow}>
          <Separator type="horizontal" size={2} containerStyle={styles.flex} />
          <Text style={styles.dividerText}>Tư vấn</Text>
          <Separator type="horizontal" size={2} containerStyle={styles.flex} />
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
      </View>
    </KeyboardAwareScrollView>
  );
};

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  flex: { flex: 1 },
  banner: {
    borderWidth: HairlineWidth * 2,
    borderColor: colors.white,
    height: 266,
    marginHorizontal: 8,
    borderRadius: 24,
    overflow: "hidden",
    ...shadows.sd1,
  },
  bannerImg: {
    width: "100%",
    height: "100%",
  },
  card: {
    marginTop: -50,
    borderRadius: 24,
    backgroundColor: colors.white,
    marginHorizontal: 18,
    paddingHorizontal: 12,
    paddingVertical: 24,
    rowGap: 16,
    ...shadows.sd2,
  },
  title: {
    textAlign: "center",
    color: colors.text,
    ...textPresets.fs23_900,
  },
  registerButton: {
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: HairlineWidth * 4,
    borderColor: colors.primaryDark,
    backgroundColor: colors.warningBgLight,
    alignItems: "center",
    justifyContent: "center",
  },
  registerText: {
    color: colors.primaryDark,
    ...textPresets.fs18_900,
  },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 10,
  },
  dividerText: {
    color: colors.text,
    ...textPresets.fs14_800,
  },
  label: {
    color: colors.text,
    ...textPresets.fs16_900,
  },
  inputWrap: {
    padding: 12,
    borderRadius: 13,
    borderWidth: HairlineWidth * 3,
    borderColor: colors.text,
    backgroundColor: colors.white,
    flexDirection: "row",
    alignItems: "center",
  },
  input: { flex: 1, color: colors.text, ...textPresets.fs18_700 },
  check: { color: colors.greenSuccess, ...textPresets.fs18_900 },
  eye: { color: colors.primaryDark, ...textPresets.fs18_900 },
  rememberRow: { flexDirection: "row", alignItems: "center", columnGap: 10 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.text,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxActive: {
    backgroundColor: colors.warningAlt,
    borderColor: colors.warningAlt,
  },
  checkboxText: { fontWeight: "900", color: colors.text },
  rememberText: { color: colors.text, ...textPresets.fs15_400 },
  submitButton: {
    paddingVertical: 12,
    borderRadius: 8,
    backgroundColor: colors.warningAlt,
    alignItems: "center",
    justifyContent: "center",
  },
  submitText: { color: colors.text, ...textPresets.fs17_800 },
  toggle: {
    textAlign: "center",
    color: colors.primaryDark,
    ...textPresets.fs14_800,
  },
  forgotPass: {
    color: colors.primaryDark,
    ...textPresets.fs15_400,
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
