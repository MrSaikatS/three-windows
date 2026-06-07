import index from "./index.html";
import { ticker } from "./server/ticker.ts";

const server = Bun.serve({
  port: 3000,
  routes: {
    "/": index,
  },
  fetch(req) {
    const url = new URL(req.url);

    if (url.pathname === "/api/snapshot") {
      return Response.json(ticker.latest());
    }

    return new Response("Not found", { status: 404 });
  },
  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`🚀 Server running at ${server.url}`);
