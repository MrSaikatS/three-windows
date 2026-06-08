import { useEffect, useRef, useState, useCallback } from "react";
import type { Snapshot } from "@/types";
import type { Transport, TransportStatus } from "@/lib/transports/types.ts";
import { createPollingTransport } from "@/lib/transports/polling.ts";
import { createWebSocketTransport } from "@/lib/transports/websocket.ts";
import { createSSETransport } from "@/lib/transports/sse.ts";

const MAX_SPARKLINE = 60;

type TransportInstance = Transport & {
  setInterval?: (ms: number) => void;
  reconnect?: () => void;
  getReconnectCount?: () => number;
  getRequestsSent?: () => number;
  getBytesTransferred?: () => number;
};

export const useTransport = (kind: "polling" | "websocket" | "sse", initialInterval = 1000) => {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<TransportStatus>("disconnected");
  const [updateCount, setUpdateCount] = useState(0);
  const [requestsSent, setRequestsSent] = useState(0);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [currentInterval, setCurrentInterval] = useState(initialInterval);
  const transportRef = useRef<TransportInstance | null>(null);

  const pushDataPoint = useCallback((s: Snapshot) => {
    const val = s.mode === "ticker" ? s.value : s.cpu;
    setDataPoints((prev) => {
      const next = [...prev, val];
      return next.length > MAX_SPARKLINE ? next.slice(-MAX_SPARKLINE) : next;
    });
  }, []);

  useEffect(() => {
    let t: TransportInstance;

    if (kind === "polling") {
      const p = createPollingTransport();
      t = p;
      p.setInterval(initialInterval);
      p.onStatusChange(setStatus);
      const unsub = p.subscribe((s) => {
        setSnapshot(s);
        setUpdateCount((c) => c + 1);
        setRequestsSent(p.getRequestsSent());
        setBytesTransferred(p.getBytesTransferred());
        pushDataPoint(s);
      });
      transportRef.current = t;
      return () => { unsub(); p.destroy(); transportRef.current = null; };
    } else if (kind === "websocket") {
      const ws = createWebSocketTransport();
      t = ws;
      ws.onStatusChange(setStatus);
      const unsub = ws.subscribe((s) => {
        setSnapshot(s);
        setUpdateCount((c) => c + 1);
        setReconnectCount(ws.getReconnectCount());
        setBytesTransferred(ws.getBytesTransferred());
        pushDataPoint(s);
      });
      transportRef.current = t;
      return () => { unsub(); ws.destroy(); transportRef.current = null; };
    } else {
      const sse = createSSETransport();
      t = sse;
      sse.onStatusChange(setStatus);
      const unsub = sse.subscribe((s) => {
        setSnapshot(s);
        setUpdateCount((c) => c + 1);
        setReconnectCount(sse.getReconnectCount());
        setBytesTransferred(sse.getBytesTransferred());
        pushDataPoint(s);
      });
      transportRef.current = t;
      return () => { unsub(); sse.destroy(); transportRef.current = null; };
    }
  }, [kind, initialInterval, pushDataPoint]);

  const setPollingInterval = useCallback((ms: number) => {
    setCurrentInterval(ms);
    transportRef.current?.setInterval?.(ms);
  }, []);

  const reconnect = useCallback(() => {
    transportRef.current?.reconnect?.();
    if (transportRef.current?.getReconnectCount) {
      setReconnectCount(transportRef.current.getReconnectCount());
    }
  }, []);

  const latency = snapshot ? performance.now() - snapshot.ts : null;

  return { snapshot, status, latency, updateCount, requestsSent, reconnectCount, bytesTransferred, dataPoints, currentInterval, setPollingInterval, reconnect } as const;
};
