import React, { ReactNode, useCallback, useMemo } from "react";
import { ToastContext } from "./context";
import { ToastContainer } from "./container";
import { useToastStore } from "./store";
import { ToastMethods, ToastOptions, ToastPromiseConfig } from "./type";

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const addToast = useToastStore((state) => state.addToast);
  const updateToast = useToastStore((state) => state.updateToast);
  const dismissToast = useToastStore((state) => state.dismissToast);
  const dismissAllToasts = useToastStore((state) => state.dismissAllToasts);

  const show = useCallback(
    (options: ToastOptions | string) => {
      const parsedOptions = typeof options === "string" ? { title: options } : options;
      return addToast(parsedOptions);
    },
    [addToast]
  );

  const success = useCallback(
    (options: ToastOptions | string) => {
      const parsedOptions = typeof options === "string" ? { title: options } : options;
      return addToast({ ...parsedOptions, variant: "success" });
    },
    [addToast]
  );

  const error = useCallback(
    (options: ToastOptions | string) => {
      const parsedOptions = typeof options === "string" ? { title: options } : options;
      return addToast({ ...parsedOptions, variant: "error" });
    },
    [addToast]
  );

  const warning = useCallback(
    (options: ToastOptions | string) => {
      const parsedOptions = typeof options === "string" ? { title: options } : options;
      return addToast({ ...parsedOptions, variant: "warning" });
    },
    [addToast]
  );

  const info = useCallback(
    (options: ToastOptions | string) => {
      const parsedOptions = typeof options === "string" ? { title: options } : options;
      return addToast({ ...parsedOptions, variant: "info" });
    },
    [addToast]
  );

  const dismiss = useCallback(
    (id: string) => {
      dismissToast(id);
    },
    [dismissToast]
  );

  const dismissAll = useCallback(() => {
    dismissAllToasts();
  }, [dismissAllToasts]);

  const update = useCallback(
    (id: string, options: Partial<ToastOptions>) => {
      updateToast(id, options);
    },
    [updateToast]
  );

  const promise = useCallback(
    async <T,>(promiseToTrack: Promise<T>, config: ToastPromiseConfig<T>): Promise<T> => {
      const loadingOpts = typeof config.loading === "string" ? { title: config.loading } : config.loading;
      const id = addToast({ ...loadingOpts, variant: "loading", persistent: true });

      try {
        const data = await promiseToTrack;
        const successOpts =
          typeof config.success === "function"
            ? config.success(data)
            : typeof config.success === "string"
            ? { title: config.success }
            : config.success;

        updateToast(id, {
          ...successOpts,
          variant: "success",
          persistent: false, // Allow auto-dismissal now
        });
        return data;
      } catch (err) {
        const errorOpts =
          typeof config.error === "function"
            ? config.error(err)
            : typeof config.error === "string"
            ? { title: config.error }
            : config.error;

        updateToast(id, {
          ...errorOpts,
          variant: "error",
          persistent: false, // Allow auto-dismissal now
        });
        throw err;
      }
    },
    [addToast, updateToast]
  );

  const contextValue = useMemo<ToastMethods>(
    () => ({
      show,
      success,
      error,
      warning,
      info,
      dismiss,
      dismissAll,
      update,
      promise,
    }),
    [show, success, error, warning, info, dismiss, dismissAll, update, promise]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
}
