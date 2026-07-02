import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { BottomSheetContext } from "./context";
import { BottomSheetContextType, BottomSheetOptions } from "./type";
import { AppBottomSheet } from "./sheet";

type Props = {
  children: ReactNode;
};

type StackEntry = BottomSheetOptions & { key: number };
type DisplayEntry = StackEntry & { open: boolean };

export const BottomSheetProvider = ({ children }: Props) => {
  const stackRef = useRef<StackEntry[]>([]);
  const keyCounterRef = useRef(0);
  // displayEntries = active stack + entries still animating closed
  const [displayEntries, setDisplayEntries] = useState<DisplayEntry[]>([]);

  const show = useCallback((config: BottomSheetOptions) => {
    const key = (keyCounterRef.current += 1, keyCounterRef.current);
    const entry: StackEntry = { ...config, key };
    stackRef.current = [...stackRef.current, entry];
    setDisplayEntries((prev) => [...prev.filter((e) => e.key !== key), { ...entry, open: true }]);
  }, []);

  const hide = useCallback(() => {
    if (stackRef.current.length === 0) return;
    const top = stackRef.current[stackRef.current.length - 1];
    stackRef.current = stackRef.current.slice(0, -1);
    setDisplayEntries((prev) => prev.filter((e) => e.key !== top.key));
  }, []);

  const update = useCallback((patch: Partial<BottomSheetOptions>) => {
    if (stackRef.current.length === 0) return;
    const topKey = stackRef.current[stackRef.current.length - 1].key;
    const updated = [...stackRef.current];
    updated[updated.length - 1] = { ...updated[updated.length - 1], ...patch };
    stackRef.current = updated;
    setDisplayEntries((prev) => prev.map((e) => e.key === topKey ? { ...e, ...patch } : e));
  }, []);

  const handleClose = useCallback((key: number) => {
    const entry = stackRef.current.find((e) => e.key === key);
    entry?.onDismiss?.();
    stackRef.current = stackRef.current.filter((e) => e.key !== key);
    setDisplayEntries((prev) => prev.filter((e) => e.key !== key));
  }, []);

  const handleAnimationClose = useCallback((key: number) => {
    setDisplayEntries((prev) => prev.filter((e) => e.key !== key));
  }, []);

  const value = useMemo<BottomSheetContextType>(
    () => ({
      show,
      hide,
      update,
      isVisible: stackRef.current.length > 0,
    }),
    [show, hide, update],
  );

  return (
    <BottomSheetContext.Provider value={value}>
      {children}

      {displayEntries.map((entry, i) => {
        const isTop = i === displayEntries.length - 1;
        return (
          <AppBottomSheet
            key={entry.key}
            open={entry.open}
            onClose={() => handleClose(entry.key)}
            onAnimationClose={() => handleAnimationClose(entry.key)}
            snapPoints={entry.snapPoints}
            showDragIndicator={entry.showDragIndicator}
            backgroundStyle={entry.backgroundStyle}
            // only top sheet intercepts gestures/backdrop
            enablePanDownToClose={isTop ? (entry.enablePanDownToClose ?? true) : false}
            isTop={isTop}
          >
            {entry.content}
          </AppBottomSheet>
        );
      })}
    </BottomSheetContext.Provider>
  );
};
