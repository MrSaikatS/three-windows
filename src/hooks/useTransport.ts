import { createPollingTransport } from "@/lib/transports/polling.ts";
import { createSSETransport } from "@/lib/transports/sse.ts";
import type { Transport, TransportStatus } from "@/lib/transports/types.ts";
import { createWebSocketTransport } from "@/lib/transports/websocket.ts";
import type { Snapshot } from "@/types";
import { useCallback, useEffect, useRef, useState } from "react";

const MAX_SPARKLINE = 60;

type TransportInstance = Transport & {
  setInterval?: (ms: number) => void;
  reconnect?: () => void;
  getReconnectCount?: () => number;
  getRequestsSent?: () => number;
  getBytesTransferred?: () => number;
};

export const useTransport = (
  kind: "polling" | "websocket" | "sse",
  initialInterval = 1000,
) => {
  const [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [status, setStatus] = useState<TransportStatus>("disconnected");
  const [updateCount, setUpdateCount] = useState(0);
  const [requestsSent, setRequestsSent] = useState(0);
  const [reconnectCount, setReconnectCount] = useState(0);
  const [bytesTransferred, setBytesTransferred] = useState(0);
  const [dataPoints, setDataPoints] = useState<number[]>([]);
  const [currentInterval, setCurrentInterval] = useState(initialInterval);
  const [jitterMs, setJitterMs] = useState(0);
  const [latencyBuckets, setLatencyBuckets] = useState<
    [number, number, number, number]
  >([0, 0, 0, 0]);
  const transportRef = useRef<TransportInstance | null>(null);
  const intervalsRef = useRef<number[]>([]);
  const latencySamplesRef = useRef<number[]>([]);
  const lastUpdateRef = useRef<number>(0);

  const pushDataPoint = useCallback((s: Snapshot) => {
    const val = s.mode === "ticker" ? s.value : s.cpu;
    setDataPoints((prev) => {
      const next = [...prev, val];
      return next.length > MAX_SPARKLINE ? next.slice(-MAX_SPARKLINE) : next;
    });
  }, []);

  const recordUpdate = useCallback((s: Snapshot) => {
    const now = Date.now();
    if (lastUpdateRef.current) {
      const interval = now - lastUpdateRef.current;
      intervalsRef.current = [...intervalsRef.current, interval].slice(-30);
      if (intervalsRef.current.length > 1) {
        const mean =
          intervalsRef.current.reduce((a, b) => a + b, 0) /
          intervalsRef.current.length;
        const variance =
          intervalsRef.current.reduce((a, b) => a + (b - mean) ** 2, 0) /
          intervalsRef.current.length;
        setJitterMs(Math.round(Math.sqrt(variance) * 10) / 10);
      }
    }
    lastUpdateRef.current = now;

    const clientLatency = now - s.ts;
    latencySamplesRef.current = [
      ...latencySamplesRef.current,
      clientLatency,
    ].slice(-60);
    const total = latencySamplesRef.current.length;
    const b1 = latencySamplesRef.current.filter((l) => l < 10).length;
    const b2 = latencySamplesRef.current.filter(
      (l) => l >= 10 && l < 50,
    ).length;
    const b3 = latencySamplesRef.current.filter(
      (l) => l >= 50 && l < 250,
    ).length;
    const b4 = latencySamplesRef.current.filter((l) => l >= 250).length;
    setLatencyBuckets([
      Math.round((b1 / total) * 100),
      Math.round((b2 / total) * 100),
      Math.round((b3 / total) * 100),
      Math.round((b4 / total) * 100),
    ]);
  }, []);

  useEffect(() => {
    let t: TransportInstance;

    if (kind === "polling") {
      const p = createPollingTransport();
      t = p;
      p.setInterval(initialInterval);
      p.onStatusChange(setStatus);
      const unsub = p.subscribe((s) => {
        recordUpdate(s);
        setSnapshot(s);
        setUpdateCount((c) => c + 1);
        setRequestsSent(p.getRequestsSent());
        setBytesTransferred(p.getBytesTransferred());
        pushDataPoint(s);
      });
      transportRef.current = t;
      return () => {
        unsub();
        p.destroy();
        transportRef.current = null;
      };
    } else if (kind === "websocket") {
      const ws = createWebSocketTransport();
      t = ws;
      ws.onStatusChange(setStatus);
      const unsub = ws.subscribe((s) => {
        recordUpdate(s);
        setSnapshot(s);
        setUpdateCount((c) => c + 1);
        setReconnectCount(ws.getReconnectCount());
        setBytesTransferred(ws.getBytesTransferred());
        pushDataPoint(s);
      });
      transportRef.current = t;
      return () => {
        unsub();
        ws.destroy();
        transportRef.current = null;
      };
    } else {
      const sse = createSSETransport();
      t = sse;
      sse.onStatusChange(setStatus);
      const unsub = sse.subscribe((s) => {
        recordUpdate(s);
        setSnapshot(s);
        setUpdateCount((c) => c + 1);
        setReconnectCount(sse.getReconnectCount());
        setBytesTransferred(sse.getBytesTransferred());
        pushDataPoint(s);
      });
      transportRef.current = t;
      return () => {
        unsub();
        sse.destroy();
        transportRef.current = null;
      };
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

  const latency = snapshot ? Date.now() - snapshot.ts : null;

  return {
    snapshot,
    status,
    latency,
    updateCount,
    requestsSent,
    reconnectCount,
    bytesTransferred,
    dataPoints,
    currentInterval,
    jitterMs,
    latencyBuckets,
    setPollingInterval,
    reconnect,
  } as const;
};
