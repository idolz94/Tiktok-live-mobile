import { createContext } from "react";
import { BottomSheetContextType } from "./type";

export const BottomSheetContext = createContext<BottomSheetContextType | null>(
  null,
);
