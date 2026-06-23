import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { Icon } from "@components/icon";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Section } from "./OrderDetailPrimitives";

type OrderDetailFooterActionsProps = {
  isDeposited: boolean;
  isConfirmed: boolean;
  depositLoading: boolean;
  confirmLoading: boolean;
  onPrint: () => void;
  onDepositOrConfirm: () => void;
  onShare: () => void;
};

export function OrderDetailFooterActions({
  isDeposited,
  isConfirmed,
  depositLoading,
  confirmLoading,
  onPrint,
  onDepositOrConfirm,
  onShare,
}: OrderDetailFooterActionsProps) {
  const { colors } = useThemes();

  return (
    <Section>
      <View style={styles.footerActions}>
        <Pressable style={styles.footerAction} onPress={onPrint}>
          <View style={styles.footerIconCircle}>
            <Icon name="print" size={22} tintColor="neutral500" />
          </View>
          <Text style={styles.footerActionLabel}>In đơn</Text>
        </Pressable>
        <Pressable
          style={styles.footerAction}
          onPress={onDepositOrConfirm}
          disabled={depositLoading || confirmLoading}
        >
          <View
            style={[
              styles.footerIconCircle,
              { backgroundColor: isDeposited ? colors.successLight : colors.warningLight },
            ]}
          >
            {depositLoading || confirmLoading ? (
              <ActivityIndicator size={22} color={isDeposited ? colors.success : colors.warning} />
            ) : (
              <Icon
                name="clipboard_check"
                size={22}
                tintColor={isDeposited ? "success" : "warning"}
              />
            )}
          </View>
          <Text style={styles.footerActionLabel}>
            {isDeposited ? (isConfirmed ? "Đã cọc" : "Chốt đơn") : "Chưa cọc"}
          </Text>
        </Pressable>
        <Pressable style={styles.footerAction} onPress={onShare}>
          <View style={styles.footerIconCircle}>
            <Icon name="more" size={22} tintColor="neutral500" />
          </View>
          <Text style={styles.footerActionLabel}>Chia sẻ hóa đơn</Text>
        </Pressable>
      </View>
    </Section>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  footerActions: { flexDirection: "row", alignItems: "flex-start", columnGap: 8 },
  footerAction: { flex: 1, alignItems: "center", rowGap: 8 },
  footerIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  footerActionLabel: {
    textAlign: "center",
    color: colors.neutral400,
    ...textPresets.fs12_400,
  },
}));
