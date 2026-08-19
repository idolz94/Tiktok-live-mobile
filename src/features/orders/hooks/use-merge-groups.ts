import { useMemo } from "react";
import type { OrderWithTikTok } from "@app-types/index";
import { buildMergeGroups, type MergeGroupsResult } from "../utils/merge-groups";

export function useMergeGroups(orders: OrderWithTikTok[]): MergeGroupsResult {
  return useMemo(() => buildMergeGroups(orders), [orders]);
}
