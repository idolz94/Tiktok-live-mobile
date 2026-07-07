import React, { cloneElement, useEffect, useRef, useState } from "react";
import { usePopoverActions } from "./hooks/use-popover";
import { PopoverOptions } from "./types";

interface PopoverProps extends Omit<PopoverOptions, "anchorRef" | "content"> {
  /**
   * The trigger element (e.g. Button, Pressable, Icon) that users tap to show the popover.
   */
  trigger: React.ReactElement<{ onPress?: (e: any) => void; ref?: any }>;

  /**
   * The content to show inside the popover (e.g. list of menu items).
   */
  children: React.ReactNode;

  /**
   * Controlled open state.
   */
  visible?: boolean;

  /**
   * Callback fired when the open state changes.
   */
  onVisibleChange?: (visible: boolean) => void;
}

/**
 * Declarative Popover Component.
 * Clones the trigger element, handles ref measurement, and triggers popover portal display.
 */
export function Popover({
  trigger,
  children,
  visible: controlledVisible,
  onVisibleChange,
  placement = "auto",
  offset,
  showArrow,
  arrowSize,
  showBackdrop,
  closeOnOutsidePress,
  onDismiss,
  contentStyle,
  backdropStyle,
  animationDuration,
}: PopoverProps) {
  const { showPopover, updatePopoverContent, hidePopover } = usePopoverActions();
  const triggerRef = useRef<any>(null);

  // Store latest children in ref to avoid effect re-fires on inline JSX
  const contentRef = useRef<React.ReactNode>(children);
  contentRef.current = children;

  // Store latest callbacks in refs for stable effect closures
  const onDismissRef = useRef(onDismiss);
  onDismissRef.current = onDismiss;
  const onVisibleChangeRef = useRef(onVisibleChange);
  onVisibleChangeRef.current = onVisibleChange;

  const [uncontrolledVisible, setUncontrolledVisible] = useState(false);
  const isControlled = controlledVisible !== undefined;
  const isVisible = isControlled ? controlledVisible : uncontrolledVisible;

  const popoverIdRef = useRef<string | null>(null);

  // Clean up popover on unmount
  useEffect(() => {
    return () => {
      if (popoverIdRef.current) {
        hidePopover(popoverIdRef.current);
      }
    };
  }, [hidePopover]);

  // Show/hide popover only when visibility actually changes
  useEffect(() => {
    if (isVisible) {
      const id = showPopover({
        content: contentRef.current,
        anchorRef: triggerRef,
        placement,
        offset,
        showArrow,
        arrowSize,
        showBackdrop,
        closeOnOutsidePress,
        contentStyle,
        backdropStyle,
        animationDuration,
        onDismiss: () => {
          popoverIdRef.current = null;
          if (isControlled) {
            onVisibleChangeRef.current?.(false);
          } else {
            setUncontrolledVisible(false);
          }
          onDismissRef.current?.();
        },
      });
      popoverIdRef.current = id;
    } else {
      if (popoverIdRef.current) {
        hidePopover(popoverIdRef.current);
      }
    }
  }, [isVisible]); // eslint-disable-line react-hooks/exhaustive-deps

  // Update popover content reactively when children change while open
  useEffect(() => {
    if (popoverIdRef.current && isVisible) {
      updatePopoverContent(popoverIdRef.current, children);
    }
  }, [children, isVisible, updatePopoverContent]);

  const handlePress = (e: any) => {
    if (trigger.props.onPress) {
      trigger.props.onPress(e);
    }

    if (!isControlled) {
      setUncontrolledVisible((prev) => !prev);
    } else {
      onVisibleChange?.(!controlledVisible);
    }
  };

  const setMergedRef = (node: any) => {
    triggerRef.current = node;
    const { ref } = trigger as any;
    if (ref) {
      if (typeof ref === "function") {
        ref(node);
      } else if (typeof ref === "object") {
        ref.current = node;
      }
    }
  };

  return cloneElement(trigger, {
    ref: setMergedRef,
    onPress: handlePress,
  });
}
