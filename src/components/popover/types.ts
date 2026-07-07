import { ReactNode, RefObject } from "react";
import { StyleProp, ViewStyle } from "react-native";

export interface AnchorRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export type PopoverPlacement = "top" | "bottom" | "left" | "right" | "auto";

export type PopoverResolvedPlacement = "top" | "bottom" | "left" | "right";

export interface PopoverPosition {
  x: number;
  y: number;
  placement: PopoverResolvedPlacement;
  arrowX?: number;
  arrowY?: number;
}

export interface PopoverOptions {
  /**
   * Unique ID for the popover. Generated if not provided.
   */
  id?: string;
  
  /**
   * Content to render inside the popover.
   */
  content: ReactNode;
  
  /**
   * Reference object to the anchor component (trigger).
   */
  anchorRef: RefObject<any>;
  
  /**
   * Preferred placement relative to the anchor.
   * @default "auto"
   */
  placement?: PopoverPlacement;
  
  /**
   * Distance between popover and the anchor in pixels.
   * @default 8
   */
  offset?: number;
  
  /**
   * Whether to show the triangular arrow pointing to the anchor.
   * @default true
   */
  showArrow?: boolean;
  
  /**
   * The size of the arrow (width & height).
   * @default 8
   */
  arrowSize?: number;
  
  /**
   * Whether to render a backdrop behind the popover.
   * @default true
   */
  showBackdrop?: boolean;
  
  /**
   * Whether tapping outside the popover (on backdrop) closes it.
   * @default true
   */
  closeOnOutsidePress?: boolean;
  
  /**
   * Callback fired when the popover is dismissed.
   */
  onDismiss?: () => void;
  
  /**
   * Custom style for the popover content wrapper.
   */
  contentStyle?: StyleProp<ViewStyle>;
  
  /**
   * Custom style for the backdrop.
   */
  backdropStyle?: StyleProp<ViewStyle>;
  
  /**
   * Animation duration in milliseconds.
   * @default 150
   */
  animationDuration?: number;
}

export interface PopoverEntry extends PopoverOptions {
  id: string;
  /**
   * Controls open state for animate-out.
   */
  open: boolean;
}

export interface PopoverActionsContextType {
  showPopover: (options: PopoverOptions) => string;
  updatePopoverContent: (id: string, content: ReactNode) => void;
  hidePopover: (id?: string) => void;
  hideAllPopovers: () => void;
}

export interface PopoverStateContextType {
  activePopovers: PopoverEntry[];
}

export interface PopoverContextType
  extends PopoverActionsContextType,
    PopoverStateContextType {}
