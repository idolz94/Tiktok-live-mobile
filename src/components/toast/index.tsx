import { useThemes } from "@hooks/use-theme";
import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import { Animated, StyleSheet, Text, View } from "react-native";

type ToastType = "success" | "error" | "info";

type ShowToastFn = (message: string, type?: ToastType) => void;

const ToastContext = createContext<ShowToastFn>(() => {});

export function useToast(): ShowToastFn {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState("");
  const [type, setType] = useState<ToastType>("success");
  const opacity = useRef(new Animated.Value(0)).current;
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showToast: ShowToastFn = useCallback(
    (msg, t = "success") => {
      if (timerRef.current) clearTimeout(timerRef.current);
      setMessage(msg);
      setType(t);
      Animated.timing(opacity, { toValue: 1, duration: 200, useNativeDriver: true }).start();
      timerRef.current = setTimeout(() => {
        Animated.timing(opacity, { toValue: 0, duration: 250, useNativeDriver: true }).start();
      }, 2000);
    },
    [opacity],
  );

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <ToastBanner message={message} type={type} opacity={opacity} />
    </ToastContext.Provider>
  );
}

function ToastBanner({
  message,
  type,
  opacity,
}: {
  message: string;
  type: ToastType;
  opacity: Animated.Value;
}) {
  const { colors } = useThemes();
  const bg =
    type === "success" ? colors.success : type === "error" ? colors.error : colors.info;

  return (
    <Animated.View
      style={[styles.wrap, { opacity }]}
      pointerEvents="none"
    >
      <View style={[styles.pill, { backgroundColor: bg }]}>
        <Text style={styles.icon}>
          {type === "success" ? "✓" : type === "error" ? "✕" : "i"}
        </Text>
        <Text style={styles.text} numberOfLines={2}>
          {message}
        </Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 64,
    left: 0,
    right: 0,
    alignItems: "center",
    zIndex: 9999,
  },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 999,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 6,
    maxWidth: "80%",
  },
  icon: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 14,
    lineHeight: 18,
  },
  text: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "600",
    lineHeight: 20,
    flexShrink: 1,
  },
});
