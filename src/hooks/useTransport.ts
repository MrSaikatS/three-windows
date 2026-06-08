import { useEffect, useRef, useState, useCallback } from "react";
import type { Snapshot } from "@/types";
import type { Transport, TransportStatus } from "@/lib/transports/types.ts";
import { createPollingTransport } from "@/lib/transports/polling.ts";
import { createWebSocketTransport } from "@/lib/transports/websocket.ts";
import { createSSETransport } from "@/lib/transports/sse.ts";

const MAX_SPARKLINE = 60;

type WithPolling = Transport & { setInterval: (ms: number) => void; getRequestsSent: () => number; getBytesTransferred: () => number };
type WithWs = Transport & { reconnect: () => void; getReconnectCount: () => number; getBytesTransferred: () => number };
type WithSse = Transport & { reconnect: () => void; getReconnectCount: () => number; getBytesTransferred: () => number };

export const useTransport = (kind: "polling" | "websocket" | "sse", initialInterval = 1000) => {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<TransportStatus>("disconnected");
  const [updateCount, setUpdateCount] = useState(0);
  const [requestsSent, setRequestsSent] = useState(0);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [currentInterval, setCurrentInterval] = useState(initialInterval);
  const pollingRef = useRef<WithPolling | null>(null);
  const wsRef = useRef<WithWs | null>(null);
  const sseRef = useRef<WithSse | null>(null);

  const pushDataPoint = useCallback((s: Snapshot) => {
    const val = s.mode === "ticker" ? s.value : s.cpu;
    setDataPoints((prev) => {
      const next = [...prev, val];
      return next.length > MAX_SPARKLINE ? next.slice(-MAX_SPARKLINE) : next;
    });
  }, []);

  useEffect(() => {
    if (kind === "polling") {
      const p = createPollingTransport();
      pollingRef.current = p;
      p.onStatusChange(setStatus);
      p.setInterval(initialInterval);
      const unsub = p.subscribe((s) => {
        setSnapshot(s);
        setUpdateCount((c) => c + 1);
        setRequestsSent(p.getRequestsSent());
        setBytesTransferred(p.getBytesTransferred());
        pushDataPoint(s);
      });
      return () => { unsub(); p.destroy(); pollingRef.current = null; };
    }

    if (kind === "websocket") {
      const ws = createWebSocketTransport();
      wsRef.current = ws;
      ws.onStatusChange(setStatus);
      const unsub = ws.subscribe((s) => {
        setSnapshot(s);
        setUpdateCount((c) => c + 1);
        setReconnectCount(ws.getReconnectCount());
        setBytesTransferred(ws.getBytesTransferred());
        pushDataPoint(s);
      });
      return () => { unsub(); ws.destroy(); wsRef.current = null; };
    }

    if (kind === "sse") {
      const sse = createSSETransport();
      sseRef.current = sse;
      sse.onStatusChange(setStatus);
      const unsub = sse.subscribe((s) => {
        setSnapshot(s);
        setUpdateCount((c) => c + 1);
        setReconnectCount(sse.getReconnectCount());
        setBytesTransferred(sse.getBytesTransferred());
        pushDataPoint(s);
      });
      return () => { unsub(); sse.destroy(); sseRef.current = null; };
    }
  }, [kind, initialInterval, pushDataPoint]);

  const setPollingInterval = useCallback((ms: number) => {
    setCurrentInterval(ms);
    pollingRef.current?.setInterval(ms);
  }, []);

  const reconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.reconnect();
      setReconnectCount(wsRef.current.getReconnectCount());
    } else if (sseRef.current) {
      sseRef.current.reconnect();
      setReconnectCount(sseRef.current.getReconnectCount());
    }
  }, []);

  const latency = snapshot ? performance.now() - snapshot.ts : null;

  return { snapshot, status, latency, updateCount, requestsSent, reconnectCount, bytesTransferred, dataPoints, currentInterval, setPollingInterval, reconnect } as const;
};
