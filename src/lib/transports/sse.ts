import type { Snapshot } from "@/types";
import type { Transport, TransportStatus } from "./types.ts";
import {
  createReconnectState,
  scheduleReconnect,
  cancelReconnect,
  manualReconnect,
  type ReconnectState,
} from "./shared.ts";

export const createSSETransport = (): Transport & {
  reconnect: () => void;
  getReconnectCount: () => number;
  getBytesTransferred: () => number;
} => {
  let es: EventSource | null = null;
  let bytesTransferred = 0;
  let subscribers = new Set<(s: Snapshot) => void>();
  let statusCallback: ((status: TransportStatus) => void) | null = null;
  const rc: ReconnectState = createReconnectState();

  const setStatus = (status: TransportStatus) => {
    statusCallback?.(status);
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
      if (!rc.manualReconnect) scheduleReconnect(rc, connect, () => subscribers.size > 0);
    };
  };

  return {
    reconnect() {
      es?.close();
      es = null;
      manualReconnect(rc, connect);
    },
    getReconnectCount: () => rc.reconnectCount,
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
          cancelReconnect(rc);
          es?.close();
          es = null;
        }
      };
    },
    destroy() {
      subscribers.clear();
      cancelReconnect(rc);
      es?.close();
      es = null;
    },
  };
};
