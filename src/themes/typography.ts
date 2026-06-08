import { TextStyle } from "react-native";

// | Font Weight | Giá trị |
// | ----------- | ------- |
// | Thin        | 100     |
// | Extra Light | 200     |
// | Light       | 300     |
// | Regular     | 400     |
// | Medium      | 500     |
// | SemiBold    | 600     |
// | Bold        | 700     |
// | ExtraBold   | 800     |
// | Black       | 900     |

export const FontStyle = {
  fs40_600: {
    fontSize: 40,
    fontWeight: "600",
  },
  fs18_500: {
    fontSize: 18,
    fontWeight: "500",
  },
  fs16_500: {
    fontSize: 16,
    fontWeight: "500",
  },

  // base
  fs40_400: {
    fontSize: 40,
  },
  fs30_900: {
    fontSize: 30,
    fontWeight: "900",
  },
  fs30_800: {
    fontSize: 30,
    fontWeight: "800",
  },
  fs26_900: {
    fontSize: 26,
    fontWeight: "900",
  },
  fs26_800: {
    fontSize: 26,
    fontWeight: "800",
  },
  fs24_900: {
    fontSize: 24,
    fontWeight: "900",
  },
  fs24_800: {
    fontSize: 24,
    fontWeight: "800",
  },

  // Titles / Subheadings (Sizes 18 - 23)
  fs23_900: {
    fontSize: 23,
    fontWeight: "900",
  },
  fs22_900: {
    fontSize: 22,
    fontWeight: "900",
  },
  fs20_900: {
    fontSize: 20,
    fontWeight: "900",
  },
  fs19_900: {
    fontSize: 19,
    fontWeight: "900",
  },
  fs18_900: {
    fontSize: 18,
    fontWeight: "900",
  },
  fs18_700: {
    fontSize: 18,
    fontWeight: "700",
  },

  // Texts (Sizes 11 - 17)
  fs17_900: {
    fontSize: 17,
    fontWeight: "900",
  },
  fs17_800: {
    fontSize: 17,
    fontWeight: "800",
  },
  fs16_900: {
    fontSize: 16,
    fontWeight: "900",
  },
  fs16_800: {
    fontSize: 16,
    fontWeight: "800",
  },
  fs16_600: {
    fontSize: 16,
    fontWeight: "600",
  },

  fs15_900: {
    fontSize: 15,
    fontWeight: "900",
  },
  fs15_800: {
    fontSize: 15,
    fontWeight: "800",
  },
  fs15_400: {
    fontSize: 15,
  },
  fs14_800: {
    fontSize: 14,
    fontWeight: "800",
  },
  fs14_400: {
    fontSize: 14,
  },
  fs12_800: {
    fontSize: 12,
    fontWeight: "800",
  },
  fs12_400: {
    fontSize: 12,
  },
  fs12_italic: {
    fontSize: 12,
    fontStyle: "italic",
  },
  fs11_800: {
    fontSize: 11,
    fontWeight: "800",
  },
  fs11_400: {
    fontSize: 11,
  },
} as const satisfies Record<string, TextStyle>;
