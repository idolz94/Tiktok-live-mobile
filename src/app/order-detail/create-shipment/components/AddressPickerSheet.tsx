import { ActivityIndicator, FlatList, Pressable, Text, View } from "react-native";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Icon } from "@components/icon";
import { ShopAddress, CustomerAddress } from "../create-shipment-api";
import { addressLine } from "../utils";

export type AddressPickerSheetProps<T extends ShopAddress | CustomerAddress> = {
  title: string;
  addresses: T[];
  selectedId?: string | null;
  loading?: boolean;
  onClose: () => void;
  onSelect: (addr: T) => void;
  onAddPress: () => void;
  onEditPress: (addr: T) => void;
  onDeletePress: (addr: T) => void;
};

export function AddressPickerSheet<T extends ShopAddress | CustomerAddress>({
  title,
  addresses,
  selectedId,
  loading,
  onClose,
  onSelect,
  onAddPress,
  onEditPress,
  onDeletePress,
}: AddressPickerSheetProps<T>) {
  const { colors, textPresets } = useThemes();

  return (
    <View style={[pickerStyles.sheet, { backgroundColor: colors.surface }]}>
      <View style={[pickerStyles.handle, { backgroundColor: colors.neutral300 }]} />
      <View style={pickerStyles.header}>
        <Text style={[{ color: colors.neutral900 }, textPresets.fs18_500]}>{title}</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Icon name="close" size={20} tintColor="neutral400" />
        </Pressable>
      </View>

      {loading ? (
        <View style={pickerStyles.loadingBox}>
          <ActivityIndicator color={colors.primary} />
        </View>
      ) : (
        <FlatList
          data={addresses}
          keyExtractor={(item) => item.id}
          contentContainerStyle={pickerStyles.listContent}
          ListEmptyComponent={
            <Text style={[pickerStyles.emptyText, { color: colors.textLightMuted }, textPresets.fs14_400]}>
              Chưa có địa chỉ
            </Text>
          }
          renderItem={({ item }) => {
            const selected = item.id === selectedId;
            return (
              <Pressable
                onPress={() => { onSelect(item); }}
                style={[
                  pickerStyles.row,
                  {
                    borderColor: selected ? colors.primary : colors.border10,
                    backgroundColor: selected ? colors.primaryLight : colors.neutral50,
                  },
                ]}
              >
                <View style={pickerStyles.rowContent}>
                  <View style={pickerStyles.nameLine}>
                    <Text style={[{ color: colors.neutral900 }, textPresets.fs14_500]}>
                      {item.name ?? "—"}
                    </Text>
                    {item.isDefault && (
                      <View style={[pickerStyles.badge, { backgroundColor: colors.primaryLight }]}>
                        <Text style={[{ color: colors.primary }, textPresets.fs11_400]}>Mặc định</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[{ color: colors.neutral500 }, textPresets.fs12_400]}>{item.phone ?? "—"}</Text>
                  <Text style={[{ color: colors.neutral500 }, textPresets.fs12_400]} numberOfLines={2}>
                    {addressLine(item)}
                  </Text>
                </View>
                <View style={pickerStyles.actions}>
                  <Pressable onPress={(event) => { event.stopPropagation(); onClose(); setTimeout(() => onEditPress(item), 350); }} hitSlop={8}>
                    <Text style={[{ color: colors.primary }, textPresets.fs12_500]}>Sửa</Text>
                  </Pressable>
                  <Pressable onPress={(event) => { event.stopPropagation(); onDeletePress(item); }} hitSlop={8}>
                    <Text style={[{ color: colors.error }, textPresets.fs12_500]}>Xoá</Text>
                  </Pressable>
                </View>
              </Pressable>
            );
          }}
        />
      )}

      <Pressable
        onPress={() => { onClose(); setTimeout(onAddPress, 350); }}
        style={[pickerStyles.addButton, { borderColor: colors.primary }]}
      >
        <Icon name="plus_circle" size={18} tintColor="primary" />
        <Text style={[{ color: colors.primary }, textPresets.fs14_500]}>Thêm địa chỉ mới</Text>
      </Pressable>
    </View>
  );
}

const pickerStyles = createStyles(() => ({
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 32,
    maxHeight: 520,
    overflow: "hidden" as const,
  },
  handle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: "center" as const,
    marginTop: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  loadingBox: {
    minHeight: 160,
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 10,
  },
  row: {
    flexDirection: "row" as const,
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    gap: 12,
  },
  rowContent: { flex: 1, gap: 3 },
  nameLine: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    flexWrap: "wrap" as const,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actions: {
    alignItems: "flex-end" as const,
    justifyContent: "center" as const,
    gap: 10,
  },
  emptyText: {
    textAlign: "center" as const,
    paddingVertical: 24,
  },
  addButton: {
    marginTop: 8,
    marginHorizontal: 20,
    height: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed" as const,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    gap: 8,
  },
}));
