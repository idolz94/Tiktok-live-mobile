import { Text } from "react-native";
import { createStyles } from "@utils/createStyles";
import { Section } from "./order-detail-primitives";

type OrderDetailNoteSectionProps = {
  note: string;
};

// ponytail: stub — imported by order-detail.tsx but not yet rendered
export function OrderDetailMetaSection() {
  return null;
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
  noteTitle: { color: colors.neutral900, ...textPresets.fs20_600 },
  note: { color: colors.neutral500, ...textPresets.fs14_500 },
}));
