# three-windows

A single-page dashboard with three side-by-side panels (**Polling**, **WebSocket**, **SSE**) all consuming the same simulated data source. The goal is to make the architectural differences between the three transports **visually and measurably obvious** — latency, stale-by, request count, connection state, and reconnect behaviour all exposed as live metrics.

Built on **Bun fullstack** (one `Bun.serve` instance handles the HTML, the API routes, and the WebSocket), **React 19**, **shadcn/ui**, and **Tailwind v4**. No Vite, no chart library — the sparkline is hand-rolled inline SVG.

See `plan.md` for the full design and `AGENTS.md` for repo conventions.

## Phases

- [ ] **Phase 0 — Scaffold.** `bun init --react=shadcn`, restore `AGENTS.md` and `LICENSE`, add shadcn components (card, button, select, toggle-group, badge, separator, tooltip).
- [ ] **Phase 1 — Server: ticker & snapshot.** Shared `Ticker` with `Ticker` and `System` modes, 250 ms tick. `GET /api/snapshot` returns the latest snapshot as JSON.
- [ ] **Phase 2 — Server: SSE.** `GET /api/stream/sse` returns a long-lived `text/event-stream` that pushes a snapshot on every tick.
- [ ] **Phase 3 — Server: WebSocket.** `GET /api/stream/ws` upgrades the connection and pushes a snapshot on every tick.
- [ ] **Phase 4 — Client: transports.** `src/lib/transports/` with `polling.ts`, `websocket.ts`, `sse.ts` behind a shared `Transport` interface. `useTransport` hook subscribes and exposes metrics.
- [ ] **Phase 5 — Client: panels.** Three visually identical shadcn `Card`s (`PollingPanel`, `WebSocketPanel`, `SSEPanel`) each driven by its respective transport.
- [ ] **Phase 6 — Client: controls.** Header `DataSourceToggle` (Ticker / System) switches the data domain globally; polling-only `PollingIntervalSelect` (100 / 250 / 1000 / 5000 ms).
- [ ] **Phase 7 — Client: metrics.** Latency badge (color-coded), sparkline (last ~60 points), connection dot, request count, manual WebSocket reconnect button.
- [ ] **Phase 8 — Verification.** `bunx tsc --noEmit` clean; all three panels tick in lockstep; polling at 5 s visibly lags WS/SSE; `Ctrl-C` the server — WS stays dead (manual reconnect), SSE auto-reconnects, polling retries; `bun run build` + `bun start` works.

## Commands

- `bun dev` — dev server with HMR (single port `:3000`).
- `bun run build` — pre-build the React/CSS bundle.
- `bun start` — production server with the pre-built manifest.
- `bunx tsc --noEmit` — typecheck.
