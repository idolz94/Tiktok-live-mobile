import { useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { router } from "expo-router";
import { Icon } from "@components/icon";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { addressLine } from "@features/orders/utils/shipment";
import { useAddressPageStore } from "@features/orders/stores/address-page-store";

export default function AddressPickerPage() {
  const { colors, textPresets } = useThemes();
  const session = useAddressPageStore((state) => state.picker);
  const clearPicker = useAddressPageStore((state) => state.clearPicker);
  const [query, setQuery] = useState("");

  const addresses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return session?.addresses ?? [];
    return (session?.addresses ?? []).filter((item) => `${item.name ?? ""} ${item.phone ?? ""} ${addressLine(item)}`.toLowerCase().includes(q));
  }, [query, session?.addresses]);

  const close = () => {
    clearPicker();
    router.back();
  };

  if (!session) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.neutral100 }]}>
        <View style={styles.centerBox}><Text style={[{ color: colors.neutral500 }, textPresets.fs14_400]}>Không có dữ liệu địa chỉ</Text></View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.neutral100 }]}>
      <View style={styles.header}>
        <Pressable onPress={close} hitSlop={12} style={styles.backButton}>
          <View style={styles.backIcon}><Icon name="arrow_down" size={22} tintColor="neutral900" /></View>
        </Pressable>
        <Text style={[styles.title, { color: colors.neutral900 }, textPresets.fs18_500]}>{session.title}</Text>
        <View style={styles.headerSpacer} />
      </View>

      <View style={[styles.searchBox, { backgroundColor: colors.surface, borderColor: colors.border10 }]}>
        <Icon name="search" size={18} tintColor="neutral400" />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Tìm kiếm địa chỉ"
          placeholderTextColor={colors.neutral400}
          style={[styles.searchInput, { color: colors.neutral900 }, textPresets.fs14_400]}
        />
      </View>

      {session.loading ? (
        <View style={styles.centerBox}><ActivityIndicator color={colors.primary} /></View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={<Text style={[styles.emptyText, { color: colors.neutral400 }, textPresets.fs14_400]}>Chưa có địa chỉ</Text>}
          renderItem={({ item }) => {
            const selected = item.id === session.selectedId;
            return (
              <Pressable
                onPress={() => { session.onSelect(item); close(); }}
                style={[styles.card, { borderColor: selected ? colors.primary : colors.border10, backgroundColor: colors.surface }]}
              >
                <View style={styles.cardTop}>
                  <Text style={[styles.name, { color: colors.neutral900 }, textPresets.fs14_500]}>{item.name ?? "—"}</Text>
                  {item.isDefault ? <View style={[styles.badge, { backgroundColor: colors.primaryLight }]}><Text style={[{ color: colors.primary }, textPresets.fs11_400]}>Mặc định</Text></View> : null}
                  {selected ? <Text style={[{ color: colors.primary }, textPresets.fs14_500]}>✓</Text> : null}
                </View>
                <Text style={[{ color: colors.neutral500 }, textPresets.fs12_400]}>{item.phone ?? "—"}</Text>
                <Text style={[{ color: colors.neutral500 }, textPresets.fs12_400]} numberOfLines={2}>{addressLine(item)}</Text>
                <View style={styles.actions}>
                  <Pressable onPress={(event) => { event.stopPropagation(); session.onEditPress(item); }} hitSlop={8}>
                    <Text style={[{ color: colors.primary }, textPresets.fs12_500]}>Sửa</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <View style={[styles.footer, { backgroundColor: colors.neutral100 }]}>
        <Pressable onPress={session.onAddPress} style={[styles.addButton, { backgroundColor: colors.primary }]}>
          <Text style={[styles.addText, textPresets.fs16_600]}>Thêm địa chỉ mới</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = createStyles(() => ({
  safeArea: { flex: 1 },
  header: { flexDirection: "row" as const, alignItems: "center" as const, paddingHorizontal: 16, paddingVertical: 12 },
  backButton: { width: 40, height: 40, alignItems: "center" as const, justifyContent: "center" as const },
  backIcon: { transform: [{ rotate: "-90deg" }] },
  title: { flex: 1, textAlign: "center" as const },
  headerSpacer: { width: 40 },
  searchBox: { marginHorizontal: 16, height: 44, borderRadius: 12, borderWidth: 1, paddingHorizontal: 12, flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  searchInput: { flex: 1, paddingVertical: 0 },
  centerBox: { flex: 1, alignItems: "center" as const, justifyContent: "center" as const },
  listContent: { padding: 16, paddingBottom: 100, gap: 12 },
  emptyText: { textAlign: "center" as const, paddingVertical: 32 },
  card: { borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  cardTop: { flexDirection: "row" as const, alignItems: "center" as const, gap: 8 },
  name: { flex: 1 },
  badge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  actions: { flexDirection: "row" as const, gap: 16, marginTop: 4 },
  footer: { position: "absolute" as const, left: 0, right: 0, bottom: 0, padding: 16, paddingBottom: 24 },
  addButton: { height: 52, borderRadius: 14, alignItems: "center" as const, justifyContent: "center" as const },
  addText: { color: "#fff" },
}));
