import type { Snapshot } from "@/types";
import type { Transport, TransportStatus } from "./types.ts";
import {
  createReconnectState,
  scheduleReconnect,
  cancelReconnect,
  manualReconnect,
  type ReconnectState,
} from "./shared.ts";

export const createWebSocketTransport = (): Transport & {
  reconnect: () => void;
  getReconnectCount: () => number;
  getBytesTransferred: () => number;
} => {
  let ws: WebSocket | null = null;
  let bytesTransferred = 0;
  let subscribers = new Set<(s: Snapshot) => void>();
  let statusCallback: ((status: TransportStatus) => void) | null = null;
  const rc: ReconnectState = createReconnectState();

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
        bytesTransferred += (e.data as string).length;
        for (const cb of subscribers) cb(snapshot);
      } catch { /* skip malformed */ }
    };
    ws.onclose = () => {
      ws = null;
      setStatus("disconnected");
      if (!rc.manualReconnect) scheduleReconnect(rc, connect, () => subscribers.size > 0);
    };
    ws.onerror = () => {
      ws?.close();
    };
  };

  return {
    reconnect() {
      ws?.close();
      ws = null;
      manualReconnect(rc, connect);
    },
    getReconnectCount: () => rc.reconnectCount,
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
          cancelReconnect(rc);
          ws?.close();
          ws = null;
        }
      };
    },
    destroy() {
      subscribers.clear();
      cancelReconnect(rc);
      ws?.close();
      ws = null;
    },
  };
};
