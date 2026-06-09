import { Dimensions, Platform } from "react-native";

export const isIos = Platform.OS === "ios";

export const { width: widthScreen, height: heightScreen } =
  Dimensions.get("screen");
