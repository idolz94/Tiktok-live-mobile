import { IconsTypes } from "@assets/icons";
import { Colors, Shadows } from "@themes/type";

export type AvatarProps = {
  source: string | number | null | undefined;
  /**
   * @default 36
   */
  size?: number;
  onPress?: () => void;

  icon?: IconsTypes;
  /**
   * @default 10
   */
  iconSize?: number;
  iconColorTheme?: Colors;

  /**
   * @default 0
   */
  iconContainerPadding?: number;

  /**
   * @default 99
   */
  iconContainerRadius?: number;

  /**
   * @default none
   */
  iconContainerShadow?: Shadows;
};
