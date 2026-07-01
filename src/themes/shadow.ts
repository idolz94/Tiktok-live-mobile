import { Platform } from "react-native";

export const shadows = {
  sd1: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.08,
      shadowRadius: 4,
    },
    android: { elevation: 2 },
    default: { boxShadow: "0px 2px 4px 0px rgba(0, 0, 0, 0.08)" },
  }),

  sd2: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 6,
    },
    android: { elevation: 4 },
    default: { boxShadow: "0px 2px 6px 0px rgba(0, 0, 0, 0.15)" },
  }),

  // ponytail: dominant layer only on native; both layers on web via boxShadow
  sd3: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.08,
      shadowRadius: 16,
    },
    android: { elevation: 8 },
    default: {
      boxShadow:
        "0px 3px 6px -2px rgba(0, 0, 0, 0.06),0px 12px 16px -4px rgba(0, 0, 0, 0.08)",
    },
  }),

  sd4: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.1,
      shadowRadius: 48,
    },
    android: { elevation: 12 },
    default: { boxShadow: "0px 8px 48px 0px rgba(0, 0, 0, 0.1)" },
  }),

  // ponytail: dominant layer only on native; both layers on web via boxShadow
  sd5: Platform.select({
    ios: {
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 12 },
      shadowOpacity: 0.1,
      shadowRadius: 60,
    },
    android: { elevation: 16 },
    default: {
      boxShadow:
        "0px 12px 60px 0px rgba(0, 0, 0, 0.1),0px 3px 6px -2px rgba(0, 0, 0, 0.06)",
    },
  }),
};
