import type { Snapshot } from "@/types";
import type { Transport, TransportStatus } from "./types.ts";

const RECONNECT_DELAY = 2000;

export const createSSETransport = (): Transport & {
  reconnect: () => void;
  getReconnectCount: () => number;
  getBytesTransferred: () => number;
  onStatusChange: (cb: ((status: TransportStatus) => void) | null) => void;
} => {
  let es: EventSource | null = null;
  let reconnectCount = 0;
  let bytesTransferred = 0;
  let subscribers = new Set<(s: Snapshot) => void>();
  let statusCallback: ((status: TransportStatus) => void) | null = null;
  let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
  let manualReconnect = false;

  const setStatus = (status: TransportStatus) => {
    statusCallback?.(status);
  };

  const scheduleReconnect = () => {
    if (reconnectTimer) clearTimeout(reconnectTimer);
    if (subscribers.size === 0) return;
    reconnectTimer = setTimeout(() => {
      reconnectTimer = null;
      reconnectCount++;
      connect();
    }, RECONNECT_DELAY);
  };

  const cancelReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  const connect = () => {
    setStatus("connecting");
    es = new EventSource("/api/stream/sse");
    es.onopen = () => setStatus("connected");
    es.onmessage = (e) => {
      try {
        const snapshot: Snapshot = JSON.parse(e.data as string);
        bytesTransferred += (e.data as string).length + 8;
        for (const cb of subscribers) cb(snapshot);
      } catch { /* skip malformed */ }
    };
    es.onerror = () => {
      es?.close();
      es = null;
      setStatus("disconnected");
      if (!manualReconnect) scheduleReconnect();
    };
  };

  return {
    reconnect() {
      manualReconnect = true;
      cancelReconnect();
      reconnectCount++;
      es?.close();
      es = null;
      connect();
      manualReconnect = false;
    },
    getReconnectCount: () => reconnectCount,
    getBytesTransferred: () => bytesTransferred,
    onStatusChange(cb) {
      statusCallback = cb;
    },
    subscribe(cb: (s: Snapshot) => void): () => void {
      subscribers.add(cb);
      if (!es) connect();
      return () => {
        subscribers.delete(cb);
        if (subscribers.size === 0) {
          cancelReconnect();
          es?.close();
          es = null;
        }
      };
    },
    destroy() {
      subscribers.clear();
      cancelReconnect();
      es?.close();
      es = null;
    },
  };
};
