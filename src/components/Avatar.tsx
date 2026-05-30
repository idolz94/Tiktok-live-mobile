import { Image, StyleSheet, Text, View } from "react-native";

export default function Avatar({ uri, username, size = 46 }: { uri?: string; username?: string; size?: number }) {
  const initial = String(username || "U").replace(/^@/, "").charAt(0).toUpperCase() || "U";

  if (uri) {
    return <Image source={{ uri }} style={[styles.image, { width: size, height: size, borderRadius: size / 2 }]} />;
  }

  return (
    <View style={[styles.placeholder, { width: size, height: size, borderRadius: size / 2 }]}>
      <Text style={[styles.initial, { fontSize: Math.max(16, size * 0.42) }]}>{initial}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  image: { backgroundColor: "#dbeafe" },
  placeholder: { alignItems: "center", justifyContent: "center", backgroundColor: "#dbeafe" },
  initial: { color: "#2563eb", fontWeight: "900" }
});
