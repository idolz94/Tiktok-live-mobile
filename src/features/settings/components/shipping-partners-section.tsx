import { images } from "@assets/images";
import {
  Image,
  ImageSourcePropType,
  Pressable,
  Text,
  View,
} from "react-native";
import { shippingSettingsStyles as styles } from "./shipping-settings.styles";

type ShippingPartnersSectionProps = {
  spxConnected: boolean;
  onConnectSpx: () => void;
  onDisconnectSpx?: () => void;
};

const SPX_PARTNER = {
  key: "spx",
  name: "SPX - SPX EXPRESS",
  description: "Dịch vụ giao hàng toàn quốc, nhanh, rẻ và an toàn.",
  color: "#ff3911",
} as const;

const MANUAL_PARTNER = {
  key: "manual",
  name: "Thủ công",
  description: "Tự tạo và quản lý vận đơn ngoài hệ thống.",
  color: "#ffffff",
} as const;

const COMING_SOON_PARTNERS = [
  {
    key: "viettel-post",
    name: "Viettel Post",
    description: "Dịch vụ bưu chính của Viettel với mạng lưới rộng khắp.",
    color: "#ffffff",
    comingSoon: true,
  },
  {
    key: "jt",
    name: "JT - J&T Express",
    description:
      "Dịch vụ chuyển phát nhanh J&T Express với mạng lưới toàn quốc.",
    color: "#e31b23",
    comingSoon: true,
  },
  {
    key: "ghn",
    name: "GHN - Giao Hàng Nhanh",
    description: "Dịch vụ giao hàng nhanh với mạng lưới rộng khắp cả nước.",
    color: "#f58220",
    comingSoon: true,
  },
] as const;

type Partner = {
  key: string;
  name: string;
  description: string;
  comingSoon?: boolean;
  color: string;
  onPress?: () => void;
  tagLabel?: string;
};

export function ShippingPartnersSection({
  spxConnected,
  onConnectSpx,
  onDisconnectSpx,
}: ShippingPartnersSectionProps) {
  const connectedPartners: Partner[] = [
    ...(spxConnected ? [{ ...SPX_PARTNER, onPress: onDisconnectSpx, tagLabel: "Ngắt kết nối" }] : []),
    MANUAL_PARTNER,
  ];

  const unconnectedPartners: Partner[] = [
    ...(!spxConnected ? [{ ...SPX_PARTNER, onPress: onConnectSpx }] : []),
    ...COMING_SOON_PARTNERS,
  ];

  return (
    <View style={styles.partnerSection}>
      <Text style={styles.sectionTitle}>Đối tác vận chuyển</Text>
      <PartnerGroup title="Đã kết nối" partners={connectedPartners} />
      <PartnerGroup title="Chưa kết nối" partners={unconnectedPartners} />
    </View>
  );
}

function PartnerGroup({
  title,
  partners,
}: {
  title: string;
  partners: readonly Partner[];
}) {
  return (
    <View style={styles.partnerGroup}>
      <Text style={styles.partnerGroupTitle}>{title}</Text>
      <View style={styles.partnerList}>
        {partners.map((partner) => (
          <PartnerCard key={partner.key} partner={partner} />
        ))}
      </View>
    </View>
  );
}

function PartnerCard({ partner }: { partner: Partner }) {
  return (
    <Pressable style={styles.partnerCard} onPress={partner.onPress}>
      <View style={styles.partnerContent}>
        <DeliveryLogo color={partner.color} image={images.ship} />
        <View style={styles.partnerTextWrap}>
          <View style={styles.partnerTitleRow}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {partner.name}
            </Text>
            {partner.comingSoon ? (
              <View style={styles.comingSoonTag}>
                <Text style={styles.comingSoonText}>Coming soon</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.partnerDescription}>{partner.description}</Text>
        </View>
        {partner.onPress && !partner.comingSoon ? (
          <View style={styles.connectTag}>
            <Text style={styles.connectTagText}>{partner.tagLabel ?? "Kết nối"}</Text>
          </View>
        ) : null}
      </View>
    </Pressable>
  );
}

function DeliveryLogo({
  color,
  image,
}: {
  color: string;
  image: ImageSourcePropType;
}) {
  return (
    <View style={[styles.deliveryLogo, { backgroundColor: color }]}>
      <Image
        source={image}
        style={styles.deliveryLogoImage}
        resizeMode="contain"
      />
    </View>
  );
}
