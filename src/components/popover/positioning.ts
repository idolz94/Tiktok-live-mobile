import { EdgeInsets } from "react-native-safe-area-context";
import { AnchorRect, PopoverPosition, PopoverPlacement, PopoverResolvedPlacement } from "./types";
import { fitsInViewport } from "./collision";
import { PLACEMENT_FALLBACKS } from "./constants";

interface PositionParams {
  anchor: AnchorRect;
  contentSize: { width: number; height: number };
  viewport: { width: number; height: number };
  insets: EdgeInsets;
  placement: PopoverPlacement;
  offset: number;
  padding: number;
  arrowSize: number;
}

/**
 * Calculates the absolute position of the popover and the relative position of the arrow.
 */
export function computePosition({
  anchor,
  contentSize,
  viewport,
  insets,
  placement,
  offset,
  padding,
  arrowSize,
}: PositionParams): PopoverPosition {
  const safeInsets = {
    top: insets?.top ?? 0,
    bottom: insets?.bottom ?? 0,
    left: insets?.left ?? 0,
    right: insets?.right ?? 0,
  };

  const getCandidatePosition = (
    candidate: PopoverResolvedPlacement
  ): PopoverPosition => {
    let x = 0;
    let y = 0;

    switch (candidate) {
      case "top":
        y = anchor.y - contentSize.height - offset;
        x = anchor.x + (anchor.width - contentSize.width) / 2;
        break;
      case "bottom":
        y = anchor.y + anchor.height + offset;
        x = anchor.x + (anchor.width - contentSize.width) / 2;
        break;
      case "left":
        x = anchor.x - contentSize.width - offset;
        y = anchor.y + (anchor.height - contentSize.height) / 2;
        break;
      case "right":
        x = anchor.x + anchor.width + offset;
        y = anchor.y + (anchor.height - contentSize.height) / 2;
        break;
    }

    // Apply Shifting along cross axis
    if (candidate === "top" || candidate === "bottom") {
      const minX = safeInsets.left + padding;
      const maxX = viewport.width - safeInsets.right - padding - contentSize.width;
      x = Math.max(minX, Math.min(x, maxX));
    } else {
      const minY = safeInsets.top + padding;
      const maxY = viewport.height - safeInsets.bottom - padding - contentSize.height;
      y = Math.max(minY, Math.min(y, maxY));
    }

    // Calculate Arrow coordinates relative to the popover container
    let arrowX = 0;
    let arrowY = 0;

    if (candidate === "top" || candidate === "bottom") {
      // Arrow Y: top points down (bottom of popover), bottom points up (top of popover)
      arrowY = candidate === "top" ? contentSize.height - 1 : -arrowSize + 1;

      // Arrow X: align with anchor center
      const anchorCenterX = anchor.x + anchor.width / 2;
      const idealArrowX = anchorCenterX - x - arrowSize / 2;
      
      // Clamp arrow within popover boundaries (with some padding from card edges)
      const minArrowX = arrowSize;
      const maxArrowX = contentSize.width - arrowSize * 2;
      arrowX = Math.max(minArrowX, Math.min(idealArrowX, maxArrowX));
    } else {
      // Arrow X: left points right (right of popover), right points left (left of popover)
      arrowX = candidate === "left" ? contentSize.width - 1 : -arrowSize + 1;

      // Arrow Y: align with anchor center
      const anchorCenterY = anchor.y + anchor.height / 2;
      const idealArrowY = anchorCenterY - y - arrowSize / 2;

      // Clamp arrow within popover boundaries
      const minArrowY = arrowSize;
      const maxArrowY = contentSize.height - arrowSize * 2;
      arrowY = Math.max(minArrowY, Math.min(idealArrowY, maxArrowY));
    }

    return {
      x,
      y,
      placement: candidate,
      arrowX,
      arrowY,
    };
  };

  // 1. Resolve 'auto' placement
  if (placement === "auto") {
    // Try fallbacks: bottom -> top -> right -> left
    for (const candidate of PLACEMENT_FALLBACKS) {
      const pos = getCandidatePosition(candidate);
      if (fitsInViewport(pos.x, pos.y, contentSize.width, contentSize.height, viewport, safeInsets, padding)) {
        return pos;
      }
    }
    // If none fit perfectly, return the first fallback (bottom)
    return getCandidatePosition("bottom");
  }

  // 2. Resolve preferred placement
  const preferredPos = getCandidatePosition(placement);
  if (fitsInViewport(preferredPos.x, preferredPos.y, contentSize.width, contentSize.height, viewport, safeInsets, padding)) {
    return preferredPos;
  }

  // 3. Flip: If preferred placement overflows, try the opposite placement
  const oppositePlacement: Record<PopoverResolvedPlacement, PopoverResolvedPlacement> = {
    top: "bottom",
    bottom: "top",
    left: "right",
    right: "left",
  };
  const flippedPlacement = oppositePlacement[placement];
  const flippedPos = getCandidatePosition(flippedPlacement);
  if (fitsInViewport(flippedPos.x, flippedPos.y, contentSize.width, contentSize.height, viewport, safeInsets, padding)) {
    return flippedPos;
  }

  // 4. Default: If opposite placement also overflows, stick with preferred placement (which was shifted already)
  return preferredPos;
}
