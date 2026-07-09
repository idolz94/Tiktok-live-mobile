import { LinearGradient } from "@components/linear-gradient";
import { createStyles } from "@utils/createStyles";
import { router } from "expo-router";
import { Pressable, Text, View } from "react-native";

type SubscriptionCardProps = {
  title: string;
  subtitle: string;
  upgradeLabel: string;
};

export function SubscriptionCard({
  title,
  subtitle,
  upgradeLabel,
}: SubscriptionCardProps) {
  return (
    <View style={styles.subscriptionCard}>
      <View style={styles.subscriptionInfoRow}>
        <LinearGradient type="gra_primary" style={styles.appIcon}>
          <Text style={styles.appIconText}>▣</Text>
        </LinearGradient>
        <View style={styles.subscriptionTextWrap}>
          <Text style={styles.subscriptionTitle}>{title}</Text>
          <Text style={styles.subscriptionSubtitle}>{subtitle}</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </View>
      <Pressable onPress={() => router.push("/license-plans")}>
        <LinearGradient type="gra_primary" style={styles.upgradeButton}>
          <Text style={styles.upgradeText}>{upgradeLabel}</Text>
        </LinearGradient>
      </Pressable>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  subscriptionCard: {
    gap: 16,
    padding: 16,
    borderRadius: 16,
    borderWidth: 0.5,
    borderColor: colors.border10,
    backgroundColor: colors.neutral100,
    ...shadows.sd2,
  },
  subscriptionInfoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  appIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  appIconText: {
    color: colors.neutral100,
    fontSize: 22,
    fontWeight: "800",
  },
  subscriptionTextWrap: {
    flex: 1,
    gap: 2,
  },
  subscriptionTitle: {
    color: colors.neutral900,
    lineHeight: 22,
    ...textPresets.fs14_500,
  },
  subscriptionSubtitle: {
    color: colors.neutral400,
    lineHeight: 22,
    ...textPresets.fs14_400,
  },
  chevron: {
    color: colors.neutral900,
    fontSize: 28,
    lineHeight: 28,
    fontWeight: "300",
  },
  upgradeButton: {
    height: 40,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  upgradeText: {
    color: colors.neutral900,
    lineHeight: 22,
    ...textPresets.fs14_500,
  },
}));