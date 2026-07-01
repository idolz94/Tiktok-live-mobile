import { createStyles } from "@utils/createStyles";
import { Image, Pressable, Text, View } from "react-native";

type ProfileHeroProps = {
  avatarUrl: string;
  name: string;
  nickname: string;
};

function SocialButton({ label }: { label: string }) {
  return (
    <Pressable style={styles.socialButton}>
      <Text style={styles.socialIcon}>{label}</Text>
    </Pressable>
  );
}

export function ProfileHero({ avatarUrl, name, nickname }: ProfileHeroProps) {
  return (
    <View style={styles.hero}>
      <Image
        source={{ uri: avatarUrl }}
        blurRadius={18}
        style={styles.heroImage}
      />
      <View style={styles.heroOverlay} />

      <View style={styles.topBar}>
        <Text style={styles.title}>Hồ sơ</Text>
        <View style={styles.headerActions}>
          <Pressable style={styles.roundButton}>
            <Text style={styles.roundButtonIcon}>⌕</Text>
          </Pressable>
          <Pressable style={styles.roundButton}>
            <Text style={styles.roundButtonIcon}>⚙</Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.profileSection}>
        <View style={styles.avatarWrap}>
          <Image source={{ uri: avatarUrl }} style={styles.avatar} />
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.nickname}>{nickname}</Text>

        <View style={styles.socialRow}>
          <SocialButton label="f" />
          <SocialButton label="♪" />
          <SocialButton label="▶" />
        </View>
      </View>
    </View>
  );
}

const styles = createStyles(({ colors, textPresets }) => ({
  hero: {
    minHeight: 360,
    overflow: "hidden",
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    width: "100%",
  },
  heroOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 400,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  topBar: {
    paddingHorizontal: 16,
    paddingTop: 58,
    paddingBottom: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    color: colors.neutral900,
    lineHeight: 28,
    ...textPresets.fs24_900,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral50,
  },
  roundButtonIcon: {
    color: colors.neutral900,
    fontSize: 20,
    fontWeight: "600",
  },
  profileSection: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  avatarWrap: {
    width: 98,
    height: 98,
    borderRadius: 49,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: colors.neutral50,
  },
  avatar: {
    width: 98,
    height: 98,
    borderRadius: 49,
  },
  name: {
    width: 273,
    color: colors.neutral900,
    textAlign: "center",
    lineHeight: 24,
    ...textPresets.fs18_500,
  },
  nickname: {
    width: 273,
    color: "rgba(0,0,0,0.6)",
    textAlign: "center",
    lineHeight: 22,
    marginTop: 4,
    ...textPresets.fs14_400,
  },
  socialRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 16,
    marginTop: 24,
  },
  socialButton: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.neutral100,
  },
  socialIcon: {
    color: colors.neutral900,
    fontSize: 22,
    fontWeight: "700",
  },
}));