import { ReactNode, useCallback, useMemo, useState } from "react";
import { BottomSheetContext } from "./context";
import { BottomSheetContextType, BottomSheetOptions } from "./type";
import { AppBottomSheet } from "./sheet";

type Props = {
  children: ReactNode;
};

export const BottomSheetProvider = ({ children }: Props) => {
  const [visible, setVisible] = useState(false);

  const [options, setOptions] = useState<BottomSheetOptions | null>(null);

  const show = useCallback((config: BottomSheetOptions) => {
    setOptions(config);
    setVisible(true);
  }, []);

  const hide = useCallback(() => {
    setVisible(false);

    setTimeout(() => {
      setOptions(null);
    }, 200);
  }, []);

  const update = useCallback((patch: Partial<BottomSheetOptions>) => {
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
        onClose={hide}
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
