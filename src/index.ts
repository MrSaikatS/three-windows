import index from "./index.html";
import { sseResponse } from "./server/sse.ts";
import { ticker } from "./server/ticker.ts";
import { wsHandlers } from "./server/ws.ts";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
  },
  async fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/api/snapshot") {
      if (req.method === "POST") {
        const body = (await req.clone().json()) as { mode?: string };
        if (body.mode === "ticker" || body.mode === "system") {
          ticker.setMode(body.mode);
        }
      }
      return Response.json(ticker.latest());
    }

    if (url.pathname === "/api/stream/sse") {
      server.timeout(req, 0);
      return sseResponse(ticker);
    }

    if (url.pathname === "/api/stream/ws") {
      const ok = server.upgrade(req);
      if (ok) return;
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: wsHandlers(ticker),
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
