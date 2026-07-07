import { EdgeInsets } from "react-native-safe-area-context";

interface Viewport {
  width: number;
  height: number;
}

/**
 * Checks if a bounding box (x, y, width, height) fits entirely inside the safe viewport boundaries.
 */
export function fitsInViewport(
  x: number,
  y: number,
  width: number,
  height: number,
  viewport: Viewport,
  insets: EdgeInsets,
  padding: number
): boolean {
  const minX = (insets?.left ?? 0) + padding;
  const maxX = viewport.width - (insets?.right ?? 0) - padding;
  const minY = (insets?.top ?? 0) + padding;
  const maxY = viewport.height - (insets?.bottom ?? 0) - padding;

  return (
    x >= minX &&
    x + width <= maxX &&
    y >= minY &&
    y + height <= maxY
  );
}
