# three-windows — Plan

A single-page dashboard with three side-by-side panels (Polling, WebSocket, SSE) all consuming the same simulated data source. The goal is to make the architectural differences between the three transports **visually and measurably obvious** — latency, stale-by, request count, connection state, and reconnect behaviour all exposed as live metrics.

## Stack

- **Bun** for everything: runtime, package manager, test runner, HTTP server, bundler, HMR.
- **React 19** for the UI.
- **shadcn/ui** for component primitives.
- **Tailwind CSS v4** (via Bun's built-in plugin — no Vite, no PostCSS config).
- TypeScript, typecheck-only (`bunx tsc --noEmit`).
- **No chart library.** Sparkline is a hand-rolled inline-SVG component.

## Architecture

A **single `Bun.serve()` instance** handles:

- The HTML route (Bun's HTML-import bundler serves the built/bundled React app).
- `GET /api/snapshot` → JSON, latest server-side snapshot.
- `GET /api/stream/sse` → long-lived `text/event-stream`; server pushes a snapshot on every tick.
- `GET /api/stream/ws` → WebSocket upgrade; server pushes a snapshot on every tick.
- HMR WebSocket (Bun internal, for React dev experience).

One process, one port (`:3000`), no Vite, no proxy, no multi-process orchestration.

## The three transports (behavioural contract)

| Concern | Polling | WebSocket | SSE |
|---|---|---|---|
| Connection model | Fresh HTTP request per poll | Single persistent WS connection | Single persistent HTTP response |
| Direction | Client → server (pull) | Bidirectional (server pushes) | Server → client (push) |
| Latency floor | Poll interval | Network only | Network only |
| Stale-by on kill | New request gets `fetch` error | Connection just dies | Browser auto-reconnects on next event |
| Auto-reconnect | Free (next poll retries) | **None** (manual button exposes this) | Free (browser native) |
| Per-panel extras | Interval dropdown (100/250/1000/5000 ms), requests-sent counter | Reconnect counter, connection dot | Connection dot |

The panel with the polling dropdown is the only one that varies its cadence; the data source is switchable globally for all three panels from the header.

## Data source

A single in-process `Ticker` with two modes, switchable at runtime via a header `ToggleGroup`:

- **Ticker** — random-walk of a single number, e.g. price.
- **System** — synthesised CPU%, RAM%, net-in, net-out.

Tick cadence: **250 ms** (server-side). All three transports read from the same `Ticker.latest()` and (for streams) the same `Ticker.onTick` subscription, so the three panels are guaranteed to show the same value at the same moment.

## File layout

```
package.json                 # scripts: dev, build, start
tsconfig.json                # single config: DOM + ESNext, strict, paths "@/*" → "src/*"
bunfig.toml                  # Bun config (Tailwind plugin, etc.)
components.json              # shadcn config
.gitignore
LICENSE
AGENTS.md
plan.md
README.md
public/                      # (if any static assets; otherwise unused)

src/
  index.tsx                  # Bun.serve entry — HTML route + 3 API routes + WS upgrade
  index.html                 # HTML template (processed by Bun's HTML-import bundler)
  index.css                  # Tailwind import + shadcn theme tokens
  frontend.tsx               # React app entry (HMR-aware)
  App.tsx                    # Layout: Header + Dashboard
  types.ts                   # Shared Snapshot, Mode types (imported by server + client)
  server/
    ticker.ts                # Shared in-process snapshot source + mode switch
    sse.ts                   # SSE response builder
    ws.ts                    # WebSocket handlers (open/message/close)
  components/
    ui/                      # shadcn-generated (card, button, select, toggle-group, badge, separator, tooltip)
    Dashboard.tsx            # 3-column grid
    panels/
      PanelShell.tsx         # shadcn Card chrome shared by all three
      PollingPanel.tsx
      WebSocketPanel.tsx
      SSEPanel.tsx
    controls/
      DataSourceToggle.tsx   # shadcn toggle-group (Ticker | System)
      PollingIntervalSelect.tsx  # shadcn select (100/250/1000/5000)
    metrics/
      LatencyBadge.tsx       # shadcn badge, color-coded by latency bucket
      ConnectionDot.tsx      # green/red dot
      Sparkline.tsx          # ~30-line inline SVG, no chart library
      MetricRow.tsx          # label + value + sparkline row
  hooks/
    useTransport.ts          # subscribes a transport, exposes metrics + actions
    useDataSource.ts         # owns the current mode (Ticker | System)
  lib/
    transports/
      types.ts               # Transport interface (subscribe, unsubscribe, status)
      polling.ts             # PollingTransport
      websocket.ts           # WebSocketTransport
      sse.ts                 # SSETransport
```

## Scaffolding steps

```bash
# 1. Preserve files we must keep
mv AGENTS.md /tmp/three-windows-AGENTS.md
mv LICENSE   /tmp/three-windows-LICENSE

# 2. Remove the current placeholder so the init has a clean target
rm -f index.ts package.json tsconfig.json bun.lock
rm -rf node_modules

# 3. Scaffold the Bun + React + shadcn fullstack template
bun init --react=shadcn .

# 4. Restore preserved files
mv /tmp/three-windows-AGENTS.md ./AGENTS.md
mv /tmp/three-windows-LICENSE   ./LICENSE

# 5. Add the shadcn components we need
bunx --bun shadcn@latest add card button select toggle-group badge separator tooltip

# 6. Remove template demo files we don't want (e.g. APITester.tsx)
```

## Server (`src/index.tsx`)

```tsx
import index from "./index.html";
import { ticker } from "./server/ticker.ts";
import { sseResponse } from "./server/sse.ts";
import { wsHandlers } from "./server/ws.ts";

Bun.serve({
  port: 3000,
  routes: { "/": index },
  fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/api/snapshot") {
      return Response.json(ticker.latest());
    }

    if (url.pathname === "/api/stream/sse") {
      server.timeout(req, 0);
      return sseResponse(ticker);
    }

    if (url.pathname === "/api/stream/ws") {
      const ok = server.upgrade(req);
      if (ok) return; // upgraded
    }

    return new Response("Not found", { status: 404 });
  },
  websocket: wsHandlers(ticker),
});
```

`server/ticker.ts` exposes:

- `ticker.latest(): Snapshot`
- `ticker.onTick(cb: (s: Snapshot) => void): () => void` (returns unsubscribe)
- `ticker.setMode(mode: Mode): void`

Snapshot is updated on a 250 ms `setInterval`.

`server/sse.ts` builds a `Response` whose body is an `asyncGenerator` yielding `data: <json>\n\n` for every tick, plus an initial retry hint.

`server/ws.ts` returns Bun websocket handlers; the `open` handler subscribes to the ticker and forwards each snapshot as a JSON message; `close` unsubscribes.

## Per-panel metrics (all three)

- **Big value** — the most recent snapshot's primary number.
- **Latency Δ** — `Date.now() - snapshot.ts`, color-coded (green < 250 ms, yellow < 1000 ms, red ≥ 1000 ms).
- **Stale-by** — same value, with a "stale" label when > 1500 ms.
- **Update count** — total updates received since mount.
- **Sparkline** — last ~60 data points, hand-rolled SVG `<path>`.

**Polling-only:**

- Requests-sent counter.
- Interval dropdown (shadcn `Select`): 100 / 250 / 1000 / 5000 ms.

**WebSocket-only:**

- Reconnect counter.
- Manual "Reconnect" button. **No auto-reconnect** (this is the whole point of the demo).

**SSE-only:**

- Connection dot (green when open, red when closed/reconnecting).

## Commands

| Command | Purpose |
|---|---|
| `bun dev` | Dev server: `Bun.serve` with `--hot`. HMR for React tree; auto-restart on `src/index.tsx` changes. |
| `bun run build` | Pre-build the React/CSS bundle into a manifest via `bun build`. |
| `bun start` | Run the production server with the pre-built manifest. |
| `bunx tsc --noEmit` | Typecheck both server and client. |

## TypeScript

Single `tsconfig.json` at the project root:

- `lib: ["ESNext", "DOM", "DOM.Iterable"]` (Bun's fullstack template default; replaces the current `ESNext`-only config).
- `module: "Preserve"`, `moduleResolution: "bundler"`, `allowImportingTsExtensions: true`.
- `strict: true`, `verbatimModuleSyntax: true`, `noUncheckedIndexedAccess: true`, `noFallthroughCasesInSwitch: true`, `noImplicitOverride: true`.
- `noUnusedLocals` / `noUnusedParameters` / `noPropertyAccessFromIndexSignature` **off** (preserve AGENTS.md).
- `paths: { "@/*": ["./src/*"] }` (created by `bun init --react=shadcn`).

## Gotchas to remember during implementation

- `verbatimModuleSyntax: true` → `import type { Snapshot, Mode } from "@/types"` for all shared types.
- `noUncheckedIndexedAccess: true` → guard the sparkline ring-buffer reads.
- `bun --hot` restarts the **server** on edits to `src/index.tsx` (drops all live connections). For the demo, fine — and it's itself a teachable moment (the WS panel will need a manual reconnect).
- HMR for the React tree does **not** restart the server; client state is preserved across HMR within the page.
- `tsconfig.json` `lib` must include `DOM` for React. The current ESNext-only config will be replaced.
- shadcn's `components.json` uses `style: "new-york"` (or default), `baseColor: "neutral"`, `cssVariables: true`, paths aliased to `@/`.

## Verification

1. `bun dev` → `http://localhost:3000` shows three panels.
2. All three panels tick in lockstep at 250 ms.
3. Header `Ticker | System` toggle changes the data domain for all three at once.
4. Polling dropdown at 5 s visibly lags behind WS/SSE; at 100 ms the requests-sent counter races ahead.
5. Kill the server (`Ctrl-C`):
   - Polling: requests resume when the server is back.
   - SSE: auto-reconnects.
   - WebSocket: stays dead until the manual Reconnect button is pressed.
6. `bun run build` + `bun start` → identical behaviour, single port, pre-built frontend.
7. `bunx tsc --noEmit` → passes.

## Decisions made

- **Stack pivot from v2 (Vite) to v3 (Bun fullstack):** `bun init --react=shadcn` provides an official single-process scaffold that eliminates Vite, the proxy, and the dev orchestrator. (User pointed to https://bun.com/docs/runtime/templating/init#examples.)
- **No chart library.** Sparkline is hand-rolled inline SVG (~30 lines).
- **No auto-reconnect for WebSocket.** The whole point is to make the missing piece obvious.
- **Server files under `src/server/`.** Soft separation from React UI; avoids the cross-directory import friction of a top-level `server/`.
- **All three panels visually identical.** Only behaviour differs.
- **Snapshot endpoint stays simple.** No long-polling variant.
