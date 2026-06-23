import { useThemes } from "@hooks/use-theme";
import { useEffect, useRef, useState } from "react";
import { Animated, StyleSheet } from "react-native";

type Props = {
  message?: string;
};

export function AnimatedErrorText({ message }: Props) {
  const { colors, textPresets } = useThemes();

  const [debouncedMessage, setDebouncedMessage] = useState<string | undefined>(undefined);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    if (message) {
      timerRef.current = setTimeout(() => {
        setDebouncedMessage(message);
      }, 500);
    } else {
      setDebouncedMessage(undefined);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [message]);

  const visible = Boolean(debouncedMessage);

  const heightAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(heightAnim, {
          toValue: 20,
          useNativeDriver: false,
          damping: 18,
          stiffness: 180,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 180,
          useNativeDriver: false,
        }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(heightAnim, {
          toValue: 0,
          duration: 140,
          useNativeDriver: false,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 100,
          useNativeDriver: false,
        }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.Text
      style={[
        styles.base,
        textPresets.fs12_400,
        { color: colors.error, height: heightAnim, opacity: opacityAnim },
      ]}
      numberOfLines={1}
    >
      {debouncedMessage}
    </Animated.Text>
  );
}

const styles = StyleSheet.create({
  base: {
    overflow: "hidden",
    marginTop: 4,
  },
});
