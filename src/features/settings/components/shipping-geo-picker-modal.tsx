import { GeoPickerState } from "@features/settings/hooks/shipping-address-form.schema";
import { removeDiacritics, VnGeoItem } from "@features/settings/service/vn-geo";
import { useEffect, useMemo, useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";
import { shippingSettingsStyles as styles } from "./shipping-settings.styles";

type GeoPickerModalProps = {
  picker: GeoPickerState;
  onClose: () => void;
  onSelect: (item: VnGeoItem) => void;
};

export function ShippingGeoPickerModal({ picker, onClose, onSelect }: GeoPickerModalProps) {
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (picker) setQuery("");
  }, [picker]);

  const filteredItems = useMemo(() => {
    if (!picker) return [];

    const normalizedQuery = removeDiacritics(query.trim());
    if (!normalizedQuery) return picker.items;

    return picker.items.filter((item) => removeDiacritics(item.name).includes(normalizedQuery));
  }, [picker, query]);

  if (!picker) return null;

  return (
    <View style={styles.geoPickerOverlay}>
      <View style={styles.geoPickerCard}>
        <View style={styles.modalHeader}>
          <Text style={styles.modalTitle}>{picker.title}</Text>
          <TouchableOpacity onPress={onClose} style={styles.modalCloseButton} activeOpacity={0.75}>
            <Text style={styles.modalCloseText}>×</Text>
          </TouchableOpacity>
        </View>

        <TextInput
          value={query}
          onChangeText={setQuery}
          style={styles.geoSearchInput}
          placeholder={picker.placeholder}
          placeholderTextColor="#9ca3af"
        />

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.geoListContent}>
          {filteredItems.map((item) => {
            const selected = item.name === picker.selectedName;

            return (
              <TouchableOpacity
                key={`${item.code}-${item.name}`}
                style={[styles.geoItem, selected && styles.geoItemSelected]}
                activeOpacity={0.75}
                onPress={() => onSelect(item)}
              >
                <Text style={[styles.geoItemText, selected && styles.geoItemTextSelected]}>{item.name}</Text>
                {selected ? <Text style={styles.geoSelectedIcon}>✓</Text> : null}
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>
    </View>
  );
}
