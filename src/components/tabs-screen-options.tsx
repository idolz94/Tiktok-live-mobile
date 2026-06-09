import { icons, IconsTypes } from "@assets/icons";
import { Colors } from "@themes/type";
import { Image } from "./image";
import { Tabs } from "expo-router";

type Props = {
  name: IconsTypes;
  size?: number;
  tintColor?: Colors;
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

type BaseScreenProps = React.ComponentProps<typeof Tabs.Screen>;

type BaseOptions = BaseScreenProps["options"] extends (
  ...args: any[]
) => infer R
  ? R
  : NonNullable<BaseScreenProps["options"]>;

type WithIcon = {
  icon?: IconsTypes;
};

export function tabOptions<T extends BaseOptions & WithIcon>(
  options: T,
): Omit<T, "icon"> {
  const { icon, ...rest } = options;

  if (!icon) {
    return rest as Omit<T, "icon">;
  }

  return {
    ...rest,

    tabBarIcon: ({ color, size }: { color: Colors; size: number }) => (
      <Icon name={icon} size={size} tintColor={color} />
    ),
  } as Omit<T, "icon">;
}
