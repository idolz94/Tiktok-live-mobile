import { images } from "@assets/images";
import { Button } from "@components/button";
import { Image } from "@components/image";
import { Separator } from "@components/separator";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useState } from "react";
import {
  FlatList,
  ListRenderItem,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from "react-native";
import { TikTokLiveChannel } from "./tiktok-page";

export const UnConnectedLive = memo(
  ({
    channels,
    onConnect,
    onRefreshChannels,
  }: {
    channels: TikTokLiveChannel[];
    onConnect: (item: TikTokLiveChannel) => Promise<boolean>;
    onRefreshChannels: () => Promise<TikTokLiveChannel[]>;
  }) => {
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);

    const handleRefresh = useCallback(async () => {
      setRefreshing(true);
      try {
        await onRefreshChannels();
      } finally {
        setRefreshing(false);
      }
    }, [onRefreshChannels]);

    const _onConnect = useCallback(
      async (item: TikTokLiveChannel) => {
        setLoadingId(item.id);
        try {
          await onConnect(item);
        } finally {
          setLoadingId(null);
        }
      },
      [onConnect],
    );

    const itemSeparator = () => (
      <Separator
        type="horizontal"
        size={1}
        style={{ paddingVertical: 16, marginLeft: 56 }}
      />
    );

    const renderItem: ListRenderItem<TikTokLiveChannel> = ({ item }) => {
      return (
        <View style={styles.itemContainer}>
          <View style={styles.leftItem}>
            <Image source={images.logo_app} style={styles.avatar} />
            <View style={{ rowGap: 2 }}>
              <Text style={styles.name}>{item.username}</Text>
              <Text style={styles.txtId}>{`ID: @${item.username}`}</Text>
            </View>
          </View>
          <Button
            title="Kết nối"
            onPress={() => _onConnect(item)}
            loadingType="center"
            loading={loadingId === item.id}
            containerStyle={styles.btnConnect}
            txtBtnStyle={styles.txtConnect}
          />
        </View>
      );
    };

    return (
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        <View style={{ rowGap: 4 }}>
          <Text style={styles.pickAccount}>Chọn tài khoản</Text>
          <View style={{ flexShrink: 1 }}>
            <Text style={styles.description} numberOfLines={2}>
              {channels.length > 0
                ? `Chọn kênh tiktok rồi bấm`
                : `Bạn chưa liên kết kênh TikTok. Hãy`}{" "}
              <Text style={styles.des2Light}>
                {channels.length > 0 ? `"kết nối"` : `"Thêm mới"`}
              </Text>{" "}
              tài khoản để bắt đầu nhận bình luận.
            </Text>
          </View>
        </View>
        {/* call api để lấy data account ở đây */}
        {channels?.length > 0 && (
          <FlatList
            data={channels}
            scrollEnabled={false}
            keyExtractor={(item) => item.id}
            ItemSeparatorComponent={itemSeparator}
            renderItem={renderItem}
            contentContainerStyle={styles.containerFlatlistStyle}
            ListFooterComponentStyle={{ paddingTop: 16 }}
          />
        )}
        <View style={{ flexShrink: 1 }}>
          <Text style={styles.desAdd} numberOfLines={2}>
            Tên người dùng chỉ có thể chứa chữ thường, số, dấu gạch dưới và
            dấu chấm.
          </Text>
        </View>
      </ScrollView>
    );
  },
);

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
    maxWidth: 80,
    backgroundColor: colors.primaryLight,
    borderRadius: 40,
    opacity: 1,
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
