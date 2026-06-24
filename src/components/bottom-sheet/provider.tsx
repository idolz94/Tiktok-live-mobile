import { ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { BottomSheetContext } from "./context";
import { BottomSheetContextType, BottomSheetOptions } from "./type";
import { AppBottomSheet } from "./sheet";

type Props = {
  children: ReactNode;
};

export const BottomSheetProvider = ({ children }: Props) => {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<BottomSheetOptions | null>(null);
  const onDismissRef = useRef<(() => void) | undefined>(undefined);

  const show = useCallback((config: BottomSheetOptions) => {
    onDismissRef.current = config.onDismiss;
    setOptions(config);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible((prev) => {
      if (!prev) return prev;
      setTimeout(() => setOptions(null), 200);
      return false;
    });
  }, []);

  const handleSheetClose = useCallback(() => {
    onDismissRef.current?.();
    hide();
  }, [hide]);

  const update = useCallback((patch: Partial<BottomSheetOptions>) => {
    if (patch.onDismiss !== undefined) onDismissRef.current = patch.onDismiss;
    setOptions((prev) => (prev ? { ...prev, ...patch } : prev));
  }, []);

  const value = useMemo<BottomSheetContextType>(
    () => ({
      show,
      hide,
      update,
      isVisible: visible,
    }),
    [show, hide, update, visible],
  );

  return (
    <BottomSheetContext.Provider value={value}>
      {children}

      <AppBottomSheet
        open={visible}
        onClose={handleSheetClose}
        snapPoints={options?.snapPoints}
        showDragIndicator={options?.showDragIndicator}
        backgroundStyle={options?.backgroundStyle}
        enablePanDownToClose={options?.enablePanDownToClose ?? true}
      >
        {options?.content}
      </AppBottomSheet>
    </BottomSheetContext.Provider>
  );
};
