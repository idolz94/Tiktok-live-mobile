import React from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";
import { useThemes } from "@hooks/use-theme";

type AvatarProps = {
  uri?: string;
  username: string;
  size?: number;
};

export const Avatar = ({ uri, username, size = 42 }: AvatarProps) => {
  const { colors } = useThemes();

  const firstChar = username?.trim()?.charAt(0)?.toUpperCase() || "?";

  return uri ? (
    <Image
      source={uri}
      contentFit="cover"
      cachePolicy="memory-disk"
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.neutral100,
      }}
    />
  ) : (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: colors.neutral100,
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Text
        style={{
          color: colors.primary,
          fontWeight: "900",
          fontSize: size * 0.45,
        }}
      >
        {firstChar}
      </Text>
    </View>
  );
};
