import { Header } from "@components/header";
import { LinearGradient } from "@components/linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useThemes } from "@hooks/use-theme";
import { createStyles } from "@utils/createStyles";
import { Dimensions, Text, View } from "react-native";
import Animated, {
  type SharedValue,
  interpolate,
  interpolateColor,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  useSharedValue,
} from "react-native-reanimated";

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
      {
        icon: "document-text-outline",
        label: "Xuất báo cáo Excel",
        available: false,
      },
      {
        icon: "bar-chart-outline",
        label: "Báo cáo nâng cao",
        available: false,
      },
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
      {
        icon: "infinite-outline",
        label: "Không giới hạn đơn",
        available: true,
      },
      { icon: "storefront-outline", label: "3 shop", available: true },
      {
        icon: "document-text-outline",
        label: "Xuất báo cáo Excel",
        available: true,
      },
      {
        icon: "bar-chart-outline",
        label: "Báo cáo nâng cao",
        available: false,
      },
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
      {
        icon: "infinite-outline",
        label: "Không giới hạn đơn",
        available: true,
      },
      {
        icon: "infinite-outline",
        label: "Không giới hạn shop",
        available: true,
      },
      {
        icon: "document-text-outline",
        label: "Xuất báo cáo Excel",
        available: true,
      },
      { icon: "bar-chart-outline", label: "Báo cáo nâng cao", available: true },
      { icon: "people-outline", label: "Quản lý nhân viên", available: true },
      { icon: "code-slash-outline", label: "API tích hợp", available: true },
      { icon: "headset-outline", label: "Hỗ trợ 24/7", available: true },
    ],
  },
];

const AnimatedFlatList = Animated.FlatList<Plan>;

export function LicensePlansScreen() {
  const scrollX = useSharedValue((CARD_WIDTH + CARD_GAP) * 1);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (e) => {
      scrollX.value = e.contentOffset.x;
    },
  });

  return (
    <View style={styles.root}>
      <LinearGradient
        type="gra_background"
        style={styles.headerBackground}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />
      <Header title="Chọn gói dịch vụ" transparent />

      {/* Plan cards */}

      <View style={styles.cardsWrapper}>
        <AnimatedFlatList
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
          onScroll={scrollHandler}
          scrollEventThrottle={16}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <PlanCard plan={item} />}
        />
        <View style={styles.dotsRow}>
          {PLANS.map((_, i) => (
            <AnimatedDot key={i} index={i} scrollX={scrollX} />
          ))}
        </View>
      </View>

      {/* Sticky CTA */}
      {/* <View style={styles.ctaContainer}>
        <Pressable style={({ pressed }) => [pressed && { opacity: 0.85 }]}>
          <LinearGradient type="gra_primary" style={styles.ctaButton}>
            <Text style={styles.ctaText}>Bắt đầu dùng miễn phí 7 ngày</Text>
          </LinearGradient>
        </Pressable>
        <Text style={styles.ctaNote}>
          Không cần thẻ ngân hàng · Huỷ bất cứ lúc nào
        </Text>
      </View> */}
    </View>
  );
}

const SNAP_WIDTH = CARD_WIDTH + CARD_GAP;

function AnimatedDot({
  index,
  scrollX,
}: {
  index: number;
  scrollX: SharedValue<number>;
}) {
  const { colors } = useThemes();

  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [
      (index - 1) * SNAP_WIDTH,
      index * SNAP_WIDTH,
      (index + 1) * SNAP_WIDTH,
    ];

    const width = interpolate(scrollX.value, inputRange, [6, 18, 6], "clamp");
    const backgroundColor = interpolateColor(scrollX.value, inputRange, [
      "#D9D0D5",
      colors.primary,
      "#D9D0D5",
    ]);

    return { width, backgroundColor };
  });

  return <Animated.View style={[styles.dot, animatedStyle]} />;
}

function PlanCard({ plan }: { plan: Plan }) {
  if (plan.highlighted) {
    return (
      <LinearGradient type="gra_primary" style={styles.cardGradientBorder}>
        <View style={[styles.card, styles.cardHighlightedInner]}>
          <CardInner plan={plan} highlighted={false} />
        </View>
      </LinearGradient>
    );
  }

  return (
    <View style={styles.card}>
      <CardInner plan={plan} highlighted={false} />
    </View>
  );
}

function CardInner({
  plan,
  highlighted,
}: {
  plan: Plan;
  highlighted: boolean;
}) {
  return (
    <>
      {plan.badge && (
        <View
          style={[
            styles.badge,
            highlighted ? styles.badgeLight : styles.badgePink,
          ]}
        >
          <Text
            style={[
              styles.badgeText,
              highlighted ? styles.badgeTextLight : styles.badgeTextPink,
            ]}
          >
            {plan.badge}
          </Text>
        </View>
      )}

      <Text
        style={[
          styles.planName,
          highlighted ? styles.textLight : styles.textDark,
        ]}
      >
        {plan.name}
      </Text>
      <Text
        style={[
          styles.planTagline,
          highlighted ? styles.textLightMuted : styles.textMuted,
        ]}
      >
        {plan.tagline}
      </Text>

      <View style={styles.priceRow}>
        <Text
          style={[
            styles.price,
            highlighted ? styles.textLight : styles.textDark,
          ]}
        >
          {plan.price}
        </Text>
        <Text
          style={[
            styles.period,
            highlighted ? styles.textLightMuted : styles.textMuted,
          ]}
        >
          {" "}
          / tháng
        </Text>
      </View>

      <View
        style={[
          styles.divider,
          highlighted ? styles.dividerLight : styles.dividerDefault,
        ]}
      />

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
  root: { flex: 1 },
  headerBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  // Cards
  cardsWrapper: {
    flex: 1,
    justifyContent: "center",
  },
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
  },
  cardGradientBorder: {
    borderRadius: 22,
    padding: 2,
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
