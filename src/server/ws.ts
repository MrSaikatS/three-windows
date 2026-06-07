import type { ServerWebSocket } from "bun";
import type { Ticker } from "./ticker.ts";

const unsubs = new WeakMap<ServerWebSocket, () => void>();

export const wsHandlers = (ticker: Ticker) => ({
  open(ws: ServerWebSocket) {
    const unsub = ticker.onTick((snapshot) => {
      ws.send(JSON.stringify(snapshot));
    });
    unsubs.set(ws, unsub);
  },
  close(ws: ServerWebSocket) {
    unsubs.get(ws)?.();
    unsubs.delete(ws);
  },
  message(_ws: ServerWebSocket, _message: string | Buffer) {
    // No client→server messages expected in this demo
  },
});
