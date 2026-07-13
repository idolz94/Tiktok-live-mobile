import {
  TIKTOK_USERNAME,
  WEB_URL_ORIGIN,
  MOBILE_APP_KEY,
} from "@constants/config";
import {
  normalizeTikTokUsername,
  unwrapSseCommentPayload,
} from "@features/tiktok-live/utils/comment";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";
import { refreshAccessToken } from "@utils/http/auth-session";
import { useTikTokComments } from "./use-tik-tok-comments";
import { useTikTokLiveSession } from "./use-tik-tok-live-session";
import {
  buildLiveStreamEventsUrl,
  getLiveSessionStatusApi,
  stopTikTokLiveApi,
  subscribeTikTokLiveApi,
} from "../service/sse-api";
import { useAuthStore } from "@features/auth/stores";
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

type UseTikTokLiveSocketOptions = {
  initialUsername?: string | null;
  hasHistory?: boolean;
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

// --- Debug vòng đời live khi app chuyển background/foreground ---
function debugLiveLifecycle(label: string, payload?: Record<string, unknown>) {
  if (!__DEV__) return;
  console.log(`[LIVE_LIFECYCLE] ${label}`, payload ?? {});
}
// --- end Debug vòng đời live ---

export function useTikTokLiveSocket(options: UseTikTokLiveSocketOptions = {}) {
  // ---start: narrow authStore selector — only re-render when user existence changes, not on bootstrap enrich---
  const hasAuthUser = useAuthStore((state) => Boolean(state.user));
  // ---end: narrow authStore selector---

  const abortControllerRef = useRef<AbortController | null>(null);
  const clientIdRef = useRef(getOrCreateClientId());
  const isManualCloseRef = useRef(false);
  // ponytail: chỉ reconnect foreground khi user đã từng bấm Kết nối
  const hasEverConnectedRef = useRef(false);
  const isAuthFailedRef = useRef(false);
  const isConnectedRef = useRef(false);
  const isResumingRef = useRef(false);
  const isAppActiveRef = useRef(true);
  const ignoreTransientDisconnectRef = useRef(false);
  const onOrderShippingUpdatedRef = useRef(options.onOrderShippingUpdated);

  const pendingCommentsRef = useRef<any[]>([]);
  const batchFlushTimerRef = useRef<ReturnType<typeof setInterval> | null>(
    null,
  );

  const retryCountRef = useRef(0);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const RETRY_DELAYS = [1000, 2000, 5000, 10000, 30000];

  const initialUsername =
    options.initialUsername || (hasAuthUser ? "" : TIKTOK_USERNAME);
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
    batchAddCommentsToSession,
    restoreCurrentSession,
    clearCurrentSession,
  } = useTikTokLiveSession({ hasHistory: options.hasHistory });

  const handleServerEvent = useCallback(
    (type: string, payload: Record<string, any>) => {
      debugLiveLifecycle("SSE_EVENT", {
        type,
        payloadUsername: getPayloadUsername(payload),
        isConnected: isConnectedRef.current,
        isManualClose: isManualCloseRef.current,
        isResuming: isResumingRef.current,
        ignoreTransientDisconnect: ignoreTransientDisconnectRef.current,
        currentUsername: tiktokUsernameRef.current,
      });

      if (type === "CONNECTED") {
        setStatus("Đã kết nối Backend SSE");
        setIsConnected(true);
        return;
      }

      if (type === "PING") {
        setIsConnected(true);
        if (typeof payload.viewersCount === "number")
          setViewersCount(payload.viewersCount);
        return;
      }

      if (type === "SUBSCRIBING") {
        setStatus(
          `Đang chuẩn bị lấy comment LIVE: ${getPayloadUsername(payload)}`,
        );
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
        setStatus(
          `Đã subscribe LIVE ${username}, đang chờ comment đầu tiên...`,
        );
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
        if (typeof payload.viewersCount === "number")
          setViewersCount(payload.viewersCount);
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
        // --- Bỏ qua disconnect/error tạm thời khi app đang resume từ background ---
        if (ignoreTransientDisconnectRef.current && type !== "LIVE_TIME_ENDED") {
          debugLiveLifecycle("IGNORE_TRANSIENT_TERMINAL_EVENT", {
            type,
            payload,
            isResuming: isResumingRef.current,
            currentUsername: tiktokUsernameRef.current,
          });
          return;
        }
        // --- end bỏ qua disconnect tạm thời ---
        if (type === "LIVE_ERROR" || type === "COLLECTOR_STOPPED") {
          finalizeCurrentSessionLocally(
            type === "LIVE_ERROR" ? "live_error" : "collector_stopped",
          );
        } else {
          endSessionFromPayload(payload);
        }
        debugLiveLifecycle("APPLY_TERMINAL_EVENT_CLEAR_ROOM", {
          type,
          payload,
          currentUsername: tiktokUsernameRef.current,
          isAppActive: isAppActiveRef.current,
          isResuming: isResumingRef.current,
        });
        clearResumeUsername();

        // LIVE_ERROR means start succeeded but collector failed later, so cleanup backend collector explicitly.
        if (type === "LIVE_ERROR") {
          stopTikTokLiveApi({
            clientId: clientIdRef.current,
            username: tiktokUsernameRef.current.replace(/^@/, ""),
            silent: true,
          }).catch((error) => {
            if (__DEV__) console.error("STOP LIVE STREAM AFTER ERROR:", error);
          });
        }

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
        if (typeof payload.viewersCount === "number")
          setViewersCount(payload.viewersCount);
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

    debugLiveLifecycle("CONNECT_SSE_START", {
      clientId,
      url,
      currentUsername: tiktokUsernameRef.current,
      isManualClose: isManualCloseRef.current,
      hasExistingAbortController: Boolean(abortControllerRef.current),
    });

    isManualCloseRef.current = false;
    hasEverConnectedRef.current = true;
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
        debugLiveLifecycle("SSE_OPEN", {
          currentUsername: tiktokUsernameRef.current,
          clientId: clientIdRef.current,
          isResuming: isResumingRef.current,
        });
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
        debugLiveLifecycle("SSE_ERROR", {
          error: error instanceof Error ? error.message : String(error),
          isManualClose: isManualCloseRef.current,
          isResuming: isResumingRef.current,
          isAppActive: isAppActiveRef.current,
          currentUsername: tiktokUsernameRef.current,
        });
        if (isManualCloseRef.current) return;
        setIsConnected(false);

        const attempt = retryCountRef.current;
        const delay = RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
        retryCountRef.current += 1;
        setStatus(
          `SSE mất kết nối, thử lại sau ${delay / 1000}s (lần ${attempt + 1})...`,
        );
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
      setStatus(
        `Đang yêu cầu Backend start Python collector: ${nextUsername}...`,
      );

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
          result?.message ||
            `Đã start collector cho ${nextUsername}, đang chờ comment...`,
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
    [
      clearComments,
      connectSse,
      currentLiveSession,
      finalizeCurrentSessionLocally,
      restoreCurrentSession,
    ],
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

  const restoreOrClearSessionOnForeground = useCallback(async () => {
    debugLiveLifecycle("RESTORE_START", {
      isManualClose: isManualCloseRef.current,
      tiktokUsernameRef: tiktokUsernameRef.current,
      currentSessionId: currentLiveSession?.id,
      currentSessionUsername: currentLiveSession?.username,
      isConnected: isConnectedRef.current,
      ignoreTransientDisconnect: ignoreTransientDisconnectRef.current,
    });

    if (isManualCloseRef.current || false) return;

    const username = tiktokUsernameRef.current.replace(/^@/, "");
    if (!username) {
      debugLiveLifecycle("RESTORE_NO_USERNAME_CLEAR_ROOM", {
        currentSessionId: currentLiveSession?.id,
        currentSessionUsername: currentLiveSession?.username,
      });
      clearCurrentSession();
      clearResumeUsername();
      clearComments();
      return;
    }

    const resolveLiveSessionStatus = async () => {
      try {
        return await getLiveSessionStatusApi({
          clientId: clientIdRef.current,
          username,
        });
      } catch (error) {
        const responseStatus =
          typeof error === "object" && error && "response" in error
            ? Number(
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (error as any).response?.status || 0,
              )
            : 0;

        if (responseStatus === 401) {
          await refreshAccessToken();
          return getLiveSessionStatusApi({
            clientId: clientIdRef.current,
            username,
          });
        }

        throw error;
      }
    };

    try {
      const status = await resolveLiveSessionStatus();
      const active = Boolean((status as { active?: boolean })?.active);

      debugLiveLifecycle("RESTORE_STATUS_RESULT", {
        active,
        username,
        currentSessionId: currentLiveSession?.id,
        statusResponse: status,
      });

      if (!active) {
        // --- Không clear nếu chỉ vừa quay lại từ external link (background ngắn) ---
        // Giữ nguyên session/comments local, chỉ đánh dấu disconnected
        setIsConnected(false);
        setIsConnecting(false);
        return;
        // --- end giữ session khi background ngắn ---
      }

      if (currentLiveSession) {
        restoreCurrentSession(currentLiveSession);
      }
    } catch (error) {
      if (__DEV__) console.error("LIVE SESSION STATUS ERROR:", error);
    }
  }, [clearComments, clearCurrentSession, currentLiveSession, restoreCurrentSession]);

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

  // ---start: connectSseRef — prevent connectSse in effect deps causing teardown/remount---
  const connectSseRef = useRef(connectSse);
  useEffect(() => {
    connectSseRef.current = connectSse;
  }, [connectSse]);
  // ---end: connectSseRef---

  // ---start: restoreOrClearRef — đảm bảo foreground luôn dùng closure mới nhất có currentLiveSession đúng ---
  const restoreOrClearRef = useRef(restoreOrClearSessionOnForeground);
  useEffect(() => {
    restoreOrClearRef.current = restoreOrClearSessionOnForeground;
  }, [restoreOrClearSessionOnForeground]);
  // ---end: restoreOrClearRef ---

  // ---start: stable refs cho addComments/batchAdd — tránh effect teardown khi reference thay đổi ---
  const addCommentsToListRef = useRef(addCommentsToList);
  useEffect(() => {
    addCommentsToListRef.current = addCommentsToList;
  }, [addCommentsToList]);

  const batchAddCommentsToSessionRef = useRef(batchAddCommentsToSession);
  useEffect(() => {
    batchAddCommentsToSessionRef.current = batchAddCommentsToSession;
  }, [batchAddCommentsToSession]);
  // ---end: stable refs ---

  // ---start: setup effect — deps rỗng, dùng refs để tránh teardown/remount gây mất SSE ---
  useEffect(() => {
    batchFlushTimerRef.current = setInterval(() => {
      if (pendingCommentsRef.current.length === 0) return;
      const batch = pendingCommentsRef.current.splice(0);
      const added = addCommentsToListRef.current(batch);
      if (added.length > 0) {
        batchAddCommentsToSessionRef.current(added);
      }
    }, 200);

    // ---start: foreground resume
    // On app active: check backend live status → reconnect SSE if still active,
    // clear local state if session ended. Token refresh only on 401 (lazy).
    const appStateSub = AppState.addEventListener("change", (nextState) => {
      debugLiveLifecycle("APP_STATE_CHANGE", {
        nextState,
        isManualClose: isManualCloseRef.current,
        isResuming: isResumingRef.current,
        isConnected: isConnectedRef.current,
        currentUsername: tiktokUsernameRef.current,
      });

      if (nextState !== "active") {
        isAppActiveRef.current = false;
        return;
      }
      isAppActiveRef.current = true;

      if (isManualCloseRef.current) return;
      // ponytail: chỉ resume khi user đã từng bấm Kết nối
      if (!hasEverConnectedRef.current) return;

        setTimeout(async () => {
          debugLiveLifecycle("RESUME_TIMER_FIRED", {
            isManualClose: isManualCloseRef.current,
            isResuming: isResumingRef.current,
            isConnected: isConnectedRef.current,
            hasAbortController: Boolean(abortControllerRef.current),
            currentUsername: tiktokUsernameRef.current,
          });

          if (isManualCloseRef.current) return;
          if (isResumingRef.current) return;

          isResumingRef.current = true;
          // --- Bỏ qua disconnect/error tạm thời trong lúc resume ---
          ignoreTransientDisconnectRef.current = true;
          try {
            const token = await getAuthToken();
            if (!token) return;

            if (isManualCloseRef.current || false) return;

            await restoreOrClearRef.current();

            if (isManualCloseRef.current || false) return;

            // --- Chỉ reconnect khi SSE thực sự đã mất, tránh cắt ngang connection đang sống ---
            if (!isConnectedRef.current) {
              debugLiveLifecycle("RESUME_RECONNECT_SSE", {
                hasAbortController: Boolean(abortControllerRef.current),
                currentUsername: tiktokUsernameRef.current,
              });
              try {
                abortControllerRef.current?.abort();
              } catch {}
              abortControllerRef.current = null;
              connectSseRef.current();
            } else {
              debugLiveLifecycle("RESUME_KEEP_EXISTING_SSE", {
                currentUsername: tiktokUsernameRef.current,
              });
            }
            // --- end reconnect guard ---
          } finally {
            isResumingRef.current = false;
            // Tắt ignore sau 2s để tránh miss event thật sau khi resume xong
            setTimeout(() => {
              ignoreTransientDisconnectRef.current = false;
            }, 2000);
          }
        }, 500);
    });
    // ---end: foreground resume---

    return () => {
      debugLiveLifecycle("SETUP_EFFECT_CLEANUP", {
        currentUsername: tiktokUsernameRef.current,
        isConnected: isConnectedRef.current,
        hasAbortController: Boolean(abortControllerRef.current),
      });
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
  }, []);
  // ---end: setup effect---

  // ---start: logout cleanup — clear live state khi user logout---
  useEffect(() => {
    if (hasAuthUser) return;

    isManualCloseRef.current = true;
    abortControllerRef.current?.abort();
    abortControllerRef.current = null;

    if (retryTimerRef.current) {
      clearTimeout(retryTimerRef.current);
      retryTimerRef.current = null;
    }

    hasEverConnectedRef.current = false;
    isAuthFailedRef.current = false;
    retryCountRef.current = 0;

    clearComments();
    clearLiveHistory();
    setIsConnected(false);
    setIsConnecting(false);
    setLiveError(null);
    setViewersCount(0);
  }, [hasAuthUser, clearComments, clearLiveHistory]);
  // ---end: logout cleanup---

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
