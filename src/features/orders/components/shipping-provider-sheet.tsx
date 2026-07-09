import { images } from "@assets/images";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Image, Pressable, Text, View } from "react-native";

export type ShippingProvider = "manual" | "spx";

type Props = {
  selected: ShippingProvider;
  spxConnected: boolean;
  onClose: () => void;
  onSelect: (provider: ShippingProvider) => void;
};

type ProviderConfig = {
  id: ShippingProvider;
  label: string;
  initial: string;
  color: string;
  logo?: ReturnType<typeof require>;
  connected: true;
};

type DisabledProviderConfig = {
  id: string;
  label: string;
  initial: string;
  color: string;
  logo?: ReturnType<typeof require>;
  connected: false;
};

const SPX = {
  id: "spx" as ShippingProvider,
  label: "Shopee Express",
  initial: "S",
  color: "#ffb000",
  logo: images.logo_spx,
};

export function ShippingProviderSheet({ selected, spxConnected, onClose, onSelect }: Props) {
  const { colors } = useThemes();

  const connected: ProviderConfig[] = [
    { id: "manual", label: "Vận chuyển thủ công", initial: "M", color: "#2ca87b", connected: true },
    ...(spxConnected ? [{ ...SPX, connected: true as const }] : []),
  ];

  const coming: DisabledProviderConfig[] = [
    ...(!spxConnected ? [{ ...SPX, connected: false as const }] : []),
    { id: "viettelpost", label: "Viettel Post", initial: "V", color: "#cc0000", connected: false },
  ];

  return (
    <View style={[styles.sheet, { backgroundColor: colors.neutral100 }]}>
      <Text style={[styles.title, { color: colors.neutral900 }]}>
        Phương thức vận chuyển
      </Text>

      <Text style={[styles.sectionLabel, { color: colors.neutral400 }]}>
        Đã kết nối
      </Text>
      {connected.map((p) => {
        const isSelected = p.id === selected;
        return (
          <Pressable
            key={p.id}
            style={[styles.row, { borderColor: colors.border10 }]}
            onPress={() => {
              onSelect(p.id);
              onClose();
            }}
          >
            <View style={[styles.avatar, { backgroundColor: p.logo ? "#fff" : p.color }]}>
              {p.logo ? (
                <Image source={p.logo} style={styles.avatarLogo} resizeMode="contain" />
              ) : (
                <Text style={styles.avatarText}>{p.initial}</Text>
              )}
            </View>
            <Text style={[styles.rowLabel, { color: colors.neutral900 }]}>
              {p.label}
            </Text>
            {isSelected && (
              <View
                style={[
                  styles.checkCircle,
                  { backgroundColor: colors.primary },
                ]}
              >
                <Text style={styles.checkMark}>✓</Text>
              </View>
            )}
          </Pressable>
        );
      })}

      <Text
        style={[
          styles.sectionLabel,
          { color: colors.neutral400, marginTop: 8 },
        ]}
      >
        Chưa kết nối
      </Text>
      {coming.map((p) => (
        <View
          key={p.id}
          style={[
            styles.row,
            styles.rowDisabled,
            { borderColor: colors.border10 },
          ]}
        >
          <View style={[styles.avatar, { backgroundColor: p.color }]}>
            <Text style={styles.avatarText}>{p.initial}</Text>
          </View>
          <Text style={[styles.rowLabel, { color: colors.neutral400 }]}>
            {p.label}
          </Text>
        </View>
      ))}

      <Pressable
        style={[styles.cancelBtn, { borderColor: colors.border10 }]}
        onPress={onClose}
      >
        <Text style={[styles.cancelText, { color: colors.neutral500 }]}>
          Huỷ
        </Text>
      </Pressable>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  sheet: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 20,
    paddingBottom: 36,
    paddingTop: 12,
    rowGap: 8,
  },
  title: { ...textPresets.fs16_600, marginBottom: 4 },
  sectionLabel: { ...textPresets.fs12_500, marginBottom: 2 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    columnGap: 12,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderRadius: 12,
  },
  rowDisabled: { opacity: 0.45 },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  avatarLogo: { width: 28, height: 28 },
  rowLabel: { flex: 1, ...textPresets.fs14_500 },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
  },
  checkMark: { color: "#fff", fontSize: 13, fontWeight: "700" },
  cancelBtn: {
    marginTop: 8,
    height: 48,
    borderRadius: 40,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: { ...textPresets.fs14_500 },
}));
