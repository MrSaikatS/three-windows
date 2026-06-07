import type { Mode, Snapshot } from "@/types";

const TICK_MS = 250;

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

const randomWalk = (current: number, step: number, lo: number, hi: number) =>
  clamp(current + (Math.random() * 2 - 1) * step, lo, hi);

const buildSnapshot = (mode: Mode, prev: Snapshot | null): Snapshot => {
  const ts = Date.now();
  if (mode === "ticker") {
    const value = prev && prev.mode === "ticker" ? randomWalk(prev.value, 0.5, 1, 1000) : 100;
    return { mode: "ticker", value, ts };
  }
  const prevSys = prev && prev.mode === "system" ? prev : null;
  return {
    mode: "system",
    cpu: prevSys ? randomWalk(prevSys.cpu, 5, 0, 100) : 30,
    ram: prevSys ? randomWalk(prevSys.ram, 2, 0, 100) : 45,
    netIn: prevSys ? randomWalk(prevSys.netIn, 50, 0, 1000) : 120,
    netOut: prevSys ? randomWalk(prevSys.netOut, 50, 0, 1000) : 80,
    ts,
  };
};

const createTicker = () => {
  let mode: Mode = "ticker";
  let latest: Snapshot = buildSnapshot(mode, null);
  const subscribers = new Set<(s: Snapshot) => void>();

  const tick = () => {
    latest = buildSnapshot(mode, latest);
    for (const cb of subscribers) cb(latest);
  };

  const interval = setInterval(tick, TICK_MS);

  return {
    latest: (): Snapshot => latest,
    onTick: (cb: (s: Snapshot) => void): (() => void) => {
      subscribers.add(cb);
      return () => {
        subscribers.delete(cb);
      };
    },
    setMode: (next: Mode) => {
      mode = next;
      latest = buildSnapshot(mode, latest);
    },
    stop: () => {
      clearInterval(interval);
      subscribers.clear();
    },
  };
};

export const ticker = createTicker();
export type Ticker = ReturnType<typeof createTicker>;
