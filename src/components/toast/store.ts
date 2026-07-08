import { create } from "zustand";
import { ToastData, ToastOptions } from "./type";

interface ToastStoreState {
  toasts: ToastData[];
  maxVisible: number;
  addToast: (options: ToastOptions) => string;
  updateToast: (id: string, options: Partial<ToastOptions>) => void;
  dismissToast: (id: string) => void;
  dismissAllToasts: () => void;
  removeToast: (id: string) => void;
  setMaxVisible: (max: number) => void;
}

export const useToastStore = create<ToastStoreState>((set) => ({
  toasts: [],
  maxVisible: 3,
  setMaxVisible: (maxVisible) => set({ maxVisible }),

  addToast: (options) => {
    const id =
      options.id || `toast-${Math.random().toString(36).substring(2, 9)}`;
    const newToast: ToastData = {
      id,
      title: options.title,
      description: options.description,
      variant: options.variant || "info",
      duration: options.duration !== undefined ? options.duration : 2000,
      placement: options.placement || "top",
      icon: options.icon,
      action: options.action,
      persistent: options.persistent || false,
      createdAt: options.createdAt || Date.now(),
      visible: true,
      accessibilityRole: options.accessibilityRole,
    };

    set((state) => {
      // Remove any existing toast with the same ID to prevent duplication
      const filtered = state.toasts.filter((t) => t.id !== id);
      return { toasts: [...filtered, newToast] };
    });

    return id;
  },

  updateToast: (id, options) => {
    set((state) => ({
      toasts: state.toasts.map((t) => (t.id === id ? { ...t, ...options } : t)),
    }));
  },

  dismissToast: (id) => {
    set((state) => ({
      toasts: state.toasts.map((t) =>
        t.id === id ? { ...t, visible: false } : t,
      ),
    }));
  },

  dismissAllToasts: () => {
    set((state) => ({
      toasts: state.toasts.map((t) => ({ ...t, visible: false })),
    }));
  },

  removeToast: (id) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }));
  },
}));
