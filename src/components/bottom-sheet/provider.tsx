import { ReactNode, createRef, useCallback, useMemo, useRef, useState } from "react";
import { type BottomSheetMethods } from "@expo/ui/community/bottom-sheet";
import { BottomSheetContext } from "./context";
import { BottomSheetContextType, BottomSheetOptions } from "./type";
import { AppBottomSheet } from "./sheet";

type Props = {
  children: ReactNode;
};

type StackEntry = BottomSheetOptions & { key: number; sheetRef: React.RefObject<BottomSheetMethods | null> };
type DisplayEntry = StackEntry & { open: boolean };

// --- Thời gian animation dismiss của SwiftUI sheet (ms) ---
const DISMISS_ANIMATION_MS = 350;

export const BottomSheetProvider = ({ children }: Props) => {
  const stackRef = useRef<StackEntry[]>([]);
  const closingByCodeKeysRef = useRef(new Set<number>());
  const keyCounterRef = useRef(0);
  const [displayEntries, setDisplayEntries] = useState<DisplayEntry[]>([]);

  const show = useCallback((config: BottomSheetOptions) => {
    const key = (keyCounterRef.current += 1, keyCounterRef.current);
    const sheetRef = createRef<BottomSheetMethods | null>();
    const entry: StackEntry = { ...config, key, sheetRef };
    stackRef.current = [...stackRef.current, entry];
    setDisplayEntries((prev) => [...prev.filter((e) => e.key !== key), { ...entry, open: true }]);
  }, []);

  // --- Đóng sheet bằng code (button close): gọi ref.close() để animate kéo xuống ---
  const hide = useCallback(() => {
    if (stackRef.current.length === 0) return;
    const top = stackRef.current[stackRef.current.length - 1];
    stackRef.current = stackRef.current.slice(0, -1);
    closingByCodeKeysRef.current.add(top.key);
    // Gọi native close để chạy animation kéo xuống
    top.sheetRef.current?.close();
    // Xóa khỏi DOM sau khi animation xong
    setTimeout(() => {
      closingByCodeKeysRef.current.delete(top.key);
      setDisplayEntries((prev) => prev.filter((e) => e.key !== top.key));
    }, DISMISS_ANIMATION_MS);
  }, []);
  // --- end Đóng sheet ---

  const update = useCallback((patch: Partial<BottomSheetOptions>) => {
    if (stackRef.current.length === 0) return;
    const topKey = stackRef.current[stackRef.current.length - 1].key;
    const updated = [...stackRef.current];
    updated[updated.length - 1] = { ...updated[updated.length - 1], ...patch };
    stackRef.current = updated;
    setDisplayEntries((prev) => prev.map((e) => e.key === topKey ? { ...e, ...patch } : e));
  }, []);

  // --- Xử lý khi sheet bị đóng bởi swipe/backdrop; bỏ qua onClose do button tự kích hoạt ---
  const handleClose = useCallback((key: number) => {
    if (closingByCodeKeysRef.current.has(key)) return;
    const entry = stackRef.current.find((e) => e.key === key);
    entry?.onDismiss?.();
    stackRef.current = stackRef.current.filter((e) => e.key !== key);
    setDisplayEntries((prev) => prev.filter((e) => e.key !== key));
  }, []);
  // --- end Xử lý khi sheet bị đóng ---

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
            sheetRef={entry.sheetRef}
            open={entry.open}
            onClose={() => handleClose(entry.key)}
            snapPoints={entry.snapPoints}
            showDragIndicator={entry.showDragIndicator}
            backgroundStyle={entry.backgroundStyle}
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
