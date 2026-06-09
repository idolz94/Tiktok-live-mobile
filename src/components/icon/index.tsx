import { icons, IconsTypes } from "@assets/icons";
import { Image } from "@components/image";
import { Colors } from "@themes/type";
import { Tabs } from "expo-router";

type Props = {
  name: IconsTypes;
  size?: number;
  tintColor?: Colors | string;
};

export function Icon({ name, size, tintColor }: Props) {
  return (
    <Image
      source={icons[name]}
      resizeMode="contain"
      style={{
        width: size,
        height: size,
        tintColor,
      }}
    />
  );
}
