type SseEventHandler = (type: string, data: string) => void;
type SseErrorHandler = (error: unknown) => void;
type SseOpenHandler = () => void;

export type FetchSseOptions = {
  headers?: Record<string, string>;
  signal?: AbortSignal;
  onOpen?: SseOpenHandler;
  onEvent?: SseEventHandler;
  onError?: SseErrorHandler;
  /** Thời gian tối đa không nhận được data (ms). Mặc định 60s. */
  heartbeatTimeout?: number;
};

const MAX_BUFFER_BYTES = 1024 * 1024; // 1MB

export async function fetchSse(url: string, options: FetchSseOptions): Promise<void> {
  const { headers, signal, onOpen, onEvent, onError, heartbeatTimeout = 60_000 } = options;

  let response: Response;

  try {
    response = await fetch(url, {
      method: "GET",
      headers: {
        Accept: "text/event-stream",
        "Cache-Control": "no-cache",
        ...headers,
      },
      signal,
      // @ts-ignore — React Native fetch supports this to disable response buffering
      reactNative: { textStreaming: true },
    });
  } catch (err) {
    onError?.(err);
    return;
  }

  if (!response.ok) {
    onError?.(new Error(`SSE connection failed: ${response.status}`));
    return;
  }

  onOpen?.();

  const reader = response.body?.getReader();
  if (!reader) {
    onError?.(new Error("Response body is not readable"));
    return;
  }

  const decoder = new TextDecoder("utf-8");
  let buffer = "";
  let bufferByteSize = 0;
  let heartbeatTimer: ReturnType<typeof setTimeout> | null = null;

  function resetHeartbeat() {
    if (heartbeatTimer) clearTimeout(heartbeatTimer);
    heartbeatTimer = setTimeout(() => {
      reader!.cancel().catch(() => {});
      onError?.(new Error("SSE heartbeat timeout — no data received"));
    }, heartbeatTimeout);
  }

  resetHeartbeat();

  try {
    while (true) {
      const { done, value } = await reader.read();

      if (done) break;

      resetHeartbeat();

      // value là Uint8Array — length chính là byte count thực tế
      bufferByteSize += value.byteLength;
      if (bufferByteSize > MAX_BUFFER_BYTES) {
        throw new Error("SSE buffer overflow — server may not be sending event boundaries");
      }

      buffer += decoder.decode(value, { stream: true });

      const eventBlocks = buffer.split("\n\n");
      buffer = eventBlocks.pop() ?? "";

      // Recalculate buffer byte size sau khi đã consume events
      const encoder = new TextEncoder();
      bufferByteSize = encoder.encode(buffer).byteLength;

      for (const block of eventBlocks) {
        if (!block.trim()) continue;

        let eventType = "message";
        const dataLines: string[] = [];

        for (const line of block.split("\n")) {
          if (line.startsWith("event:")) {
            eventType = line.slice(6).trim();
          } else if (line.startsWith("data:")) {
            dataLines.push(line.slice(5).trim());
          }
        }

        if (dataLines.length > 0) {
          onEvent?.(eventType, dataLines.join("\n"));
        }
      }
    }
  } catch (err) {
    if (err instanceof Error) {
      // AbortError = browser/Node cancel; FetchRequestCanceledException = Expo cancel
      if (err.name === "AbortError") return;
      if (err.message?.includes("FetchRequestCanceledException")) return;
      if ((err as any).code === "FetchRequestCanceledException") return;
    }
    onError?.(err);
  } finally {
    if (heartbeatTimer) clearTimeout(heartbeatTimer);
    reader.cancel().catch(() => {});
  }
}
