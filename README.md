# Three Windows - Real-time Transport Comparison

## (HTTP Polling vs WebSocket vs SSE)

A single-page dashboard with three side-by-side panels (**Polling**, **WebSocket**, **SSE**) all consuming the same simulated data source. The goal is to make the architectural differences between the three transports **visually and measurably obvious** — latency, stale-by, request count, connection state, and reconnect behaviour all exposed as live metrics.

Built on **Bun fullstack** (one `Bun.serve` instance handles the HTML, the API routes, and the WebSocket), **React 19**, **shadcn/ui**, and **Tailwind v4**. No Vite, no chart library — the sparkline is hand-rolled inline SVG.

## Commands

- `bun dev` — dev server with HMR (single port `:3000`).
- `bun run build` — pre-build the React/CSS bundle.
- `bun start` — production server with the pre-built manifest.
- `bunx tsc --noEmit` — typecheck.
