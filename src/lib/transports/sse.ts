import type { Snapshot } from "@/types";
import type { Transport, TransportStatus } from "./types.ts";

export const createSSETransport = (): Transport & {
  onStatusChange: (cb: ((status: TransportStatus) => void) | null) => void;
} => {
  let es: EventSource | null = null;
  let subscribers = new Set<(s: Snapshot) => void>();
  let statusCallback: ((status: TransportStatus) => void) | null = null;

  const setStatus = (status: TransportStatus) => {
    statusCallback?.(status);
  };

  const connect = () => {
    setStatus("connecting");
    es = new EventSource("/api/stream/sse");
    es.onmessage = (e) => {
      setStatus("connected");
      try {
        const snapshot: Snapshot = JSON.parse(e.data as string);
        for (const cb of subscribers) cb(snapshot);
      } catch { /* skip malformed */ }
    };
    es.onerror = () => {
      setStatus("disconnected");
    };
  };

  return {
    onStatusChange(cb) {
      statusCallback = cb;
    },
    subscribe(cb: (s: Snapshot) => void): () => void {
      subscribers.add(cb);
      if (!es) connect();
      return () => {
        subscribers.delete(cb);
        if (subscribers.size === 0) {
          es?.close();
          es = null;
        }
      };
    },
    destroy() {
      subscribers.clear();
      es?.close();
      es = null;
    },
  };
};
