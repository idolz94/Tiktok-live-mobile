import { images } from "@assets/images";
import { Icon } from "@components/icon";
import { Image } from "@components/image";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { FlatList, ListRenderItem, Pressable, Text, View } from "react-native";
import { TikTokLiveChannel } from "./tiktok-page";

type Props = {
  channels: TikTokLiveChannel[];
  onClose: () => void;
  onSelected: (item: TikTokLiveChannel) => void;
};

export const ListChannels = ({ channels, onClose, onSelected }: Props) => {
  const { colors } = useThemes();

  const _onPressClose = () => {
    if (typeof onClose === "function") {
      onClose();
    }
  };

  const itemSeparator = () => <View style={{ height: 12 }} />;

  const renderItem: ListRenderItem<TikTokLiveChannel> = ({ item }) => {
    return (
      <Pressable onPress={() => onSelected(item)} style={styles.itemContainer}>
        <View style={styles.leftItem}>
          <Image source={images.logo_app} style={styles.avatar} />
          <View>
            <Text style={styles.name}>{item.username}</Text>
            <View style={styles.nameArea}>
              <Image
                source={images.logo_tiktok}
                style={styles.imgLogoBranch}
                tintColor={colors.neutral400}
              />
              <Text style={styles.app}>Tiktok</Text>
            </View>
          </View>
        </View>

        {item.isDefault && <Text>✓</Text>}
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.title}>Chuyển kênh</Text>
        <Pressable style={styles.btnClose} onPress={_onPressClose}>
          <Icon name="close" size={16} tintColor={colors.neutral900} />
        </Pressable>
      </View>
      <FlatList
        data={channels}
        keyExtractor={(item) => item.id}
        ItemSeparatorComponent={itemSeparator}
        renderItem={renderItem}
        ListFooterComponentStyle={{ paddingTop: 16 }}
      />
    </View>
  );
};

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    padding: 16,
    backgroundColor: colors.neutral100,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 16,
  },
  title: {
    flex: 1,
    textAlign: "center",
    paddingLeft: 32,
    color: colors.neutral900,
    ...textPresets.fs18_500,
  },
  btnClose: {
    width: 32,
    height: 32,
    borderRadius: 99,
    overflow: "hidden",
    backgroundColor: colors.neutral50,
    alignItems: "center",
    justifyContent: "center",
  },
  itemContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    columnGap: 16,
    backgroundColor: colors.neutral50,
    padding: 16,
    borderRadius: 16,
  },
  leftItem: { columnGap: 16, flexDirection: "row", alignItems: "center" },
  avatar: { width: 40, height: 40, borderRadius: 99 },
  name: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  app: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  nameArea: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 8,
    rowGap: 2,
  },
  imgLogoBranch: {
    width: 16,
    height: 16,
  },
}));
