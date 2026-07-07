import { RefObject, useCallback } from "react";
import { AnchorRect } from "../types";

/**
 * Utility function to measure a component's position on the screen.
 * Returns a Promise that resolves with screen-relative coordinates.
 */
export function measureAnchorRef(ref: RefObject<any>): Promise<AnchorRect> {
  return new Promise((resolve, reject) => {
    if (!ref || !ref.current) {
      reject(new Error("Anchor ref is not resolved yet or is null"));
      return;
    }

    ref.current.measureInWindow((x: number, y: number, width: number, height: number) => {
      // In some native environments (like Android, or when mounting), measureInWindow 
      // might return 0 or undefined values if the layout hasn't settled.
      if (width === undefined || height === undefined || (x === 0 && y === 0 && width === 0 && height === 0)) {
        // Fallback to standard measure (which returns pageX, pageY)
        ref.current.measure(
          (_fx: number, _fy: number, w: number, h: number, pageX: number, pageY: number) => {
            if (w === undefined || h === undefined) {
              reject(new Error("Could not measure anchor layout"));
            } else {
              resolve({ x: pageX, y: pageY, width: w, height: h });
            }
          }
        );
      } else {
        resolve({ x, y, width, height });
      }
    });
  });
}

/**
 * Custom hook to measure anchor layout.
 */
export function useAnchorMeasure() {
  const measure = useCallback((ref: RefObject<any>) => {
    return measureAnchorRef(ref);
  }, []);

  return { measure };
}
