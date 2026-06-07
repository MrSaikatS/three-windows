import type { Snapshot } from "@/types";
import type { Transport, TransportStatus } from "./types.ts";

export const createPollingTransport = (): Transport & {
  setInterval: (ms: number) => void;
  getRequestsSent: () => number;
} => {
  let intervalMs = 1000;
  let timer: ReturnType<typeof setTimeout> | null = null;
  let aborter: AbortController | null = null;
  let requestsSent = 0;
  let active = false;
  let subscribers = new Set<(s: Snapshot) => void>();
  let statusCallback: ((status: TransportStatus) => void) | null = null;

  const setStatus = (s: TransportStatus) => statusCallback?.(s);

  const poll = () => {
    if (!active) return;
    aborter = new AbortController();
    const signal = aborter.signal;
    requestsSent++;
    setStatus("connecting");
    fetch("/api/snapshot", { signal })
      .then((r) => r.json() as Promise<Snapshot>)
      .then((s) => {
        if (!signal.aborted) {
          setStatus("connected");
          for (const cb of subscribers) cb(s);
        }
      })
      .catch(() => {
        if (!signal.aborted) setStatus("disconnected");
      })
      .finally(() => {
        if (!signal.aborted && active) {
          timer = setTimeout(poll, intervalMs);
        }
      });
  };

  return {
    setInterval(ms: number) {
      intervalMs = ms;
    },
    getRequestsSent: () => requestsSent,
    onStatusChange(cb) {
      statusCallback = cb;
    },
    subscribe(cb: (s: Snapshot) => void): () => void {
      subscribers.add(cb);
      if (!active) {
        active = true;
        poll();
      }
      return () => {
        subscribers.delete(cb);
        if (subscribers.size === 0) {
          active = false;
          if (timer) clearTimeout(timer);
          aborter?.abort();
        }
      };
    },
    destroy() {
      active = false;
      subscribers.clear();
      if (timer) clearTimeout(timer);
      aborter?.abort();
    },
  };
};
