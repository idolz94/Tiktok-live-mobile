import { VnGeoItem, removeDiacritics } from "@features/settings/service/vn-geo";
import { createStyles } from "@utils/createStyles";
import { useMemo, useState } from "react";
import { FlatList, Pressable, Text, TextInput, View } from "react-native";

type GeoPickerSheetProps = {
  title: string;
  items: VnGeoItem[];
  selectedName?: string;
  placeholder?: string;
  onSelect: (item: VnGeoItem) => void;
  onClose: () => void;
};

export function GeoPickerSheet({
  title,
  items,
  selectedName,
  placeholder = "Tìm kiếm...",
  onSelect,
  onClose,
}: GeoPickerSheetProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = removeDiacritics(search.trim().toLowerCase());
    if (!q) return items;

    return items.filter((item) => removeDiacritics(item.name.toLowerCase()).includes(q));
  }, [items, search]);

  return (
    <View style={styles.card}>
      <View style={styles.handle} />
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{title}</Text>
        <Pressable onPress={onClose} style={styles.closeBtn} hitSlop={8}>
          <Text style={styles.closeBtnText}>×</Text>
        </Pressable>
      </View>

      <TextInput
        style={styles.searchInput}
        value={search}
        onChangeText={setSearch}
        placeholder={placeholder}
        placeholderTextColor="#9ca3af"
        autoFocus
      />

      <FlatList
        data={filtered}
        keyExtractor={(item) => String(item.code)}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => {
          const selected = item.name === selectedName;

          return (
            <Pressable
              onPress={() => {
                onSelect(item);
                onClose();
              }}
              style={[styles.geoRow, selected && styles.geoRowSelected]}
            >
              <Text style={[styles.geoRowText, selected && styles.geoRowTextSelected]}>{item.name}</Text>
              {selected ? <Text style={styles.geoSelectedIcon}>✓</Text> : null}
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = createStyles(() => ({
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
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    gap: 12,
  },
  geoRowSelected: { backgroundColor: "#fff7e6" },
  geoRowText: {
    flex: 1,
    color: "#111827",
    fontSize: 14,
    lineHeight: 22,
  },
  geoRowTextSelected: { color: "#c47f00", fontWeight: "600" as const },
  geoSelectedIcon: { color: "#ebb140", fontSize: 16, lineHeight: 20, fontWeight: "700" as const },
}));
