import { Pressable, Text, View } from "react-native";
import { Icon } from "@components/icon";
import { createStyles } from "@utils/createStyles";
import { Section } from "./OrderDetailPrimitives";

type OrderDetailFooterActionsProps = {
  onPrint: () => void;
  onShare: () => void;
};

export function OrderDetailFooterActions({
  onPrint,
  onShare,
}: OrderDetailFooterActionsProps) {
  return (
    <Section>
      <View style={styles.footerActions}>
        <Pressable style={styles.printBtn} onPress={onPrint}>
          <Icon name="print" size={20} tintColor="neutral100" />
          <Text style={styles.printBtnText}>IN ĐƠN</Text>
        </Pressable>
        <Pressable style={styles.shareBtn} onPress={onShare}>
          <Icon name="more" size={20} tintColor="neutral100" />
          <Text style={styles.shareBtnText}>CHIA SẺ HOÁ ĐƠN</Text>
        </Pressable>
      </View>
    </Section>
  );
}

const styles = createStyles(() => ({
  footerActions: { rowGap: 12 },
  printBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
    paddingVertical: 14,
    borderRadius: 40,
    backgroundColor: "#22c55e",
  },
  printBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" as const },
  shareBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    columnGap: 8,
    paddingVertical: 14,
    borderRadius: 40,
    backgroundColor: "#3b82f6",
  },
  shareBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" as const },
}));
