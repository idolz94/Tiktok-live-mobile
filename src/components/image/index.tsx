import { Image as ExpoImage } from "expo-image";
import React, { memo } from "react";
import isEqual from "react-fast-compare";
import { ImageProps } from "./type";
import { View } from "react-native";

export const Image = memo(
  ({
    source,
    resizeMode = "cover",
    containerStyle,
    style,
    immediate = false,
    ...rest
  }: ImageProps) => {
    // const [_source, setSource] = useState<string | null>('');

    // useEffect(() => {
    //   const getCachePath = async (s: string) => {
    //     const path = await ExpoImage.getCachePathAsync(s);
    //     console.log('🚀 ~ getCachePath ~ path:', path);

    //     setSource(isEmpty(path) ? s : path);
    //   };

    //   if (typeof source === 'string') {
    //     getCachePath(source);
    //   }
    // }, [source]);

    return (
      // @ts-ignore
      <View style={containerStyle ?? style}>
        <ExpoImage
          transition={{
            duration: immediate ? 0 : 300,
            effect: "cross-dissolve",
          }}
          placeholderContentFit="cover"
          placeholder={{
            thumbhash: "3PcNNYSFeXh/k0oGLQaSVsN0BVhn2oq2Z5SQUQcZ",
            blurhash:
              "|rF?hV%2WCj[ayj[a|j[az_NaeWBj@ayfRayfQfQM{M|azj[azf6fQfQfQIpWXofj[ayj[j[fQayWCoeoeaya}j[ayfQa{oLj?j[WVj[ayayj[fQoff7azayj[ayj[j[ayofayayayj[fQj[ayayj[ayfjj[j[ayjuayj[",
          }}
          {...rest}
          style={style ?? { flex: 1 }}
          source={source}
          contentFit={resizeMode}
        />
      </View>
    );
  },
  isEqual,
);

Image.displayName = "Image";
