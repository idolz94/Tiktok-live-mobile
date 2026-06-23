import { Text, View } from "react-native";
import { OrderStatus } from "@app-types/index";
import { createStyles } from "@utils/createStyles";
import { Section, StatusTag } from "./OrderDetailPrimitives";

type OrderDetailMetaSectionProps = {
  orderCode: string;
  createdDate: string;
  status: OrderStatus;
};

type OrderDetailNoteSectionProps = {
  note: string;
};

export function OrderDetailMetaSection({
  orderCode,
  createdDate,
  status,
}: OrderDetailMetaSectionProps) {
  return (
    <Section>
      <View style={styles.metaLine}>
        <Text style={styles.metaText}>Order ID: {orderCode}</Text>
        {createdDate ? <View style={styles.metaDivider} /> : null}
        {createdDate ? <Text style={styles.metaText}>{createdDate}</Text> : null}
      </View>
      <StatusTag status={status} />
    </Section>
  );
}

export function OrderDetailNoteSection({ note }: OrderDetailNoteSectionProps) {
  return (
    <Section>
      <Text style={styles.noteTitle}>Ghi chú</Text>
      <Text style={styles.note}>{note}</Text>
    </Section>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  metaLine: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  metaText: { color: colors.neutral400, ...textPresets.fs12_400 },
  metaDivider: { width: 1, height: 12, backgroundColor: colors.border10 },
  noteTitle: { color: colors.neutral900, ...textPresets.fs20_600 },
  note: { color: colors.neutral500, ...textPresets.fs14_500 },
}));
