import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";
import { VnGeoItem, removeDiacritics } from "@features/settings/service/vn-geo";
import { createStyles } from "@utils/createStyles";

type GeoPickerOverlayProps = {
  title: string;
  items: VnGeoItem[];
  onSelect: (item: VnGeoItem) => void;
  onClose: () => void;
};

export function GeoPickerOverlay({ title, items, onSelect, onClose }: GeoPickerOverlayProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = removeDiacritics(search.trim().toLowerCase());
    return items.filter((item) => removeDiacritics(item.name.toLowerCase()).includes(q));
  }, [items, search]);

  return (
    <View style={geoStyles.card}>
      <View style={geoStyles.handle} />
      <View style={geoStyles.header}>
        <Text style={geoStyles.headerTitle}>{title}</Text>
        <Pressable onPress={onClose} style={geoStyles.closeBtn} hitSlop={8}>
          <Text style={geoStyles.closeBtnText}>×</Text>
        </Pressable>
      </View>
      <TextInput
        style={geoStyles.searchInput}
        value={search}
        onChangeText={(t: string) => setSearch(t)}
        placeholder="Tìm kiếm..."
        placeholderTextColor="#9ca3af"
        autoFocus
      />
      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.code)}
        contentContainerStyle={geoStyles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => { onSelect(item); onClose(); }}
            style={geoStyles.geoRow}
          >
            <Text style={geoStyles.geoRowText}>{item.name}</Text>
          </Pressable>
        )}
        keyboardShouldPersistTaps="handled"
      />
    </View>
  );
}

const geoStyles = createStyles(() => ({
  card: {
    maxHeight: 520,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    overflow: "hidden" as const,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: "#E5E5E5",
    alignSelf: "center" as const,
    marginBottom: 12,
  },
  header: {
    minHeight: 36,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  headerTitle: {
    color: "#000",
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "600" as const,
    textAlign: "center" as const,
  },
  closeBtn: {
    position: "absolute" as const,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f2f2f2",
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  closeBtnText: {
    color: "#000",
    fontSize: 24,
    lineHeight: 28,
  },
  searchInput: {
    height: 44,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#fff",
    marginTop: 16,
    paddingHorizontal: 12,
    fontSize: 14,
    lineHeight: 20,
    color: "#000",
  },
  listContent: {
    paddingTop: 12,
    paddingBottom: 8,
  },
  geoRow: {
    minHeight: 46,
    borderRadius: 10,
    paddingHorizontal: 12,
    justifyContent: "center" as const,
  },
  geoRowText: {
    color: "#111827",
    fontSize: 14,
    lineHeight: 22,
  },
}));
