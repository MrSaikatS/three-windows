import type { Snapshot } from "@/types";

export type TransportStatus = "connecting" | "connected" | "disconnected";

export interface Transport {
  subscribe(cb: (snapshot: Snapshot) => void): () => void;
  onStatusChange(cb: ((status: TransportStatus) => void) | null): void;
  destroy(): void;
}
