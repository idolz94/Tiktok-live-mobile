import { ShopTikTokChannel } from "@app-types/database";
import { useAuthStore } from "@features/auth/stores";
import {
  deleteTikTokChannelApi,
  getTikTokChannelsApi,
  updateTikTokChannelApi,
} from "@features/auth/services/api";
import { normalizeTikTokUsername } from "@features/tiktok-live/utils/comment";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function sortChannels(channels: ShopTikTokChannel[]) {
  return [...channels].sort((a, b) => Number(b.isDefault) - Number(a.isDefault));
}

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

export function useManageTiktokChannel() {
  const user = useAuthStore((state) => state.user);
  const patchTiktokChannels = useAuthStore((state) => state.patchTiktokChannels);

  const isMountedRef = useRef(true);
  const requestIdRef = useRef(0);
  const initialFallbackRef = useRef(sortChannels(user?.tiktokChannels ?? []));

  const [channels, setChannels] = useState<ShopTikTokChannel[]>(
    sortChannels(user?.tiktokChannels ?? []),
  );
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const reloadChannels = useCallback(async (fallback: ShopTikTokChannel[] = []) => {
    const requestId = ++requestIdRef.current;
    if (isMountedRef.current) setErrorText(null);

    try {
      const next = sortChannels(await getTikTokChannelsApi());
      const resolved = next.length ? next : fallback;
      if (requestId === requestIdRef.current && isMountedRef.current) {
        setChannels(resolved);
      }
      return resolved;
    } catch (error) {
      if (requestId === requestIdRef.current && isMountedRef.current) {
        if (fallback.length) setChannels(fallback);
        setErrorText(getErrorMessage(error, "Không tải được danh sách kênh"));
      }
      return fallback;
    }
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        await reloadChannels(initialFallbackRef.current);
      } finally {
        if (isMountedRef.current) setLoading(false);
      }
    };
    void run();
  }, [reloadChannels]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await reloadChannels(channels);
    } finally {
      if (isMountedRef.current) setRefreshing(false);
    }
  }, [channels, reloadChannels]);

  const refreshData = useCallback(async () => {
    const next = await reloadChannels(sortChannels(user?.tiktokChannels ?? []));
    patchTiktokChannels(next);
  }, [reloadChannels, patchTiktokChannels, user?.tiktokChannels]);

  const usedUsernames = useMemo(
    () => new Set(channels.map((c) => c.tiktokUsername)),
    [channels],
  );

  const saveChannel = useCallback(
    async (channel: ShopTikTokChannel, nextUsername: string) => {
      const normalizedNext = normalizeTikTokUsername(nextUsername);
      const normalizedCurrent = normalizeTikTokUsername(channel.tiktokUsername);
      if (normalizedNext === normalizedCurrent) return;
      await updateTikTokChannelApi(channel.id, { tiktokUsername: normalizedNext });
      await refreshData();
    },
    [refreshData],
  );

  const deleteChannel = useCallback(
    async (channel: ShopTikTokChannel) => {
      await deleteTikTokChannelApi(channel.id);
      await refreshData();
    },
    [refreshData],
  );

  return {
    channels,
    loading,
    refreshing,
    errorText,
    usedUsernames,
    onRefresh,
    saveChannel,
    deleteChannel,
  };
}
