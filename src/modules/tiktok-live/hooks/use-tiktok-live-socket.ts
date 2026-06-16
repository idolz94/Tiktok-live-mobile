import {
  TIKTOK_USERNAME,
  WEB_URL_ORIGIN,
  MOBILE_APP_KEY,
} from "@constants/config";
import {
  normalizeTikTokUsername,
  unwrapSseCommentPayload,
} from "@utils/comment";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { useTikTokComments } from "./use-tik-tok-comments";
import { useTikTokLiveSession } from "./use-tik-tok-live-session";
import {
  buildLiveStreamEventsUrl,
  stopTikTokLiveApi,
  subscribeTikTokLiveApi,
} from "../service/sse-api";
import { useAuthStore } from "@stores/auth";
import { getAuthToken } from "@utils/http/request-sse";
import { loadString, saveString, remove, STORAGE_KEYS } from "@utils/storage";
import { fetchSse } from "@utils/http/fetch-sse";

export function createClientId() {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (char) => {
    const random = Math.floor(Math.random() * 16);
    const value = char === "x" ? random : (random & 0x3) | 0x8;
    return value.toString(16);
  });
}

export function getOrCreateClientId() {
  const existing = loadString(STORAGE_KEYS.CLIENT_ID);
  if (existing) return existing;

  const clientId = createClientId();
  saveString(STORAGE_KEYS.CLIENT_ID, clientId);
  return clientId;
}

function saveResumeUsername(username: string) {
  saveString(STORAGE_KEYS.LIVE_RESUME_USERNAME, username);
}

function clearResumeUsername() {
  remove(STORAGE_KEYS.LIVE_RESUME_USERNAME);
}

function loadResumeUsername(): string {
  return loadString(STORAGE_KEYS.LIVE_RESUME_USERNAME) || "";
}

type UseTikTokLiveSocketOptions = {
  initialUsername?: string | null;
  onOrderShippingUpdated?: (payload: Record<string, unknown>) => void;
};

function getPayloadUsername(payload: Record<string, any>) {
  return (
    payload.username ||
    payload.liveUsername ||
    payload.tiktokUsername ||
    payload.tiktok_username ||
    ""
  );
}

export function useTikTokLiveSocket(options: UseTikTokLiveSocketOptions = {}) {
  const authUser = useAuthStore((state) => state.user);

  const abortControllerRef = useRef<AbortController | null>(null);
  const clientIdRef = useRef(getOrCreateClientId());
  const isManualCloseRef = useRef(false);
  const isAuthFailedRef = useRef(false);
  const isConnectedRef = useRef(false);
  const onOrderShippingUpdatedRef = useRef(options.onOrderShippingUpdated);

  const pendingCommentsRef = useRef<any[]>([]);
  const batchFlushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000];

  const initialUsername =
    options.initialUsername || (authUser ? "" : TIKTOK_USERNAME);
  const tiktokUsernameRef = useRef(
    normalizeTikTokUsername(initialUsername || TIKTOK_USERNAME),
  );

  const [status, setStatus] = useState("Đang kết nối Backend SSE...");
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [tiktokUsername, setTiktokUsername] = useState(
    initialUsername || TIKTOK_USERNAME,
  );
  const [liveError, setLiveError] = useState<string | null>(null);
  const [viewersCount, setViewersCount] = useState(0);

  const {
    comments,
    setComments,
    addCommentToList,
    addCommentsToList,
    updateCommentInList,
    replaceSnapshot,
    clearComments,
  } = useTikTokComments();

  const {
    currentLiveSession,
    currentLiveSessionId,
    liveHistory,
    liveDurationSeconds,
    liveNowText,
    clearLiveHistory,
    reloadLiveHistory,
    finalizeCurrentSessionLocally,
    startSessionFromPayload,
    endSessionFromPayload,
    updateSessionStatusFromPayload,
    addCommentToCurrentSession,
  } = useTikTokLiveSession();

  const handleServerEvent = useCallback(
    (type: string, payload: Record<string, any>) => {
      if (type === "CONNECTED") {
        setStatus("Đã kết nối Backend SSE");
        setIsConnected(true);
        return;
      }

      if (type === "PING") {
        setIsConnected(true);
        if (typeof payload.viewersCount === "number") setViewersCount(payload.viewersCount);
        return;
      }

      if (type === "SUBSCRIBING") {
        setStatus(`Đang chuẩn bị lấy comment LIVE: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "SUBSCRIBED") {
        const username = getPayloadUsername(payload);
        if (username) {
          tiktokUsernameRef.current = username;
          setTiktokUsername(username);
        }
        const snapshot = payload.comments || [];
        replaceSnapshot(Array.isArray(snapshot) ? snapshot : []);
        setStatus(`Đã subscribe LIVE ${username}, đang chờ comment đầu tiên...`);
        return;
      }

      if (type === "LIVE_TIME_STARTED") {
        startSessionFromPayload(payload);
        setStatus(`Bắt đầu phiên nhận comment: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_TIME_STATUS") {
        updateSessionStatusFromPayload(payload);
        return;
      }

      if (type === "UNSUBSCRIBED") {
        finalizeCurrentSessionLocally("unsubscribed");
        clearResumeUsername();
        setComments([]);
        setStatus(`Đã rời LIVE: ${getPayloadUsername(payload)}`);
        return;
      }

      if (type === "LIVE_CONNECTED") {
        const username = getPayloadUsername(payload);
        if (username) {
          tiktokUsernameRef.current = username;
          setTiktokUsername(username);
        }
        if (typeof payload.viewersCount === "number") setViewersCount(payload.viewersCount);
        startSessionFromPayload(payload);
        setIsConnecting(false);
        setStatus(`Đã kết nối TikTok Live: ${username}`);
        return;
      }

      if (
        type === "LIVE_TIME_ENDED" ||
        type === "LIVE_DISCONNECTED" ||
        type === "LIVE_ERROR" ||
        type === "COLLECTOR_STOPPED"
      ) {
        if (type === "LIVE_ERROR" || type === "COLLECTOR_STOPPED") {
          finalizeCurrentSessionLocally(
            type === "LIVE_ERROR" ? "live_error" : "collector_stopped",
          );
        } else {
          endSessionFromPayload(payload);
        }
        clearResumeUsername();
        isManualCloseRef.current = true;
        abortControllerRef.current?.abort();
        abortControllerRef.current = null;
        setIsConnecting(false);
        setIsConnected(false);
        setComments([]);
        const errorMsg =
          type === "LIVE_ERROR" && payload.message
            ? String(payload.message)
            : "Phiên live đã kết thúc";
        setLiveError(errorMsg);
        setStatus(errorMsg);
        return;
      }

      if (type === "VIEWER_COUNT_UPDATE") {
        if (typeof payload.viewersCount === "number") setViewersCount(payload.viewersCount);
        return;
      }

      if (type === "SNAPSHOT") {
        const snapshot = payload.comments || [];
        replaceSnapshot(Array.isArray(snapshot) ? snapshot : []);
        return;
      }

      if (type === "USER_JOINED") {
        const displayName =
          payload.joinDisplayName ||
          payload.nickname ||
          payload.joinUsername ||
          "Người xem";
        const joinAvatarUrl =
          payload.joinAvatarUrl ||
          payload.avatarUrl ||
          payload.avatar ||
          payload.comment?.avatarUrl ||
          payload.comment?.avatar;

        addCommentToList({
          id: `join_${payload.joinUsername || payload.nickname || Date.now()}_${payload.createdAt || Date.now()}`,
          type: "user_joined",
          username: payload.joinUsername || payload.nickname || "",
          displayName,
          avatarUrl: joinAvatarUrl,
          comment: "",
          createdAt: payload.createdAt,
        });
        return;
      }

      if (type === "COMMENT_UPDATED") {
        const commentId = String(payload.commentId || payload.comment_id || "");
        const patch = payload.patch || {};
        if (!commentId) return;

        const updatedComment = updateCommentInList(commentId, patch);
        if (updatedComment) {
          addCommentToCurrentSession(updatedComment);
        }
        return;
      }

      if (type === "COMMENT" || type === "COMMENT_SAVED") {
        startSessionFromPayload(payload);
        pendingCommentsRef.current.push(unwrapSseCommentPayload(payload));
      }

      if (type === "ORDER_SHIPPING_UPDATED") {
        onOrderShippingUpdatedRef.current?.(payload);
      }
    },
    [
      addCommentToCurrentSession,
      addCommentToList,
      updateCommentInList,
      endSessionFromPayload,
      finalizeCurrentSessionLocally,
      replaceSnapshot,
      setComments,
      startSessionFromPayload,
      updateSessionStatusFromPayload,
    ],
  );

  const connectSse = useCallback(async () => {
    if (isAuthFailedRef.current) {
      setStatus("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      return;
    }

    const accessToken = await getAuthToken();
    const clientId = clientIdRef.current;
    const url = buildLiveStreamEventsUrl(clientId);

    if (!accessToken) {
      if (__DEV__) console.warn("[SSE] Missing access token");
      return;
    }

    if (!url) {
      setStatus("Thiếu Backend SSE URL");
      return;
    }

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    isManualCloseRef.current = false;
    try {
      abortControllerRef.current?.abort();
    } catch {}
    abortControllerRef.current = new AbortController();

    fetchSse(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Origin: WEB_URL_ORIGIN,
        "x-app-key": MOBILE_APP_KEY,
      },
      signal: abortControllerRef.current.signal,
      onOpen: () => {
        retryCountRef.current = 0;
        setIsConnected(true);
        setStatus("Đã kết nối Backend SSE");
      },
      onEvent: (type, data) => {
        try {
          const payload = JSON.parse(data || "{}");
          handleServerEvent(type, payload);
        } catch (err) {
          if (__DEV__) console.error("[SSE parse error]:", err);
        }
      },
      onError: (error) => {
        if (isManualCloseRef.current) return;
        setIsConnected(false);

        const attempt = retryCountRef.current;
        const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
        retryCountRef.current += 1;
        setStatus(`SSE mất kết nối, thử lại sau ${delay / 1000}s (lần ${attempt + 1})...`);
        if (__DEV__) console.error("[SSE Connection Error]:", error);

        retryTimerRef.current = setTimeout(() => {
          if (!isManualCloseRef.current) connectSse();
        }, delay);
      },
    });
  }, [handleServerEvent]);

  const subscribeTikTokUsername = useCallback(
    async (username: string) => {
      const nextUsername = normalizeTikTokUsername(username);

      if (!nextUsername) {
        setStatus("Vui lòng nhập TikTok username");
        return false;
      }

      const oldUsername = tiktokUsernameRef.current;
      const oldUsernameWithoutAt = oldUsername.replace(/^@/, "");

      if (oldUsername && oldUsername !== nextUsername) {
        finalizeCurrentSessionLocally("change_username");
        if (retryTimerRef.current) {
          clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
        retryCountRef.current = 0;
        stopTikTokLiveApi({
          clientId: clientIdRef.current,
          username: oldUsernameWithoutAt,
          silent: true,
        }).catch(() => {});
      }

      tiktokUsernameRef.current = nextUsername;
      setTiktokUsername(nextUsername);
      setLiveError(null);
      setComments([]);
      setStatus(`Đang yêu cầu Backend start Python collector: ${nextUsername}...`);

      const usernameWithoutAt = nextUsername.replace(/^@/, "");

      connectSse();
      setIsConnecting(true);

      try {
        const result = await subscribeTikTokLiveApi({
          clientId: clientIdRef.current,
          username: usernameWithoutAt,
        });

        if (result?.username) {
          tiktokUsernameRef.current = result.username;
          setTiktokUsername(result.username);
        }

        saveResumeUsername(tiktokUsernameRef.current);
        setStatus(
          result?.message || `Đã start collector cho ${nextUsername}, đang chờ comment...`,
        );
        return result?.success ?? true;
      } catch (error) {
        if (__DEV__) console.error("START LIVE STREAM ERROR:", error);

        const message =
          error instanceof Error
            ? error.message
            : "Không gọi được API start collector ở Backend";
        setIsConnecting(false);
        setLiveError(message);
        setStatus(message);
        return false;
      }
    },
    [finalizeCurrentSessionLocally, setComments, connectSse],
  );

  const stopLiveSession = useCallback(async () => {
    setStatus("Đang dừng nhận comment...");

    try {
      await stopTikTokLiveApi({
        clientId: clientIdRef.current,
        username: tiktokUsernameRef.current.replace(/^@/, ""),
      });
    } catch (error) {
      if (__DEV__) console.error("STOP LIVE STREAM ERROR:", error);
    }

    finalizeCurrentSessionLocally("manual_stop");
    clearResumeUsername();

    isManualCloseRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;
    setIsConnected(false);
    setIsConnecting(false);
    setStatus("Đã dừng nhận comment");

    return true;
  }, [finalizeCurrentSessionLocally]);

  const clearLiveError = useCallback(() => {
    setLiveError(null);
  }, []);

  const reconnect = useCallback(() => {
    finalizeCurrentSessionLocally("manual_reconnect");

    isManualCloseRef.current = false;
    isAuthFailedRef.current = false;
    setLiveError(null);

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    connectSse();
  }, [connectSse, finalizeCurrentSessionLocally]);

  const disconnect = useCallback(async () => {
    finalizeCurrentSessionLocally("manual_disconnect");
    clearResumeUsername();

    isManualCloseRef.current = true;

    try {
      await stopTikTokLiveApi({
        clientId: clientIdRef.current,
        username: tiktokUsernameRef.current.replace(/^@/, ""),
      });
    } catch (error) {
      if (__DEV__) console.error("DISCONNECT LIVE STREAM ERROR:", error);
    }

    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    setIsConnected(false);
    setIsConnecting(false);
    setStatus("Đã ngắt kết nối");
  }, [finalizeCurrentSessionLocally]);

  useEffect(() => {
    isConnectedRef.current = isConnected;
  }, [isConnected]);

  useEffect(() => {
    onOrderShippingUpdatedRef.current = options.onOrderShippingUpdated;
  }, [options.onOrderShippingUpdated]);

  useEffect(() => {
    batchFlushTimerRef.current = setInterval(() => {
      if (pendingCommentsRef.current.length === 0) return;
      const batch = pendingCommentsRef.current.splice(0);
      const added = addCommentsToList(batch);
      added.forEach((c) => addCommentToCurrentSession(c));
    }, 200);

    const appStateSub = AppState.addEventListener("change", (nextState) => {
      if (nextState === "active" && !isManualCloseRef.current) {
        setTimeout(() => {
          if (isManualCloseRef.current) return;
          try {
            abortControllerRef.current?.abort();
          } catch {}
          abortControllerRef.current = null;
          connectSse();
        }, 500);
      }
    });

    return () => {
      isManualCloseRef.current = true;
      try {
        abortControllerRef.current?.abort();
      } catch {}
      abortControllerRef.current = null;
      if (batchFlushTimerRef.current) {
        clearInterval(batchFlushTimerRef.current);
        batchFlushTimerRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }
      appStateSub.remove();
    };
  }, [connectSse, addCommentsToList, addCommentToCurrentSession]);

  useEffect(() => {
    const timer = setTimeout(() => {
      const nextUsername = normalizeTikTokUsername(options.initialUsername || "");
      if (!nextUsername) return;
      tiktokUsernameRef.current = nextUsername;
      setTiktokUsername(nextUsername);
    }, 0);

    return () => clearTimeout(timer);
  }, [options.initialUsername]);

  useEffect(() => {
    const resumeUsername = loadResumeUsername();
    if (!resumeUsername) return;

    const timer = setTimeout(() => {
      subscribeTikTokUsername(resumeUsername);
    }, 300);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    status,
    isConnected,
    isConnecting,
    comments,
    tiktokUsername,
    liveError,
    viewersCount,

    currentLiveSession,
    currentLiveSessionId,
    liveHistory,
    liveDurationSeconds,
    liveNowText,

    setComments,
    clearComments,
    clearLiveHistory,
    reloadLiveHistory,

    reconnect,
    disconnect,
    stopLiveSession,
    clearLiveError,

    changeTikTokUsername: subscribeTikTokUsername,
    subscribeTikTokUsername,
  };
}
