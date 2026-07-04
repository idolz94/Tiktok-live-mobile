import { ReactNode, createRef, useCallback, useMemo, useRef, useState } from "react";
import { type BottomSheetMethods } from "@expo/ui/community/bottom-sheet";
import { BottomSheetContext } from "./context";
import {
  BottomSheetContextType,
  BottomSheetDisplayEntry,
  BottomSheetEntry,
  BottomSheetId,
  BottomSheetOptions,
  BottomSheetUpdate,
} from "./type";
import { BottomSheetRenderer } from "./renderer";

type Props = {
  children: ReactNode;
};

const DISMISS_ANIMATION_MS = 350;

export const BottomSheetProvider = ({ children }: Props) => {
  const stackRef = useRef<BottomSheetEntry[]>([]);
  const closingByCodeIdsRef = useRef(new Set<BottomSheetId>());
  const idCounterRef = useRef(0);
  const [displayEntries, setDisplayEntries] = useState<BottomSheetDisplayEntry[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  const createEntry = useCallback((config: BottomSheetOptions): BottomSheetEntry => {
    const id = `bottom-sheet-${(idCounterRef.current += 1)}`;
    const sheetRef = createRef<BottomSheetMethods | null>();
    return { ...config, id, sheetRef };
  }, []);

  const removeDisplayEntries = useCallback((ids: BottomSheetId[]) => {
    setTimeout(() => {
      ids.forEach((id) => closingByCodeIdsRef.current.delete(id));
      setDisplayEntries((prev) => {
        const next = prev.filter((entry) => !ids.includes(entry.id));
        setIsVisible(next.length > 0);
        return next;
      });
    }, DISMISS_ANIMATION_MS);
  }, []);

  const closeEntries = useCallback(
    (entries: BottomSheetEntry[]) => {
      const ids = entries.map((entry) => entry.id);
      ids.forEach((id) => closingByCodeIdsRef.current.add(id));
      setDisplayEntries((prev) =>
        prev.map((entry) => (ids.includes(entry.id) ? { ...entry, open: false } : entry)),
      );
      removeDisplayEntries(ids);
    },
    [removeDisplayEntries],
  );

  const push = useCallback(
    (config: BottomSheetOptions) => {
      const entry = createEntry(config);
      stackRef.current = [...stackRef.current, entry];
      setDisplayEntries((prev) => [...prev, { ...entry, open: true }]);
      setIsVisible(true);
      return entry.id;
    },
    [createEntry],
  );

  const pop = useCallback(
    (id?: BottomSheetId) => {
      if (stackRef.current.length === 0) return;

      const targetId = id ?? stackRef.current[stackRef.current.length - 1].id;
      const targetIndex = stackRef.current.findIndex((entry) => entry.id === targetId);
      if (targetIndex === -1) return;

      const targets = stackRef.current.slice(targetIndex);
      stackRef.current = stackRef.current.slice(0, targetIndex);
      closeEntries(targets);
    },
    [closeEntries],
  );

  const dismissAll = useCallback(() => {
    if (stackRef.current.length === 0) return;

    const targets = [...stackRef.current];
    stackRef.current = [];
    closeEntries(targets);
  }, [closeEntries]);

  const update = useCallback<BottomSheetUpdate>((idOrPatch, patchArg?) => {
    const isTargetedUpdate = typeof idOrPatch === "string";
    const targetId = isTargetedUpdate
      ? idOrPatch
      : stackRef.current[stackRef.current.length - 1]?.id;
    const patch = isTargetedUpdate ? patchArg : idOrPatch;

    if (!targetId || !patch) return;

    stackRef.current = stackRef.current.map((entry) =>
      entry.id === targetId ? { ...entry, ...patch } : entry,
    );
    setDisplayEntries((prev) =>
      prev.map((entry) => (entry.id === targetId ? { ...entry, ...patch } : entry)),
    );
  }, []);

  const replace = useCallback(
    (config: BottomSheetOptions, id?: BottomSheetId) => {
      const targetId = id ?? stackRef.current[stackRef.current.length - 1]?.id;
      if (!targetId) return push(config);

      let replacedId = targetId;
      stackRef.current = stackRef.current.map((entry) => {
        if (entry.id !== targetId) return entry;
        replacedId = entry.id;
        return { ...config, id: entry.id, sheetRef: entry.sheetRef };
      });
      setDisplayEntries((prev) =>
        prev.map((entry) =>
          entry.id === targetId
            ? { ...config, id: entry.id, sheetRef: entry.sheetRef, open: entry.open }
            : entry,
        ),
      );
      return replacedId;
    },
    [push],
  );

  const peek = useCallback(
    () => stackRef.current[stackRef.current.length - 1],
    [],
  );

  const handleClose = useCallback((id: BottomSheetId) => {
    if (closingByCodeIdsRef.current.has(id)) return;

    const targetIndex = stackRef.current.findIndex((entry) => entry.id === id);
    if (targetIndex === -1) return;

    const targets = stackRef.current.slice(targetIndex);
    targets[0]?.onDismiss?.();
    stackRef.current = stackRef.current.slice(0, targetIndex);
    setDisplayEntries((prev) => {
      const displayTargetIndex = prev.findIndex((entry) => entry.id === id);
      return displayTargetIndex === -1 ? prev : prev.slice(0, displayTargetIndex);
    });
  }, []);

  const value = useMemo<BottomSheetContextType>(
    () => ({
      push,
      pop,
      replace,
      dismissAll,
      update,
      peek,
      show: push,
      hide: pop,
      hideAll: dismissAll,
      isVisible,
    }),
    [push, pop, replace, dismissAll, update, peek, isVisible],
  );

  return (
    <BottomSheetContext.Provider value={value}>
      {children}
      <BottomSheetRenderer entries={displayEntries} onClose={handleClose} />
    </BottomSheetContext.Provider>
  );
};
