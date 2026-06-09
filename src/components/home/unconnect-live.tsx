import { IconsTypes } from "@assets/icons";
import { Icon } from "@components/icon";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import Svg, { Rect } from "react-native-svg";

function DashedButton({
  title,
  icon,
  onPress,
}: {
  title: string;
  icon?: IconsTypes;
  onPress: () => void;
}) {
  const { colors } = useThemes();

  return (
    <Pressable style={styles.buttonContainer} onPress={onPress}>
      <Svg width="100%" height="100%" style={StyleSheet.absoluteFill}>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx="8"
          ry="8"
          fill="none"
          stroke={colors.border20}
          strokeWidth="2"
          strokeDasharray="4 4"
        />
      </Svg>

      <View style={styles.content}>
        {!!icon && <Icon name={icon} size={24} tintColor={colors.neutral400} />}
        <Text style={styles.title}>{title}</Text>
      </View>
    </Pressable>
  );
}

export const UnConnectLive = ({ onConnect }: { onConnect: () => void }) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ rowGap: 4 }}>
        <Text style={styles.pickAccount}>Chọn tài khoản</Text>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.description} numberOfLines={2}>
            Bạn chưa liên kết kênh TikTok. Hãy{" "}
            <Text style={styles.des2Light}>"Thêm mới"</Text> tài khoản để bắt
            đầu nhận bình luận.
          </Text>
        </View>
      </View>
      {/* call api để lấy data account ở đây */}
      <View style={{ height: 1000, backgroundColor: "red" }} />
      {/* nếu data account rỗng thì hiển thị button add mới */}
      <View style={{ rowGap: 8 }}>
        <DashedButton title="Thêm mới" icon="plus_circle" onPress={onConnect} />
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.desAdd} numberOfLines={2}>
            Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới và dấu
            chấm.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    paddingBottom: 48 + 8,
    paddingTop: 16,
    paddingHorizontal: 16,
    rowGap: 16,
  },
  pickAccount: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
  },
  description: {
    color: colors.neutral900,
    ...textPresets.fs14_400,
  },
  des2Light: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  desAdd: {
    color: colors.neutral900,
    ...textPresets.fs12_400,
  },
  //button dash
  buttonContainer: {
    height: 48,
  },
  content: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    columnGap: 8,
  },
  title: {
    color: colors.neutral400,
    ...textPresets.fs14_400,
  },
}));
