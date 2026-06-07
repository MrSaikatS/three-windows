import type { Snapshot } from "@/types";
import type { Transport, TransportStatus } from "./types.ts";

export const createWebSocketTransport = (): Transport & {
  reconnect: () => void;
  getReconnectCount: () => number;
  onStatusChange: (cb: ((status: TransportStatus) => void) | null) => void;
} => {
  let ws: WebSocket | null = null;
  let reconnectCount = 0;
  let subscribers = new Set<(s: Snapshot) => void>();
  let statusCallback: ((status: TransportStatus) => void) | null = null;

  const setStatus = (status: TransportStatus) => {
    statusCallback?.(status);
  };

  const connect = () => {
    setStatus("connecting");
    ws = new WebSocket(`ws://${location.host}/api/stream/ws`);
    ws.onopen = () => setStatus("connected");
    ws.onmessage = (e) => {
      try {
        const snapshot: Snapshot = JSON.parse(e.data as string);
        for (const cb of subscribers) cb(snapshot);
      } catch { /* skip malformed */ }
    };
    ws.onclose = () => {
      ws = null;
      setStatus("disconnected");
    };
    ws.onerror = () => {
      ws?.close();
    };
  };

  return {
    reconnect() {
      reconnectCount++;
      ws?.close();
      connect();
    },
    getReconnectCount: () => reconnectCount,
    onStatusChange(cb) {
      statusCallback = cb;
    },
    subscribe(cb: (s: Snapshot) => void): () => void {
      subscribers.add(cb);
      if (!ws) connect();
      return () => {
        subscribers.delete(cb);
        if (subscribers.size === 0) {
          ws?.close();
          ws = null;
        }
      };
    },
    destroy() {
      subscribers.clear();
      ws?.close();
      ws = null;
    },
  };
};
