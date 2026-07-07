import { useContext } from "react";
import {
  PopoverActionsContextType,
  PopoverContextType,
  PopoverStateContextType,
} from "../types";
import { PopoverActionsContext, PopoverStateContext } from "../popover-provider";

/**
 * Hook to access Popover actions only (showPopover, hidePopover, hideAllPopovers).
 * Does NOT re-render when popover state changes — use this in most components.
 */
export function usePopoverActions(): PopoverActionsContextType {
  const context = useContext(PopoverActionsContext);
  if (!context) {
    throw new Error("usePopoverActions must be used within a PopoverProvider");
  }
  return context;
}

/**
 * Hook to access Popover state (activePopovers).
 * Only use when you need to read popover entries — causes re-render on every state change.
 */
export function usePopoverState(): PopoverStateContextType {
  const context = useContext(PopoverStateContext);
  if (!context) {
    throw new Error("usePopoverState must be used within a PopoverProvider");
  }
  return context;
}

/**
 * Hook to access full Popover controller APIs (actions + state).
 * Prefer usePopoverActions() when you only need show/hide.
 */
export function usePopover(): PopoverContextType {
  const actions = usePopoverActions();
  const state = usePopoverState();
  return { ...actions, ...state };
}
