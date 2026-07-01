import { images } from "@assets/images";
import { Image, ImageSourcePropType, Pressable, Text, View } from "react-native";
import { shippingSettingsStyles as styles } from "./shipping-settings.styles";

const connectedPartners = [
  {
    key: "viettel-post",
    name: "Viettel Post",
    description: "Dịch vụ bưu chính của Viettel với mạng lưới rộng khắp.",
    isDefault: true,
    color: "#ffffff",
  },
  {
    key: "spx",
    name: "SPX - SPX EXPRESS",
    description: "Dịch vụ giao hàng toàn quốc, nhanh, rẻ và an toàn.",
    color: "#ff3911",
  },
] as const;

const unconnectedPartners = [
  {
    key: "jt",
    name: "JT - J&T Express",
    description: "Dịch vụ chuyển phát nhanh J&T Express với mạng lưới toàn quốc.",
    color: "#e31b23",
  },
  {
    key: "ghn",
    name: "GHN - Giao Hàng Nhanh",
    description: "Dịch vụ giao hàng nhanh với mạng lưới rộng khắp cả nước.",
    color: "#f58220",
  },
] as const;

type Partner = {
  key: string;
  name: string;
  description: string;
  isDefault?: boolean;
  color: string;
};

export function ShippingPartnersSection() {
  return (
    <View style={styles.partnerSection}>
      <Text style={styles.sectionTitle}>Đối tác vận chuyển</Text>
      <PartnerGroup title="Đã kết nối" partners={connectedPartners} />
      <PartnerGroup title="Chưa kết nối" partners={unconnectedPartners} />
    </View>
  );
}

function PartnerGroup({ title, partners }: { title: string; partners: readonly Partner[] }) {
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
    <Pressable style={styles.partnerCard}>
      <View style={styles.partnerContent}>
        <DeliveryLogo color={partner.color} image={images.ship} />
        <View style={styles.partnerTextWrap}>
          <View style={styles.partnerTitleRow}>
            <Text style={styles.partnerName} numberOfLines={1}>{partner.name}</Text>
            {partner.isDefault ? (
              <View style={styles.defaultTag}>
                <Text style={styles.defaultText}>Mặc định</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.partnerDescription}>{partner.description}</Text>
        </View>
      </View>
      <Text style={styles.chevron}>›</Text>
    </Pressable>
  );
}

function DeliveryLogo({ color, image }: { color: string; image: ImageSourcePropType }) {
  return (
    <View style={[styles.deliveryLogo, { backgroundColor: color }]}>
      <Image source={image} style={styles.deliveryLogoImage} resizeMode="contain" />
    </View>
  );
}
