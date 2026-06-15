import { IconTypes } from '@assets/icon';
import { BorderRadius, Colors, Shadows, Spacing } from '@theme/type';

export type AvatarProps = {
  source: string | number | null | undefined;
  /**
   * @default 36
   */
  size?: number;
  onPress?: () => void;

  icon?: IconTypes;
  /**
   * @default 10
   */
  iconSize?: number;
  iconColorTheme?: Colors;

  /**
   * @default 0
   */
  iconContainerPadding?: Spacing;

  /**
   * @default 99
   */
  iconContainerRadius?: BorderRadius | 99;

  /**
   * @default none
   */
  iconContainerShadow?: Shadows;
};
