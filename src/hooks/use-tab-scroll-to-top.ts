import { useEffect, useRef } from "react";
import { create } from "zustand";

interface ScrollToTopState {
  triggers: Record<string, number>;
  triggerScrollToTop: (tabName: string) => void;
}

export const useScrollToTopStore = create<ScrollToTopState>((set) => ({
  triggers: {},
  triggerScrollToTop: (tabName) =>
    set((state) => ({
      triggers: {
        ...state.triggers,
        [tabName]: Date.now(),
      },
    })),
}));

export function useTabScrollToTop(
  tabName: string,
  scrollRef: React.RefObject<any>,
  options?: { isFlatList?: boolean; animated?: boolean },
) {
  const lastTriggerRef = useRef(0);
  const trigger = useScrollToTopStore((state) => state.triggers[tabName]);
  const isFlatList = options?.isFlatList ?? false;
  const animated = options?.animated ?? true;

  useEffect(() => {
    if (trigger && trigger !== lastTriggerRef.current) {
      lastTriggerRef.current = trigger;
      if (scrollRef.current) {
        try {
          if (isFlatList) {
            // For FlatList / FlashList
            if (typeof scrollRef.current.scrollToOffset === "function") {
              scrollRef.current.scrollToOffset({ offset: 0, animated });
            } else if (typeof scrollRef.current.scrollToIndex === "function") {
              scrollRef.current.scrollToIndex({ index: 0, animated });
            }
          } else {
            // For ScrollView / Animated.ScrollView
            if (typeof scrollRef.current.scrollTo === "function") {
              scrollRef.current.scrollTo({ y: 0, animated });
            }
          }
        } catch (e) {
          console.warn("Failed to scroll to top:", e);
        }
      }
    }
  }, [trigger, scrollRef, isFlatList, animated]);
}
