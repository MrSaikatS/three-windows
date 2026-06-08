import type { Snapshot } from "@/types";
import type { Transport, TransportStatus } from "./types.ts";

const RECONNECT_DELAY = 2000;

export const createWebSocketTransport = (): Transport & {
  reconnect: () => void;
  getReconnectCount: () => number;
  getBytesTransferred: () => number;
  onStatusChange: (cb: ((status: TransportStatus) => void) | null) => void;
} => {
  let ws: WebSocket | null = null;
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

  const connect = () => {
    setStatus("connecting");
    ws = new WebSocket(`ws://${location.host}/api/stream/ws`);
    ws.onopen = () => setStatus("connected");
    ws.onmessage = (e) => {
      try {
        const snapshot: Snapshot = JSON.parse(e.data as string);
        bytesTransferred += (e.data as string).length;
        for (const cb of subscribers) cb(snapshot);
      } catch { /* skip malformed */ }
    };
    ws.onclose = () => {
      ws = null;
      setStatus("disconnected");
      if (!manualReconnect) scheduleReconnect();
    };
    ws.onerror = () => {
      ws?.close();
    };
  };

  const cancelReconnect = () => {
    if (reconnectTimer) {
      clearTimeout(reconnectTimer);
      reconnectTimer = null;
    }
  };

  return {
    reconnect() {
      manualReconnect = true;
      cancelReconnect();
      reconnectCount++;
      ws?.close();
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
      if (!ws) connect();
      return () => {
        subscribers.delete(cb);
        if (subscribers.size === 0) {
          cancelReconnect();
          ws?.close();
          ws = null;
        }
      };
    },
    destroy() {
      subscribers.clear();
      cancelReconnect();
      ws?.close();
      ws = null;
    },
  };
};
