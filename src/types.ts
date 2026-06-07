export type Mode = "ticker" | "system";

export type TickerSnapshot = {
  readonly mode: "ticker";
  readonly value: number;
  readonly ts: number;
};

export type SystemSnapshot = {
  readonly mode: "system";
  readonly cpu: number;
  readonly ram: number;
  readonly netIn: number;
  readonly netOut: number;
  readonly ts: number;
};

export type Snapshot = TickerSnapshot | SystemSnapshot;
