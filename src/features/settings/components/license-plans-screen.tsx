import { Header } from "@components/header";
import { LinearGradient } from "@components/linear-gradient";
import { createStyles } from "@utils/createStyles";
import { useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";

const SCREEN_WIDTH = Dimensions.get("window").width;
const CARD_WIDTH = SCREEN_WIDTH - 80;
const CARD_GAP = 16;
const SIDE_INSET = (SCREEN_WIDTH - CARD_WIDTH) / 2;

type FeatureItem = { icon: string; label: string; available: boolean };

type Plan = {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  price: string;
  features: FeatureItem[];
  highlighted: boolean;
};

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Bắt đầu bán hàng livestream",
    price: "199.000đ",
    highlighted: false,
    features: [
      { icon: "flash-outline", label: "Gom comment tự động", available: true },
      { icon: "cube-outline", label: "Tạo đơn nhanh", available: true },
      { icon: "layers-outline", label: "100 đơn / tháng", available: true },
      { icon: "storefront-outline", label: "1 shop", available: true },
      { icon: "document-text-outline", label: "Xuất báo cáo Excel", available: false },
      { icon: "bar-chart-outline", label: "Báo cáo nâng cao", available: false },
      { icon: "people-outline", label: "Quản lý nhân viên", available: false },
      { icon: "code-slash-outline", label: "API tích hợp", available: false },
      { icon: "headset-outline", label: "Hỗ trợ 24/7", available: false },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Dành cho seller chuyên nghiệp",
    badge: "Phổ biến nhất",
    price: "499.000đ",
    highlighted: true,
    features: [
      { icon: "flash-outline", label: "Gom comment tự động", available: true },
      { icon: "cube-outline", label: "Tạo đơn nhanh", available: true },
      { icon: "infinite-outline", label: "Không giới hạn đơn", available: true },
      { icon: "storefront-outline", label: "3 shop", available: true },
      { icon: "document-text-outline", label: "Xuất báo cáo Excel", available: true },
      { icon: "bar-chart-outline", label: "Báo cáo nâng cao", available: false },
      { icon: "people-outline", label: "Quản lý nhân viên", available: false },
      { icon: "code-slash-outline", label: "API tích hợp", available: false },
      { icon: "headset-outline", label: "Hỗ trợ ưu tiên", available: true },
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Giải pháp cho doanh nghiệp",
    badge: "Cho doanh nghiệp",
    price: "999.000đ",
    highlighted: false,
    features: [
      { icon: "flash-outline", label: "Gom comment tự động", available: true },
      { icon: "cube-outline", label: "Tạo đơn nhanh", available: true },
      { icon: "infinite-outline", label: "Không giới hạn đơn", available: true },
      { icon: "infinite-outline", label: "Không giới hạn shop", available: true },
      { icon: "document-text-outline", label: "Xuất báo cáo Excel", available: true },
      { icon: "bar-chart-outline", label: "Báo cáo nâng cao", available: true },
      { icon: "people-outline", label: "Quản lý nhân viên", available: true },
      { icon: "code-slash-outline", label: "API tích hợp", available: true },
      { icon: "headset-outline", label: "Hỗ trợ 24/7", available: true },
    ],
  },
];

export function LicensePlansScreen() {
  const [activeIndex, setActiveIndex] = useState(1); // Pro selected by default
  const flatListRef = useRef<FlatList>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <Header title="Chọn gói dịch vụ" />

      {/* Plan cards */}
      <View style={styles.cardsWrapper}>
        <FlatList
          ref={flatListRef}
          data={PLANS}
          horizontal
          pagingEnabled={false}
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_WIDTH + CARD_GAP}
          decelerationRate="fast"
          style={styles.flatList}
          contentContainerStyle={styles.cardsContainer}
          initialScrollIndex={1}
          getItemLayout={(_, index) => ({
            length: CARD_WIDTH + CARD_GAP,
            offset: (CARD_WIDTH + CARD_GAP) * index,
            index,
          })}
          onMomentumScrollEnd={(e) => {
            const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + CARD_GAP));
            setActiveIndex(idx);
          }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <PlanCard plan={item} />
          )}
        />
      </View>

      {/* Dots */}
      <View style={styles.dotsRow}>
        {PLANS.map((_, i) => (
          <View
            key={i}
            style={[styles.dot, i === activeIndex && styles.dotActive]}
          />
        ))}
      </View>

      {/* Sticky CTA */}
      <View style={styles.ctaContainer}>
        <Pressable style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
          <LinearGradient type="gra_primary" style={styles.ctaButton}>
            <Text style={styles.ctaText}>Bắt đầu dùng miễn phí 7 ngày</Text>
          </LinearGradient>
        </Pressable>
        <Text style={styles.ctaNote}>Không cần thẻ ngân hàng · Huỷ bất cứ lúc nào</Text>
      </View>
    </SafeAreaView>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const price = plan.price;

  if (plan.highlighted) {
    return (
      <LinearGradient type="gra_primary" style={styles.cardGradientBorder}>
        <View style={[styles.card, styles.cardHighlightedInner]}>
          <CardInner plan={plan} price={price} highlighted={false} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.card}>
      <CardInner plan={plan} price={price} highlighted={false} />
    </View>
  );
}

function CardInner({
  plan,
  price,
  highlighted,
}: {
  plan: Plan;
  price: string;
  highlighted: boolean;
}) {
  return (
    <>
      {plan.badge && (
        <View style={[styles.badge, highlighted ? styles.badgeLight : styles.badgePink]}>
          <Text style={[styles.badgeText, highlighted ? styles.badgeTextLight : styles.badgeTextPink]}>
            {plan.badge}
          </Text>
        </View>
      )}

      <Text style={[styles.planName, highlighted ? styles.textLight : styles.textDark]}>
        {plan.name}
      </Text>
      <Text style={[styles.planTagline, highlighted ? styles.textLightMuted : styles.textMuted]}>
        {plan.tagline}
      </Text>

      <View style={styles.priceRow}>
        <Text style={[styles.price, highlighted ? styles.textLight : styles.textDark]}>
          {price}
        </Text>
        <Text style={[styles.period, highlighted ? styles.textLightMuted : styles.textMuted]}>
          {" "}/ tháng
        </Text>
      </View>

      <View style={[styles.divider, highlighted ? styles.dividerLight : styles.dividerDefault]} />

      <View style={styles.featureList}>
        {plan.features.map((f) => (
          <View key={f.label} style={styles.featureRow}>
            <Ionicons
              name={f.icon as never}
              size={16}
              color={
                !f.available
                  ? "#C0B8BD"
                  : highlighted
                  ? "rgba(255,255,255,0.9)"
                  : "#FF6B8A"
              }
            />
            <Text
              style={[
                styles.featureLabel,
                highlighted ? styles.textLight : styles.textDark,
                !f.available && styles.featureLabelUnavailable,
              ]}
            >
              {f.label}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = createStyles(({ colors, textPresets, shadows }) => ({
  safeArea: { flex: 1, backgroundColor: colors.neutral100 },

  // Cards
  cardsWrapper: { flex: 1, justifyContent: "center", overflow: "visible" },
  flatList: { flexGrow: 0 },
  cardsContainer: {
    paddingHorizontal: SIDE_INSET,
    gap: CARD_GAP,
    alignItems: "stretch",
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 20,
    gap: 8,
    backgroundColor: colors.neutral100,
    borderWidth: 0.5,
    borderColor: colors.border10,
    ...shadows.sd2,
  },
  cardGradientBorder: {
    borderRadius: 22,
    padding: 2,
    ...shadows.sd2,
  },
  cardHighlightedInner: {
    borderRadius: 20,
    borderWidth: 0,
  },
  badge: {
    alignSelf: "flex-start",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 4,
  },
  badgeLight: { backgroundColor: "rgba(255,255,255,0.25)" },
  badgePink: { backgroundColor: "#FFF0F3" },
  badgeText: { ...textPresets.fs11_400 },
  badgeTextLight: { color: colors.neutral100 },
  badgeTextPink: { color: colors.primary },
  planName: { ...textPresets.fs22_900 },
  planTagline: { ...textPresets.fs14_400, marginBottom: 6 },
  priceRow: { flexDirection: "row", alignItems: "baseline", marginTop: 4 },
  price: { ...textPresets.fs26_800 },
  period: { ...textPresets.fs14_400 },
  divider: { height: 1, marginVertical: 10 },
  dividerDefault: { backgroundColor: "#f2f0f5" },
  dividerLight: { backgroundColor: "rgba(255,255,255,0.25)" },
  featureList: { gap: 10 },
  featureRow: { flexDirection: "row", alignItems: "center", gap: 10 },
  featureLabel: { ...textPresets.fs14_400, flex: 1 },
  featureLabelUnavailable: {
    textDecorationLine: "line-through",
    color: "#C0B8BD",
  },

  // Text variants
  textDark: { color: "#2D1F29" },
  textLight: { color: colors.neutral100 },
  textMuted: { color: "#8c8587" },
  textLightMuted: { color: "rgba(255,255,255,0.75)" },

  // Pagination dots
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 6,
    paddingTop: 12,
    paddingBottom: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D9D0D5",
  },
  dotActive: {
    width: 18,
    backgroundColor: colors.primary,
  },

  // CTA
  ctaContainer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 20,
    gap: 8,
    alignItems: "center",
    backgroundColor: colors.neutral100,
    borderTopWidth: 0.5,
    borderTopColor: "#f2f0f5",
  },
  ctaButton: {
    width: SCREEN_WIDTH - 40,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B8A",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
  },
  ctaText: {
    color: colors.neutral100,
    ...textPresets.fs16_600,
  },
  ctaNote: {
    ...textPresets.fs12_400,
    color: "#8c8587",
    textAlign: "center",
  },
}));
