import type { Ticker } from "./ticker.ts";
import type { Snapshot } from "@/types";

const abortControllers = new Set<AbortController>();

export const sseResponse = (ticker: Ticker): Response => {
  const ac = new AbortController();
  abortControllers.add(ac);

  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
      ac.signal.addEventListener("abort", () => {
        try {
          controller.close();
        } catch {
          // Stream may already be closed
        }
        unsubscribe?.();
        abortControllers.delete(ac);
      }, { once: true });

      controller.enqueue(new TextEncoder().encode("retry: 1000\n\n"));
      unsubscribe = ticker.onTick((snapshot: Snapshot) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(snapshot)}\n\n`));
        } catch {
          // Stream may be closed
        }
      });
    },
    cancel() {
      unsubscribe?.();
      abortControllers.delete(ac);
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};

export const cleanupSse = () => {
  for (const ac of [...abortControllers]) {
    ac.abort();
  }
  abortControllers.clear();
};
