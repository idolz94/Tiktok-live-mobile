import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { zustandStorage } from "@utils/storage/mmkv";
import { STORAGE_KEYS } from "@utils/storage/constants";
import type { PrinterConfig } from "../types/printer";
import { DEFAULT_PRINTER_CONFIG } from "../types/printer";

type PrinterState = {
  config: PrinterConfig;
  setConfig: (config: Partial<PrinterConfig>) => void;
  clearConfig: () => void;
};

export const usePrinterStore = create<PrinterState>()(
  persist(
    (set) => ({
      config: DEFAULT_PRINTER_CONFIG,

      setConfig: (partial) =>
        set((state) => ({ config: { ...state.config, ...partial } })),

      clearConfig: () => set({ config: DEFAULT_PRINTER_CONFIG }),
    }),
    {
      name: STORAGE_KEYS.PRINTER_CONFIG,
      storage: createJSONStorage(() => zustandStorage),
    },
  ),
);
