import { create } from "zustand";
import { getSpxAccountApi, createSpxAccountApi, deleteSpxAccountApi } from "../service/spx-account-api";

type SpxAccountState = {
  connected: boolean;
  submitting: boolean;
  initialized: boolean;
  initialize: () => Promise<void>;
  connect: (data: { phone: string; email?: string }) => Promise<boolean>;
  disconnect: () => Promise<boolean>;
};

export const useSpxAccountStore = create<SpxAccountState>((set) => ({
  connected: false,
  submitting: false,
  initialized: false,

  initialize: async () => {
    try {
      const r = await getSpxAccountApi();
      set({ connected: r.connected, initialized: true });
    } catch {
      set({ initialized: true });
    }
  },

  connect: async (data) => {
    set({ submitting: true });
    try {
      await createSpxAccountApi(data);
      set({ connected: true });
      return true;
    } catch {
      return false;
    } finally {
      set({ submitting: false });
    }
  },

  disconnect: async () => {
    set({ submitting: true });
    try {
      await deleteSpxAccountApi();
      set({ connected: false });
      return true;
    } catch {
      return false;
    } finally {
      set({ submitting: false });
    }
  },
}));
