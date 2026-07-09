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
const CARD_SIDE_PADDING = (SCREEN_WIDTH - CARD_WIDTH) / 2;

type PlanPricing = { monthly: string; annual: string };

type PlanFeature = { icon: string; label: string };

type Plan = {
  id: string;
  name: string;
  tagline: string;
  badge?: string;
  pricing: PlanPricing;
  features: PlanFeature[];
  highlighted: boolean;
};

const PLANS: Plan[] = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Bắt đầu bán hàng livestream",
    pricing: { monthly: "199.000đ", annual: "159.000đ" },
    highlighted: false,
    features: [
      { icon: "flash-outline", label: "Gom comment tự động" },
      { icon: "cube-outline", label: "Tạo đơn nhanh" },
      { icon: "layers-outline", label: "100 đơn / tháng" },
      { icon: "storefront-outline", label: "1 shop" },
    ],
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Dành cho seller chuyên nghiệp",
    badge: "Phổ biến nhất",
    pricing: { monthly: "499.000đ", annual: "399.000đ" },
    highlighted: true,
    features: [
      { icon: "checkmark-circle-outline", label: "Tất cả tính năng Basic" },
      { icon: "infinite-outline", label: "Không giới hạn đơn" },
      { icon: "storefront-outline", label: "3 shop" },
      { icon: "document-text-outline", label: "Xuất báo cáo Excel" },
      { icon: "headset-outline", label: "Hỗ trợ ưu tiên" },
    ],
  },
  {
    id: "business",
    name: "Business",
    tagline: "Giải pháp cho doanh nghiệp",
    badge: "Cho doanh nghiệp",
    pricing: { monthly: "999.000đ", annual: "799.000đ" },
    highlighted: false,
    features: [
      { icon: "checkmark-circle-outline", label: "Tất cả tính năng Pro" },
      { icon: "infinite-outline", label: "Không giới hạn shop" },
      { icon: "code-slash-outline", label: "API tích hợp" },
      { icon: "people-outline", label: "Quản lý nhân viên" },
      { icon: "bar-chart-outline", label: "Báo cáo nâng cao" },
      { icon: "headset-outline", label: "Hỗ trợ 24/7" },
    ],
  },
];

export function LicensePlansScreen() {
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeIndex, setActiveIndex] = useState(1); // Pro selected by default
  const flatListRef = useRef<FlatList>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={["left", "right", "bottom"]}>
      <Header title="Chọn gói dịch vụ" />

      {/* Toggle pill */}
      <View style={styles.toggleRow}>
        <View style={styles.togglePill}>
          <Pressable
            style={[styles.toggleOption, !isAnnual && styles.toggleOptionActive]}
            onPress={() => setIsAnnual(false)}
          >
            {!isAnnual ? (
              <LinearGradient type="gra_primary" style={styles.toggleGradient}>
                <Text style={styles.toggleTextActive}>Hàng tháng</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleTextInactive}>Hàng tháng</Text>
            )}
          </Pressable>
          <Pressable
            style={[styles.toggleOption, isAnnual && styles.toggleOptionActive]}
            onPress={() => setIsAnnual(true)}
          >
            {isAnnual ? (
              <LinearGradient type="gra_primary" style={styles.toggleGradient}>
                <Text style={styles.toggleTextActive}>Hàng năm</Text>
              </LinearGradient>
            ) : (
              <Text style={styles.toggleTextInactive}>Hàng năm</Text>
            )}
          </Pressable>
        </View>
        {isAnnual && (
          <View style={styles.saveBadge}>
            <Text style={styles.saveBadgeText}>Tiết kiệm 20%</Text>
          </View>
        )}
      </View>

      {/* Plan cards */}
      <FlatList
        ref={flatListRef}
        data={PLANS}
        horizontal
        pagingEnabled={false}
        showsHorizontalScrollIndicator={false}
        snapToInterval={CARD_WIDTH + 16}
        snapToAlignment="center"
        decelerationRate="fast"
        contentContainerStyle={styles.cardsContainer}
        initialScrollIndex={1}
        getItemLayout={(_, index) => ({
          length: CARD_WIDTH + 16,
          offset: (CARD_WIDTH + 16) * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const idx = Math.round(e.nativeEvent.contentOffset.x / (CARD_WIDTH + 16));
          setActiveIndex(idx);
        }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <PlanCard plan={item} isAnnual={isAnnual} />
        )}
      />

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

function PlanCard({ plan, isAnnual }: { plan: Plan; isAnnual: boolean }) {
  const price = isAnnual ? plan.pricing.annual : plan.pricing.monthly;

  if (plan.highlighted) {
    return (
      <LinearGradient type="gra_primary" style={styles.card}>
        <CardInner plan={plan} price={price} highlighted />
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
              color={highlighted ? "rgba(255,255,255,0.9)" : "#FF6B8A"}
            />
            <Text style={[styles.featureLabel, highlighted ? styles.textLight : styles.textDark]}>
              {f.label}
            </Text>
          </View>
        ))}
      </View>
    </>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  safeArea: { flex: 1, backgroundColor: colors.neutral100 },

  // Toggle
  toggleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    gap: 10,
  },
  togglePill: {
    flexDirection: "row",
    backgroundColor: colors.surfaceGray,
    borderRadius: 40,
    padding: 3,
  },
  toggleOption: {
    borderRadius: 36,
    overflow: "hidden",
  },
  toggleOptionActive: {},
  toggleGradient: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 36,
  },
  toggleTextActive: {
    color: colors.neutral100,
    ...textPresets.fs14_500,
  },
  toggleTextInactive: {
    color: colors.neutral500,
    paddingHorizontal: 20,
    paddingVertical: 8,
    ...textPresets.fs14_400,
  },
  saveBadge: {
    backgroundColor: "#FFF0F3",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  saveBadgeText: {
    color: colors.primary,
    ...textPresets.fs12_500,
  },

  // Cards
  cardsContainer: {
    paddingHorizontal: CARD_SIDE_PADDING,
    gap: 16,
    alignItems: "center",
  },
  card: {
    width: CARD_WIDTH,
    borderRadius: 20,
    padding: 20,
    gap: 8,
    backgroundColor: colors.neutral100,
    borderWidth: 1.5,
    borderColor: "#f2f0f5",
    shadowColor: "#110C22",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
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
