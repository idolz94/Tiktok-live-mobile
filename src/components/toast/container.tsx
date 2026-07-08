import React from "react";
import { StyleSheet, View, ViewStyle } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useSharedValue } from "react-native-reanimated";
import { useToastStore } from "./store";
import { ToastItem } from "./item";
import { ToastPlacement } from "./type";

export function ToastContainer() {
  const toasts = useToastStore((state) => state.toasts);
  const maxVisible = useToastStore((state) => state.maxVisible);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const removeToast = useToastStore((state) => state.removeToast);
  const insets = useSafeAreaInsets();

  // Create independent shared height maps for each placement to isolate animations
  const heightsTop = useSharedValue<Record<string, number>>({});
  const heightsBottom = useSharedValue<Record<string, number>>({});
  const heightsTopLeft = useSharedValue<Record<string, number>>({});
  const heightsTopRight = useSharedValue<Record<string, number>>({});
  const heightsBottomLeft = useSharedValue<Record<string, number>>({});
  const heightsBottomRight = useSharedValue<Record<string, number>>({});
  const heightsCenter = useSharedValue<Record<string, number>>({});

  const getHeightsSharedValue = (placement: ToastPlacement) => {
    switch (placement) {
      case "top":
        return heightsTop;
      case "bottom":
        return heightsBottom;
      case "top-left":
        return heightsTopLeft;
      case "top-right":
        return heightsTopRight;
      case "bottom-left":
        return heightsBottomLeft;
      case "bottom-right":
        return heightsBottomRight;
      case "center":
        return heightsCenter;
    }
  };

  const placements: ToastPlacement[] = [
    "top",
    "bottom",
    "top-left",
    "top-right",
    "bottom-left",
    "bottom-right",
    "center",
  ];

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {placements.map((placement) => {
        const placementToasts = toasts.filter((t) => t.placement === placement);
        if (placementToasts.length === 0) return null;

        // Group active vs dismissing toasts
        const active = placementToasts.filter((t) => t.visible);
        const dismissing = placementToasts.filter((t) => !t.visible);

        // Keep only up to maxVisible active toasts
        const visibleActive = active.slice(0, maxVisible);

        // Render visible active toasts + any currently dismissing toasts
        const renderedToasts = placementToasts.filter(
          (t) =>
            visibleActive.some((va) => va.id === t.id) ||
            dismissing.some((d) => d.id === t.id)
        );

        // Get visible ids list in order to calculate stack layout translations
        const visibleIds = renderedToasts.map((t) => t.id);
        const toastHeights = getHeightsSharedValue(placement);

        // Generate container styles for each placement
        const containerStyle: ViewStyle = (() => {
          switch (placement) {
            case "top":
              return {
                top: insets.top + 8,
                left: 0,
                right: 0,
                alignItems: "center" as const,
              };
            case "bottom":
              return {
                bottom: insets.bottom + 8,
                left: 0,
                right: 0,
                alignItems: "center" as const,
              };
            case "top-left":
              return {
                top: insets.top + 8,
                left: 16,
                alignItems: "flex-start" as const,
              };
            case "top-right":
              return {
                top: insets.top + 8,
                right: 16,
                alignItems: "flex-end" as const,
              };
            case "bottom-left":
              return {
                bottom: insets.bottom + 8,
                left: 16,
                alignItems: "flex-start" as const,
              };
            case "bottom-right":
              return {
                bottom: insets.bottom + 8,
                right: 16,
                alignItems: "flex-end" as const,
              };
            case "center":
              return {
                top: "50%" as any,
                left: 0,
                right: 0,
                transform: [{ translateY: -50 }],
                alignItems: "center" as const,
                justifyContent: "center" as const,
              };
          }
        })();

        return (
          <View
            key={placement}
            style={[styles.placementContainer, containerStyle]}
            pointerEvents="box-none"
          >
            {renderedToasts.map((toast, index) => (
              <ToastItem
                key={toast.id}
                toast={toast}
                index={index}
                visibleIds={visibleIds}
                toastHeights={toastHeights}
                onDismiss={dismissToast}
                onRemove={removeToast}
              />
            ))}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  placementContainer: {
    position: "absolute",
    zIndex: 9999,
  },
});
