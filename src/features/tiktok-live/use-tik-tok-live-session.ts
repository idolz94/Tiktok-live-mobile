import { MAX_COMMENTS } from "@constants/config";
import {
  clearLiveHistoryStorage,
  readLiveHistory,
  saveHistoryItem,
} from "@features/tiktok-live/live-history-storage";
import { normalizeLiveSession } from "@features/tiktok-live/live-session-mapper";
import type { LiveHistoryItem } from "@features/tiktok-live/types";
import type { LiveComment } from "@types";
import { calcDurationSeconds } from "@utils/date";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

function formatNowText(nowMs: number) {
  if (!nowMs) return "";
  return new Date(nowMs).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function useTikTokLiveSession() {
  const currentLiveSessionRef = useRef<LiveHistoryItem | null>(null);
  const sessionCommentsRef = useRef<LiveComment[]>([]);

  const [currentLiveSession, setCurrentLiveSessionState] =
    useState<LiveHistoryItem | null>(null);
  const [liveHistory, setLiveHistory] = useState<LiveHistoryItem[]>([]);
  const [nowMs, setNowMs] = useState(0);

  const setCurrentLiveSession = useCallback(
    (session: LiveHistoryItem | null) => {
      currentLiveSessionRef.current = session;
      setCurrentLiveSessionState(session);
    },
    [],
  );

  useEffect(() => {
    readLiveHistory().then(setLiveHistory);
  }, []);

  const isRunning = Boolean(
    currentLiveSession?.startedAt && !currentLiveSession?.endedAt,
  );

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [isRunning, currentLiveSession?.sessionId, currentLiveSession?.startedAt]);

  const liveDurationSeconds = useMemo(() => {
    if (!currentLiveSession?.startedAt) return 0;
    if (currentLiveSession.endedAt)
      return currentLiveSession.durationSeconds || 0;
    if (!nowMs) return currentLiveSession.durationSeconds || 0;

    const start = new Date(currentLiveSession.startedAt).getTime();
    if (!start) return 0;
    return Math.max(0, Math.floor((nowMs - start) / 1000));
  }, [currentLiveSession, nowMs]);

  const liveNowText = useMemo(
    () => (isRunning ? formatNowText(nowMs) : ""),
    [isRunning, nowMs],
  );

  const clearLiveHistory = useCallback(async () => {
    setLiveHistory([]);
    await clearLiveHistoryStorage();
  }, []);

  const resetCurrentSession = useCallback(() => {
    sessionCommentsRef.current = [];
    setCurrentLiveSession(null);
    setNowMs(0);
  }, [setCurrentLiveSession]);

  const finalizeCurrentSessionLocally = useCallback(
    async (reason: string) => {
      const session = currentLiveSessionRef.current;
      if (!session?.startedAt) return;

      const endedAt = new Date().toISOString();
      const comments = sessionCommentsRef.current;
      const historyItem: LiveHistoryItem = {
        ...session,
        endedAt,
        durationSeconds: calcDurationSeconds(session.startedAt, endedAt),
        commentCount: comments.length,
        comments,
        reason,
      };

      const nextHistory = await saveHistoryItem(historyItem);
      setLiveHistory(nextHistory);
      sessionCommentsRef.current = [];
      setCurrentLiveSession(null);
      setNowMs(0);
    },
    [setCurrentLiveSession],
  );

  const startSessionFromPayload = useCallback(
    (payload: unknown) => {
      const session = normalizeLiveSession(payload);
      sessionCommentsRef.current = [];
      setCurrentLiveSession(session);
      setNowMs(Date.now());
    },
    [setCurrentLiveSession],
  );

  const endSessionFromPayload = useCallback(
    async (payload: unknown) => {
      const sessionFromPython = normalizeLiveSession(payload);
      const comments = sessionCommentsRef.current;
      const historyItem: LiveHistoryItem = {
        ...sessionFromPython,
        comments,
        commentCount: Math.max(
          sessionFromPython.commentCount || 0,
          comments.length,
        ),
      };

      const nextHistory = await saveHistoryItem(historyItem);
      setLiveHistory(nextHistory);
      sessionCommentsRef.current = [];
      setCurrentLiveSession(null);
      setNowMs(0);
    },
    [setCurrentLiveSession],
  );

  const updateSessionStatusFromPayload = useCallback(
    (payload: unknown) => {
      const data = payload as {
        startedAt?: string;
        started_at?: string;
      } | null;

      if (!data || (!data.startedAt && !data.started_at)) {
        sessionCommentsRef.current = [];
        setCurrentLiveSession(null);
        setNowMs(0);
        return;
      }

      const session = normalizeLiveSession(payload);
      setCurrentLiveSession(session);
    },
    [setCurrentLiveSession],
  );

  const addCommentToCurrentSession = useCallback(
    (comment: LiveComment) => {
      const existed = sessionCommentsRef.current.some(
        (item) => item.id === comment.id,
      );
      if (existed) return;

      const nextComments = [comment, ...sessionCommentsRef.current].slice(
        0,
        MAX_COMMENTS,
      );
      sessionCommentsRef.current = nextComments;

      const session = currentLiveSessionRef.current;
      if (!session) return;

      setCurrentLiveSession({
        ...session,
        commentCount: nextComments.length,
        comments: nextComments,
      });
    },
    [setCurrentLiveSession],
  );

  return {
    currentLiveSession,
    liveHistory,
    liveDurationSeconds,
    liveNowText,
    clearLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    updateSessionStatusFromPayload,
    addCommentToCurrentSession,
    resetCurrentSession,
  };
}
