import { Ionicons } from "@expo/vector-icons";
import { Button } from "@components/button";
import { ButtonType } from "@components/button/type";
import { Header } from "@components/header";
import { LinearGradient } from "@components/linear-gradient";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { useState } from "react";
import { ScrollView, Switch, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const TYPES: { type: ButtonType; label: string; sample: string }[] = [
  { type: "gradient", label: "gradient", sample: "Lưu" },
  { type: "soft", label: "soft", sample: "Gộp đơn" },
  { type: "outline", label: "outline", sample: "Tổng đơn hàng" },
  { type: "outline-dashed", label: "outline-dashed", sample: "Thêm mới" },
];

export function ButtonDemoScreen() {
  const { colors } = useThemes();
  const { bottom } = useSafeAreaInsets();

  const [loading, setLoading] = useState(false);

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.background}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      <Header title="Button Demo" transparent />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Loading state</Text>
          <Switch value={loading} onValueChange={setLoading} />
        </View>

        {TYPES.map(({ type, label, sample }) => (
          <View key={type} style={styles.section}>
            <Text style={styles.sectionTitle}>{label}</Text>

            <DemoRow label="Default">
              <Button type={type} title={sample} loading={loading} />
            </DemoRow>

            <DemoRow label="With icon">
              <Button
                type={type}
                title={sample}
                loading={loading}
                icon={
                  <Ionicons
                    name="add"
                    size={18}
                    color={
                      type === "soft" ? colors.primary : colors.neutral500
                    }
                  />
                }
              />
            </DemoRow>

            <DemoRow label="Disabled">
              <Button type={type} title={sample} disabled />
            </DemoRow>

            <DemoRow label="Loading · side">
              <Button type={type} title={sample} loading loadingType="side" />
            </DemoRow>

            <DemoRow label="Loading · center">
              <Button
                type={type}
                title={sample}
                loading
                loadingType="center"
              />
            </DemoRow>
          </View>
        ))}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>no type (base)</Text>
          <DemoRow label="gradientType only">
            <Button
              title="Tổng quan"
              gradientType="gra_primary"
              loading={loading}
              containerStyle={styles.baseBtn}
            />
          </DemoRow>
        </View>
      </ScrollView>
    </View>
  );
}

function DemoRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.demoRow}>
      <Text style={styles.demoLabel}>{label}</Text>
      <View style={styles.demoButtonWrap}>{children}</View>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  root: { flex: 1 },
  background: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  scrollContent: {
    padding: 16,
    rowGap: 16,
  },
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    ...shadows.sd2,
  },
  toggleLabel: {
    color: colors.neutral900,
    ...textPresets.fs14_500,
  },
  section: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: colors.white,
    rowGap: 12,
    ...shadows.sd2,
  },
  sectionTitle: {
    color: colors.primary,
    ...textPresets.fs14_800,
  },
  demoRow: {
    rowGap: 6,
  },
  demoLabel: {
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
  demoButtonWrap: {
    flexDirection: "row",
  },
  baseBtn: {
    borderRadius: 999,
    overflow: "hidden",
  },
}));
