import { Image } from "expo-image";
import { images } from "@assets/images";

type AvatarProps = {
  uri?: string;
  username?: string;
  size?: number;
  headers?: Record<string, string>;
};

export const Avatar = ({ uri, size = 42, headers }: AvatarProps) => {
  const circleStyle = {
    width: size,
    height: size,
    borderRadius: size / 2,
  } as const;

  const source = uri && uri.trim() ? { uri, ...(headers ? { headers } : {}) } : images.logo_app;

  return (
    <Image
      source={source}
      contentFit="cover"
      cachePolicy="memory-disk"
      style={circleStyle}
    />
  );
};
