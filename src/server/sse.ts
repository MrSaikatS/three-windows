import type { Ticker } from "./ticker.ts";
import type { Snapshot } from "@/types";

export const sseResponse = (ticker: Ticker): Response => {
  let unsubscribe: (() => void) | null = null;

  const stream = new ReadableStream({
    start(controller) {
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
