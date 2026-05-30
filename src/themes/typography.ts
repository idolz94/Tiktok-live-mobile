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
  display_fs40: {
    fontSize: 40,
  },
  display_fs30_black: {
    fontSize: 30,
    fontWeight: "900",
  },
  display_fs30_extrabold: {
    fontSize: 30,
    fontWeight: "800",
  },
  display_fs26_black: {
    fontSize: 26,
    fontWeight: "900",
  },
  display_fs26_extrabold: {
    fontSize: 26,
    fontWeight: "800",
  },
  display_fs24_black: {
    fontSize: 24,
    fontWeight: "900",
  },
  display_fs24_extrabold: {
    fontSize: 24,
    fontWeight: "800",
  },

  // Titles / Subheadings (Sizes 18 - 23)
  title_fs23_black: {
    fontSize: 23,
    fontWeight: "900",
  },
  title_fs22_black: {
    fontSize: 22,
    fontWeight: "900",
  },
  title_fs20_black: {
    fontSize: 20,
    fontWeight: "900",
  },
  title_fs19_black: {
    fontSize: 19,
    fontWeight: "900",
  },
  title_fs18_black: {
    fontSize: 18,
    fontWeight: "900",
  },
  title_fs18_bold: {
    fontSize: 18,
    fontWeight: "700",
  },

  // Texts (Sizes 11 - 17)
  text_fs17_black: {
    fontSize: 17,
    fontWeight: "900",
  },
  text_fs17_extrabold: {
    fontSize: 17,
    fontWeight: "800",
  },
  text_fs16_black: {
    fontSize: 16,
    fontWeight: "900",
  },
  text_fs16_extrabold: {
    fontSize: 16,
    fontWeight: "800",
  },
  text_fs16_semibold: {
    fontSize: 16,
    fontWeight: "600",
  },
  text_fs16_regular: {
    fontSize: 16,
  },
  text_fs15_black: {
    fontSize: 15,
    fontWeight: "900",
  },
  text_fs15_extrabold: {
    fontSize: 15,
    fontWeight: "800",
  },
  text_fs15_regular: {
    fontSize: 15,
  },
  text_fs14_extrabold: {
    fontSize: 14,
    fontWeight: "800",
  },
  text_fs14_regular: {
    fontSize: 14,
  },
  text_fs12_extrabold: {
    fontSize: 12,
    fontWeight: "800",
  },
  text_fs12_regular: {
    fontSize: 12,
  },
  text_fs12_italic: {
    fontSize: 12,
    fontStyle: "italic",
  },
  text_fs11_extrabold: {
    fontSize: 11,
    fontWeight: "800",
  },
  text_fs11_regular: {
    fontSize: 11,
  },
} as const satisfies Record<string, TextStyle>;
