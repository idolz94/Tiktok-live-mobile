import { icons, IconsTypes } from "@assets/icons";
import { Colors } from "@themes/type";
import { Image as ExpoImage } from "expo-image";

type Props = {
  name: IconsTypes;
  size?: number;
  tintColor?: Colors | string;
};

export function Icon({ name, size, tintColor }: Props) {
  return (
    <ExpoImage
      source={icons[name]}
      contentFit="contain"
      style={{ width: size, height: size, tintColor }}
      transition={0}
    />
  );
}
