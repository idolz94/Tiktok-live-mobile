import { create } from "zustand";

type CustomerRefreshStore = {
  tick: number;
  invalidate: () => void;
};

export const useCustomerRefreshStore = create<CustomerRefreshStore>((set) => ({
  tick: 0,
  invalidate: () => set((s) => ({ tick: s.tick + 1 })),
}));
