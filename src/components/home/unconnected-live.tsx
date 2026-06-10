import { IconsTypes } from "@assets/icons";
import { Icon } from "@components/icon";
import { Image } from "@components/image";
import { Separator } from "@components/separator";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import {
  FlatList,
  ListRenderItem,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Rect } from "react-native-svg";
import { fakeDataChannel, FakeDataType } from "./fake";

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

export const UnConnectedLive = ({
  channels,
  onConnect,
}: {
  channels: FakeDataType[];
  onConnect: (item: FakeDataType) => void;
}) => {
  const itemSeparator = () => (
    <Separator
      type="horizontal"
      size={1}
      style={{ paddingVertical: 16, marginLeft: 56 }}
    />
  );

  const renderItem: ListRenderItem<FakeDataType> = ({ item }) => {
    return (
      <View style={styles.itemContainer}>
        <View style={styles.leftItem}>
          <Image source={item.logo} style={styles.avatar} />
          <View style={{ rowGap: 2 }}>
            <Text style={styles.name}>{item.name}</Text>
            <Text style={styles.txtId}>{`ID: ${item.tiktokId}`}</Text>
          </View>
        </View>
        <Pressable onPress={() => onConnect(item)} style={styles.btnConnect}>
          <Text style={styles.txtConnect}>Kết nối</Text>
        </Pressable>
      </View>
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={{ rowGap: 4 }}>
        <Text style={styles.pickAccount}>Chọn tài khoản</Text>
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.description} numberOfLines={2}>
            {fakeDataChannel.length > 0
              ? `Chọn kênh tiktok rồi bấm`
              : `Bạn chưa liên kết kênh TikTok. Hãy`}{" "}
            <Text style={styles.des2Light}>
              {fakeDataChannel.length > 0 ? `"kết nối"` : `"Thêm mới"`}
            </Text>{" "}
            tài khoản để bắt đầu nhận bình luận.
          </Text>
        </View>
      </View>
      {/* call api để lấy data account ở đây */}
      <FlatList
        data={channels}
        scrollEnabled={false}
        keyExtractor={(_, idx) => idx.toString()}
        ItemSeparatorComponent={itemSeparator}
        renderItem={renderItem}
        contentContainerStyle={styles.containerFlatlistStyle}
        ListFooterComponentStyle={{ paddingTop: 16 }}
      />
      <View style={{ rowGap: 8 }}>
        <DashedButton
          title="Thêm mới"
          icon="plus_circle"
          onPress={() => {
            if (channels.length > 0) {
              onConnect(channels[0]);
            }
          }}
        />
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
    flex: 1,
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
  containerFlatlistStyle: {
    borderWidth: 1,
    padding: 16,
    borderColor: colors.border10,
    borderRadius: 16,
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 16,
  },
  leftItem: { columnGap: 16, flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 99 },
  btnConnect: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 40,
    backgroundColor: colors.primaryLight,
  },
  name: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  txtId: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  txtConnect: {
    color: colors.primary,
    ...textPresets.fs14_500,
  },
}));
