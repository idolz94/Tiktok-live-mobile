import { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Header } from "@components/header";
import { Icon } from "@components/icon";
import { LinearGradient } from "@components/linear-gradient";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { addressLine } from "@features/orders/utils/shipment";
import { useAddressPageStore } from "@features/orders/stores/address-page-store";

export default function AddressPickerPage() {
  const { colors, textPresets } = useThemes();
  const { bottom } = useSafeAreaInsets();
  const session = useAddressPageStore((state) => state.picker);
  const clearPicker = useAddressPageStore((state) => state.clearPicker);
  const [query, setQuery] = useState("");
  // Cờ chặn double-back: khi close() chủ động clearPicker() làm session=null,
  // effect bên dưới không được back thêm lần nữa (đã back trong close()).
  const closingRef = useRef(false);

  useEffect(() => {
    if (!session && !closingRef.current) router.back();
  }, [session]);

  const addresses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return session?.addresses ?? [];
    return (session?.addresses ?? []).filter((item) =>
      `${item.name ?? ""} ${item.phone ?? ""} ${addressLine(item)}`
        .toLowerCase()
        .includes(q),
    );
  }, [query, session?.addresses]);

  const close = () => {
    closingRef.current = true;
    clearPicker();
    router.back();
  };

  if (!session) {
    return (
      <View style={styles.root}>
        <LinearGradient
          type="gra_background"
          style={styles.bg}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
        />
        <Header onBackPress={close} transparent />
        <View style={styles.centerBox}>
          <Text style={[{ color: colors.neutral500 }, textPresets.fs14_400]}>
            Không có dữ liệu địa chỉ
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.bg}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Header title={session.title} onBackPress={close} transparent />

      <View
        style={[
          styles.searchBox,
          { backgroundColor: colors.surface, borderColor: colors.border10 },
        ]}
      >
        <Icon name="search" size={18} tintColor="neutral400" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm kiếm địa chỉ"
          placeholderTextColor={colors.neutral400}
          style={[
            styles.searchInput,
            { color: colors.neutral900 },
            textPresets.fs14_400,
          ]}
        />
      </View>

      {session.loading ? (
        <View style={styles.centerBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <Text
              style={[
                styles.emptyText,
                { color: colors.neutral400 },
                textPresets.fs14_400,
              ]}
            >
              Chưa có địa chỉ
            </Text>
          }
          renderItem={({ item }) => {
            const selected = item.id === session.selectedId;
            return (
              <Pressable
                onPress={() => {
                  session.onSelect(item);
                  close();
                }}
                style={[
                  styles.card,
                  {
                    borderColor: selected ? colors.primary : colors.border10,
                    backgroundColor: colors.surface,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <Text
                    style={[
                      styles.name,
                      { color: colors.neutral900 },
                      textPresets.fs14_500,
                    ]}
                  >
                    {item.name ?? "—"}
                  </Text>
                  {item.isDefault ? (
                    <View
                      style={[
                        styles.badge,
                        { backgroundColor: colors.primaryLight },
                      ]}
                    >
                      <Text
                        style={[
                          { color: colors.primary },
                          textPresets.fs11_400,
                        ]}
                      >
                        Mặc định
                      </Text>
                    </View>
                  ) : null}
                  {selected ? (
                    <Text
                      style={[{ color: colors.primary }, textPresets.fs14_500]}
                    >
                      ✓
                    </Text>
                  ) : null}
                </View>
                <Text
                  style={[{ color: colors.neutral500 }, textPresets.fs12_400]}
                >
                  {item.phone ?? "—"}
                </Text>
                <Text
                  style={[{ color: colors.neutral500 }, textPresets.fs12_400]}
                  numberOfLines={2}
                >
                  {addressLine(item)}
                </Text>
                <View style={styles.actions}>
                  <Pressable
                    onPress={(event) => {
                      event.stopPropagation();
                      session.onEditPress(item);
                    }}
                    hitSlop={8}
                  >
                    <Text
                      style={[{ color: colors.primary }, textPresets.fs12_500]}
                    >
                      Sửa
                    </Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <View
        style={[
          styles.footer,
          {
            backgroundColor: colors.neutral100,
            paddingBottom: Math.max(bottom, 16),
          },
        ]}
      >
        <Pressable
          onPress={session.onAddPress}
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Text style={[styles.addText, textPresets.fs16_600]}>
            Thêm địa chỉ mới
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = createStyles(() => ({
  root: { flex: 1 },
  bg: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  searchBox: {
    marginHorizontal: 16,
    height: 44,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  searchInput: { flex: 1, paddingVertical: 0 },
  centerBox: { flex: 1, alignItems: "center", justifyContent: "center" },
  listContent: { padding: 16, paddingBottom: 100, gap: 12 },
  emptyText: { textAlign: "center", paddingVertical: 32 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  cardTop: { flexDirection: "row", alignItems: "center", gap: 8 },
  name: { flex: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  actions: { flexDirection: "row", gap: 16, marginTop: 4 },
  footer: { position: "absolute", left: 0, right: 0, bottom: 0, padding: 16 },
  addButton: {
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  addText: { color: "#fff" },
}));
