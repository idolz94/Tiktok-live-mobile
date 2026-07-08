import { ReactNode } from "react";

export type ToastVariant = "success" | "error" | "warning" | "info" | "loading";

export type ToastPlacement =
  | "top"
  | "bottom"
  | "top-left"
  | "top-right"
  | "bottom-left"
  | "bottom-right"
  | "center";

export interface ToastAction {
  label: string;
  callback: (id: string) => void;
  closeOnPress?: boolean;
}

export interface ToastOptions {
  id?: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  variant?: ToastVariant;
  duration?: number;
  placement?: ToastPlacement;
  icon?: string | ReactNode;
  action?: ToastAction;
  persistent?: boolean;
  createdAt?: number;
  visible?: boolean;
  accessibilityRole?: string;
}

export interface ToastData {
  id: string;
  title?: string | ReactNode;
  description?: string | ReactNode;
  variant: ToastVariant;
  duration: number;
  placement: ToastPlacement;
  icon?: string | ReactNode;
  action?: ToastAction;
  persistent: boolean;
  createdAt: number;
  visible: boolean;
  accessibilityRole?: string;
}

export interface ToastPromiseConfig<T> {
  loading: Omit<ToastOptions, "variant"> | string;
  success: ((data: T) => Omit<ToastOptions, "variant">) | Omit<ToastOptions, "variant"> | string;
  error: ((err: any) => Omit<ToastOptions, "variant">) | Omit<ToastOptions, "variant"> | string;
}

export interface ToastMethods {
  show: (options: ToastOptions | string) => string;
  success: (options: ToastOptions | string) => string;
  error: (options: ToastOptions | string) => string;
  warning: (options: ToastOptions | string) => string;
  info: (options: ToastOptions | string) => string;
  dismiss: (id: string) => void;
  dismissAll: () => void;
  update: (id: string, options: Partial<ToastOptions>) => void;
  promise: <T>(promise: Promise<T>, config: ToastPromiseConfig<T>) => Promise<T>;
}
