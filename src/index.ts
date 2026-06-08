import index from "./index.html";
import { sseResponse, cleanupSse } from "./server/sse.ts";
import { ticker } from "./server/ticker.ts";
import { wsHandlers, cleanupWs } from "./server/ws.ts";

let killed = false;

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
  },
  async fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/api/snapshot") {
      if (killed) return new Response("Server killed", { status: 503 });
      if (req.method === "POST") {
        const body = (await req.clone().json()) as { mode?: string };
        if (body.mode === "ticker" || body.mode === "system") {
          ticker.setMode(body.mode);
        }
      }
      return Response.json(ticker.latest());
    }

    if (url.pathname === "/api/stream/sse") {
      if (killed) return new Response("Server killed", { status: 503 });
      server.timeout(req, 0);
      return sseResponse(ticker);
    }

    if (url.pathname === "/api/stream/ws") {
      if (killed) return new Response("Server killed", { status: 503 });
      const ok = server.upgrade(req);
      if (ok) return;
    }

    if (url.pathname === "/api/kill") {
      if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
      killed = true;
      ticker.stop();
      cleanupSse();
      cleanupWs();
      return new Response("Killed", { status: 200 });
    }

    if (url.pathname === "/api/respawn") {
      if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
      killed = false;
      ticker.start();
      return new Response("Respawned", { status: 200 });
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

const shutdown = () => {
  console.log("\nShutting down gracefully...");
  ticker.stop();
  cleanupSse();
  cleanupWs();
  server.stop();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
