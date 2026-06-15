import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { LiveHistoryItem } from "../types";
import { LiveComment } from "@app-types/index";
import { normalizeLiveSession } from "../live-session-mapper";
import { calcDurationSeconds } from "@utils/date";
import { getLiveHistoryApi } from "../service/live-history-api";

function formatNowText(nowMs: number) {
  if (!nowMs) return "";

  return new Date(nowMs).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function shouldShowHistorySession(session: LiveHistoryItem) {
  const durationSeconds = Number(session.durationSeconds || 0);
  const commentCount = Number(
    session.commentCount || session.comments?.length || 0,
  );
  const orderCount = Number(session.orderCount || session.orders?.length || 0);

  return durationSeconds > 0 || commentCount > 0 || orderCount > 0;
}

function mergeSession(
  oldSession: LiveHistoryItem | null,
  nextSession: LiveHistoryItem,
) {
  return {
    ...(oldSession || {}),
    ...nextSession,
    startedAt: oldSession?.startedAt || nextSession.startedAt,
    comments: oldSession?.comments?.length
      ? oldSession.comments
      : nextSession.comments || [],
    orders: oldSession?.orders?.length
      ? oldSession.orders
      : nextSession.orders || [],
  } as LiveHistoryItem;
}

export function useTikTokLiveSession() {
  const currentLiveSessionRef = useRef<LiveHistoryItem | null>(null);
  const currentDbLiveSessionIdRef = useRef<string | null>(null);
  const sessionCommentIdsRef = useRef<Set<string>>(new Set());

  const [currentLiveSession, setCurrentLiveSessionState] =
    useState<LiveHistoryItem | null>(null);
  const [liveHistory, setLiveHistory] = useState<LiveHistoryItem[]>([]);
  const [currentLiveSessionId, setCurrentLiveSessionId] = useState<
    string | null
  >(null);
  const [nowMs, setNowMs] = useState(0);

  const setDbLiveSessionId = useCallback((id: string | null) => {
    currentDbLiveSessionIdRef.current = id;
    setCurrentLiveSessionId(id);
  }, []);

  const setCurrentLiveSession = useCallback(
    (session: LiveHistoryItem | null) => {
      currentLiveSessionRef.current = session;
      setCurrentLiveSessionState(session);
    },
    [],
  );

  const isRunning = Boolean(
    currentLiveSession?.startedAt && !currentLiveSession?.endedAt,
  );

  const reloadLiveHistory = useCallback(async () => {
    try {
      const history = await getLiveHistoryApi();
      setLiveHistory(history);
      return history;
    } catch (error) {
      console.log("LOAD LIVE HISTORY ERROR:", error);
      return [];
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void reloadLiveHistory();
    }, 0);

    return () => {
      clearTimeout(timer);
    };
  }, [reloadLiveHistory]);

  useEffect(() => {
    if (!isRunning) return;

    const timer = setInterval(() => {
      setNowMs(Date.now());
    }, 1000);

    return () => {
      clearInterval(timer);
    };
  }, [isRunning, currentLiveSession?.sessionId, currentLiveSession?.startedAt]);

  const liveDurationSeconds = useMemo(() => {
    if (!currentLiveSession?.startedAt) return 0;

    if (currentLiveSession.endedAt) {
      return currentLiveSession.durationSeconds || 0;
    }

    if (!nowMs) {
      return currentLiveSession.durationSeconds || 0;
    }

    const start = new Date(currentLiveSession.startedAt).getTime();
    if (!start) return 0;

    return Math.max(0, Math.floor((nowMs - start) / 1000));
  }, [currentLiveSession, nowMs]);

  const liveNowText = useMemo(() => {
    if (!isRunning) return "";
    return formatNowText(nowMs);
  }, [isRunning, nowMs]);

  const clearLiveHistory = useCallback(() => {
    setLiveHistory([]);
  }, []);

  const resetCurrentSession = useCallback(() => {
    sessionCommentIdsRef.current = new Set();
    setCurrentLiveSession(null);
    setDbLiveSessionId(null);
    setNowMs(0);
  }, [setCurrentLiveSession, setDbLiveSessionId]);

  const startSessionFromPayload = useCallback(
    (payload: unknown) => {
      const nextSession = normalizeLiveSession(payload);
      const currentSession = currentLiveSessionRef.current;
      const dbLiveSessionId = nextSession.id || null;

      if (
        currentSession &&
        (currentSession.id === nextSession.id ||
          currentSession.sessionId === nextSession.sessionId)
      ) {
        const mergedSession = mergeSession(currentSession, nextSession);
        setCurrentLiveSession(mergedSession);
        setDbLiveSessionId(dbLiveSessionId);
        setNowMs(Date.now());
        return mergedSession;
      }

      sessionCommentIdsRef.current = new Set();
      setCurrentLiveSession(nextSession);
      setDbLiveSessionId(dbLiveSessionId);
      setNowMs(Date.now());

      return nextSession;
    },
    [setCurrentLiveSession, setDbLiveSessionId],
  );

  const finalizeCurrentSessionLocally = useCallback(
    (reason: string) => {
      const session = currentLiveSessionRef.current;
      if (!session?.startedAt) return;

      const endedAt = new Date().toISOString();
      const durationSeconds = calcDurationSeconds(session.startedAt, endedAt);

      const localSession: LiveHistoryItem = {
        ...session,
        endedAt,
        durationSeconds,
        commentCount: sessionCommentIdsRef.current.size,
        // Don't store full comments array in history to prevent RAM growth
        comments: [],
        reason,
        status: reason === "live_error" ? "error" : "ended",
      };

      setLiveHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== localSession.id);
        return shouldShowHistorySession(localSession)
          ? [localSession, ...filtered]
          : filtered;
      });

      sessionCommentIdsRef.current = new Set();
      setCurrentLiveSession(null);
      setDbLiveSessionId(null);
      setNowMs(0);

      setTimeout(() => {
        void reloadLiveHistory();
      }, 300);
    },
    [reloadLiveHistory, setCurrentLiveSession, setDbLiveSessionId],
  );

  const endSessionFromPayload = useCallback(
    (payload: unknown) => {
      const sessionFromServer = normalizeLiveSession(payload);
      const currentSession = currentLiveSessionRef.current;
      const startedAt =
        currentSession?.startedAt ||
        sessionFromServer.startedAt ||
        new Date().toISOString();
      const endedAt = sessionFromServer.endedAt || new Date().toISOString();
      const durationSeconds =
        sessionFromServer.durationSeconds ||
        calcDurationSeconds(startedAt, endedAt);
      const finalCommentCount = Math.max(
        sessionFromServer.commentCount || 0,
        sessionCommentIdsRef.current.size,
      );

      const localSession: LiveHistoryItem = {
        ...sessionFromServer,
        startedAt,
        endedAt,
        durationSeconds,
        commentCount: finalCommentCount,
        // Don't store full comments array in history to prevent RAM growth
        comments: [],
        status: sessionFromServer.status || "ended",
      };

      setLiveHistory((prev) => {
        const filtered = prev.filter((item) => item.id !== localSession.id);
        return shouldShowHistorySession(localSession)
          ? [localSession, ...filtered]
          : filtered;
      });

      sessionCommentIdsRef.current = new Set();
      setCurrentLiveSession(null);
      setDbLiveSessionId(null);
      setNowMs(0);

      setTimeout(() => {
        void reloadLiveHistory();
      }, 300);
    },
    [reloadLiveHistory, setCurrentLiveSession, setDbLiveSessionId],
  );

  const updateSessionStatusFromPayload = useCallback(
    (payload: unknown) => {
      const data = payload as {
        startedAt?: string;
        started_at?: string;
        liveSessionId?: string;
        live_session_id?: string;
      } | null;

      if (
        !data ||
        (!data.startedAt &&
          !data.started_at &&
          !data.liveSessionId &&
          !data.live_session_id)
      ) {
        resetCurrentSession();
        return;
      }

      startSessionFromPayload(payload);
    },
    [resetCurrentSession, startSessionFromPayload],
  );

  const addCommentToCurrentSession = useCallback(
    (comment: LiveComment) => {
      sessionCommentIdsRef.current.add(comment.id);

      const session = currentLiveSessionRef.current;
      if (session) {
        const nextSession: LiveHistoryItem = {
          ...session,
          commentCount: sessionCommentIdsRef.current.size,
        };

        setCurrentLiveSession(nextSession);
      }
    },
    [setCurrentLiveSession],
  );

  return {
    currentLiveSession,
    currentLiveSessionId,
    liveHistory,
    liveDurationSeconds,
    liveNowText,
    reloadLiveHistory,
    clearLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    updateSessionStatusFromPayload,
    addCommentToCurrentSession,
    resetCurrentSession,
  };
}
