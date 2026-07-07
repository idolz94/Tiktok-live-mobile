import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  ReactNode,
} from "react";
import { BackHandler } from "react-native";
import {
  PopoverActionsContextType,
  PopoverStateContextType,
  PopoverEntry,
  PopoverOptions,
} from "./types";
import { PopoverPortal } from "./popover-portal";

export const PopoverActionsContext =
  createContext<PopoverActionsContextType | null>(null);
export const PopoverStateContext =
  createContext<PopoverStateContextType | null>(null);

type PopoverProviderProps = {
  children: ReactNode;
};

export function PopoverProvider({ children }: PopoverProviderProps) {
  const [activePopovers, setActivePopovers] = useState<PopoverEntry[]>([]);
  const idCounter = useRef(0);

  // Separate content store — updates here do NOT propagate through state context
  const contentOverridesRef = useRef<Record<string, ReactNode>>({});
  const [, setPortalVersion] = useState(0);

  // Called by FloatingContainer when exit animation finishes — safe, no setTimeout
  const handleExitComplete = useCallback((id: string) => {
    delete contentOverridesRef.current[id];
    setActivePopovers((prev) => prev.filter((entry) => entry.id !== id));
  }, []);

  const showPopover = useCallback((options: PopoverOptions): string => {
    const id = options.id ?? `popover-${(idCounter.current += 1)}`;
    const newEntry: PopoverEntry = {
      ...options,
      id,
      open: true,
    };

    setActivePopovers((prev) => {
      const index = prev.findIndex((entry) => entry.id === id);
      if (index > -1) {
        const next = [...prev];
        next[index] = newEntry;
        return next;
      }
      return [...prev, newEntry];
    });

    return id;
  }, []);

  const updatePopoverContent = useCallback((id: string, content: ReactNode) => {
    contentOverridesRef.current[id] = content;
    setPortalVersion((v) => v + 1);
  }, []);

  const hidePopover = useCallback((id?: string) => {
    let dismissCallback: (() => void) | undefined;

    setActivePopovers((prev) => {
      if (prev.length === 0) return prev;

      const targetId = id ?? prev[prev.length - 1].id;
      const target = prev.find((entry) => entry.id === targetId);

      if (target && target.open) {
        dismissCallback = target.onDismiss;
        // Mark as closed — FloatingContainer animates out then calls onExitComplete
        return prev.map((entry) =>
          entry.id === targetId ? { ...entry, open: false } : entry,
        );
      }

      return prev;
    });

    // Call onDismiss outside the state updater to avoid nested setState loops
    dismissCallback?.();
  }, []);

  const hideAllPopovers = useCallback(() => {
    const dismissCallbacks: (() => void)[] = [];

    setActivePopovers((prev) => {
      if (prev.length === 0) return prev;

      prev.forEach((entry) => {
        if (entry.open && entry.onDismiss) {
          dismissCallbacks.push(entry.onDismiss);
        }
      });

      return prev.map((entry) => ({ ...entry, open: false }));
    });

    // Call onDismiss callbacks outside the state updater
    dismissCallbacks.forEach((cb) => cb());
  }, []);

  // Handle hardware back button on Android
  useEffect(() => {
    const handleBackPress = () => {
      const openPopovers = activePopovers.filter((p) => p.open);
      if (openPopovers.length > 0) {
        hidePopover(openPopovers[openPopovers.length - 1].id);
        return true;
      }
      return false;
    };

    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      handleBackPress,
    );

    return () => backHandler.remove();
  }, [activePopovers, hidePopover]);

  // Stable actions context — does not change on popover state updates
  const actionsValue = useMemo<PopoverActionsContextType>(
    () => ({ showPopover, updatePopoverContent, hidePopover, hideAllPopovers }),
    [showPopover, updatePopoverContent, hidePopover, hideAllPopovers],
  );

  // Reactive state context — only consumers that read state subscribe here
  const stateValue = useMemo<PopoverStateContextType>(
    () => ({ activePopovers }),
    [activePopovers],
  );

  return (
    <PopoverActionsContext.Provider value={actionsValue}>
      <PopoverStateContext.Provider value={stateValue}>
        {children}
        <PopoverPortal
          entries={activePopovers}
          contentOverrides={contentOverridesRef.current}
          onClose={hidePopover}
          onExitComplete={handleExitComplete}
        />
      </PopoverStateContext.Provider>
    </PopoverActionsContext.Provider>
  );
}
