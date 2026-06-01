import { ImageContentFit, ImageProps as ExpoImageProps } from "expo-image";
import { StyleProp, ViewStyle } from "react-native";

export interface ImageProps extends CustomOmit<
  ExpoImageProps,
  "source" | "resizeMode"
> {
  /**
   * Overwrite wrap image style
   * @default undefined
   */
  containerStyle?: StyleProp<ViewStyle>;

  /**
   * (Required) Url of image
   */
  source: string | null | undefined;

  /**
   * Resize mode of image
   * @default contain
   */
  resizeMode?: ImageContentFit;

  /**
   * render image immediately
   * @default false
   */
  immediate?: boolean;
}
