import { memo } from "react";
import { Dimensions, StyleProp, ViewStyle } from "react-native";
import Svg, { Path } from "react-native-svg";

type Props = {
  containerStyle?: StyleProp<ViewStyle>;
};

export const PathLine = memo(({ containerStyle }: Props) => {
  const { width } = Dimensions.get("window");

  return (
    <Svg width={width} height={80} style={containerStyle}>
      <Path
        d={`
            M 0 50
            C ${width * 0.2} 70,
            ${width * 0.35} 10,
            ${width * 0.5} 20
            S ${width * 0.8} 50,
            ${width} 35
        `}
        stroke="rgba(255,255,255,0.4)"
        strokeWidth={2}
        strokeDasharray={[6, 8]}
        fill="none"
        strokeLinecap="round"
      />
    </Svg>
  );
});
