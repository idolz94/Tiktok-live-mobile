import { ReactNode } from "react";
import { FloatingContainer } from "./floating-container";
import { PopoverEntry } from "./types";

interface PopoverPortalProps {
  entries: PopoverEntry[];
  contentOverrides: Record<string, ReactNode>;
  onClose: (id: string) => void;
  onExitComplete: (id: string) => void;
}

/**
 * Render layer that hosts all active floating popovers.
 */
export function PopoverPortal({ entries, contentOverrides, onClose, onExitComplete }: PopoverPortalProps) {
  if (entries.length === 0) return null;

  return (
    <>
      {entries.map((entry) => (
        <FloatingContainer
          key={entry.id}
          entry={entry}
          contentOverride={contentOverrides[entry.id]}
          onClose={() => onClose(entry.id)}
          onExitComplete={() => onExitComplete(entry.id)}
        />
      ))}
    </>
  );
}
