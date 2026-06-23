import type { OrderFilter } from "@app-types/index";
import { Button } from "@components/button";
import { Icon } from "@components/icon";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { memo, useCallback, useState } from "react";
import { Pressable, Text, View } from "react-native";
import { CUSTOMER_BUTTONS, STATUS_BUTTONS } from "../constants";
import {
  CustomerButton,
  FilterChipKey,
  FilterChipProps,
  OrderFilterBarProps,
} from "../types/order";

const FilterChip = memo(
  ({ filterKey, label, isActive, onPress, icon }: FilterChipProps) => {
    const { colors } = useThemes();
    const handlePress = useCallback(
      () => onPress(filterKey),
      [filterKey, onPress],
    );

    return (
      <Pressable
        style={[
          styles.chip,
          {
            borderColor: isActive ? colors.primary : "transparent",
            backgroundColor: isActive ? colors.neutral100 : colors.neutral50,
          },
        ]}
        onPress={handlePress}
      >
        {icon ? (
          <Icon
            name={icon}
            size={22}
            tintColor={
              icon === "king"
                ? undefined
                : isActive
                  ? colors.neutral900
                  : colors.neutral400
            }
          />
        ) : null}
        <Text
          style={[
            styles.chipLabel,
            { color: isActive ? colors.neutral900 : colors.neutral400 },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  },
  (prev, next) =>
    prev.isActive === next.isActive &&
    prev.label === next.label &&
    prev.icon === next.icon &&
    prev.filterKey === next.filterKey,
);

export const OrderFilterBar = memo(
  ({ orderFilter, setOrderFilter, onClose }: OrderFilterBarProps) => {
    const { colors } = useThemes();
    const [draftOrderFilter, setDraftOrderFilter] = useState(orderFilter);
    const [customerFilter, setCustomerFilter] = useState<
      CustomerButton["key"] | null
    >(null);

    const handlePressCustomer = useCallback((key: FilterChipKey) => {
      setCustomerFilter(key as CustomerButton["key"]);
    }, []);

    const handlePressStatus = useCallback((key: FilterChipKey) => {
      setDraftOrderFilter((current) =>
        current === key ? "all" : (key as OrderFilter),
      );
    }, []);

    const handleApply = useCallback(() => {
      setOrderFilter(draftOrderFilter);
      onClose?.();
    }, [draftOrderFilter, onClose, setOrderFilter]);

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Bộ lọc</Text>
          <Pressable style={styles.closeButton} onPress={onClose}>
            <Icon name="close" size={16} tintColor={colors.neutral900} />
          </Pressable>
        </View>

        <View style={{ paddingVertical: 8, paddingHorizontal: 16, rowGap: 20 }}>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Khách hàng</Text>
            <View style={styles.chipRow}>
              {CUSTOMER_BUTTONS.map((item) => (
                <FilterChip
                  key={item.key}
                  filterKey={item.key}
                  label={item.label}
                  icon={item.icon}
                  isActive={customerFilter === item.key}
                  onPress={handlePressCustomer}
                />
              ))}
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Trạng thái</Text>
            <View style={styles.chipRow}>
              {STATUS_BUTTONS.map((item) => (
                <FilterChip
                  key={item.key}
                  filterKey={item.key}
                  label={item.label}
                  isActive={draftOrderFilter === item.key}
                  onPress={handlePressStatus}
                />
              ))}
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Button
            title="Lưu thay đổi"
            loading={false}
            onPress={handleApply}
            disabled={false}
            gradientType="gra_primary"
            containerStyle={styles.btnSave}
          />
        </View>
      </View>
    );
  },
);

const styles = createStyles(({ colors, textPresets }) => ({
  container: {
    flex: 1,
    backgroundColor: colors.neutral100,
  },
  header: {
    paddingVertical: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: colors.neutral900,
    ...textPresets.fs20_600,
  },
  closeButton: {
    position: "absolute",
    right: 24,
    width: 32,
    height: 32,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  section: {
    rowGap: 16,
  },
  sectionTitle: {
    color: colors.neutral500,
    ...textPresets.fs14_400,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  chip: {
    paddingVertical: 9,
    paddingHorizontal: 16,
    borderRadius: 32,
    borderWidth: 1.5,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 10,
  },
  chipLabel: {
    ...textPresets.fs16_400,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingHorizontal: 26,
    paddingTop: 14,
  },
  btnSave: {
    flex: 1,
    borderRadius: 40,
    overflow: "hidden",
  },
}));
