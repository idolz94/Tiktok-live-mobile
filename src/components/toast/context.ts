import { createContext } from "react";
import { ToastMethods } from "./type";

export const ToastContext = createContext<ToastMethods | null>(null);
