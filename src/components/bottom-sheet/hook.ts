import { useContext } from "react";
import { BottomSheetContext } from "./context";

export const useBottomSheet = () => {
  const context = useContext(BottomSheetContext);

  if (!context) {
    throw new Error("useBottomSheet must be used within BottomSheetProvider");
  }

  return context;
};
