import { LinearGradient } from "@components/linear-gradient";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Pressable, StyleSheet, Text, View } from "react-native";

type Props = {
  onClose: () => void;
};

export const ForgotPass = ({ onClose }: Props) => {
  const { colors } = useThemes();

  return (
    <View style={styles.container}>
      <View style={styles.headerGroup}>
        <Text style={styles.title}>Quên mật khẩu?</Text>
        <Text style={styles.label}>
          Đừng lo! Hãy liên hệ với chúng tôi đội ngũ Lumi Live sẽ giúp bạn khôi
          phục ngay!
        </Text>
      </View>
      <View style={styles.actionGroup}>
        <Pressable style={styles.btn}>
          <LinearGradient type="gra_primary" style={StyleSheet.absoluteFill} />
          <Text style={styles.textBtn}>Liên hệ ngay</Text>
        </Pressable>
        <Pressable
          style={[styles.btnOutline, { borderColor: colors.border10 }]}
          onPress={onClose}
        >
          <Text style={styles.textBtn}>Bỏ qua</Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    padding: 24,
    backgroundColor: colors.neutral100,
  },
  headerGroup: {
    rowGap: 8,
    marginBottom: 24,
  },
  actionGroup: {
    rowGap: 16,
  },
  title: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
  },
  label: {
    color: colors.neutral400,
    ...textPresets.fs16_400,
  },
  btn: {
    paddingVertical: 12,
    borderRadius: 99,
    overflow: "hidden",
  },
  btnOutline: {
    paddingVertical: 12,
    borderRadius: 99,
    overflow: "hidden",
    borderWidth: 1,
  },
  textBtn: {
    color: colors.neutral900,
    ...textPresets.fs16_500,
    textAlign: "center",
  },
}));
