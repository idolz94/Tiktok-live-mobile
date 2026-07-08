import { useContext } from "react";
import { ToastContext } from "./context";
import { ToastMethods, ToastOptions, ToastVariant } from "./type";

export { ToastProvider } from "./provider";
export * from "./type";

export function useToast(): ToastMethods & ((message: string, type?: ToastVariant) => string) {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  // Backwards compatibility: allow calling toast as a function
  const callableToast = (message: string, type?: ToastVariant) => {
    return context.show({ title: message, variant: type || "info" });
  };

  // Assign all object methods (success, error, warning, info, promise, update, dismiss, etc.)
  Object.assign(callableToast, context);

  return callableToast as unknown as ToastMethods & ((message: string, type?: ToastVariant) => string);
}
