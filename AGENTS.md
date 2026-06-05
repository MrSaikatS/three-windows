# Agent behavior

- **Ask questions** when the request is ambiguous, when there are real tradeoffs, or before non-obvious / destructive actions. Prefer one short batched `question` call over back-and-forth guessing.
- **Record new learning** back into this file (or a clearly-scoped section) when you discover a gotcha, convention, or fix. Keep entries high-signal; delete stale ones.
- **Load skills** via the `skill` tool when a task matches. The skills listed in the system prompt (shadcn, prisma, next, better-auth, vercel-react, zod, etc.) do **not** apply to this repo — Bun-only TS, no web/auth/ORM stack.

# Repo: three-windows

Bun-only TypeScript scaffold. `index.ts` is a placeholder (`console.log("Hello via Bun!")`) and `README.md` is empty — the real product is unimplemented.

## Toolchain

- **Bun** is the runtime, package manager, and test runner. Use `bun` / `bunx` — not `npm`, `pnpm`, or raw `node`. `bun.lock` is the lockfile; do not introduce `package-lock.json` / `pnpm-lock.yaml`.
- TypeScript is typecheck-only (`"noEmit": true` in `tsconfig.json`). Bun handles transpilation/loading.

## Commands (no `scripts` in `package.json`)

- Run entry: `bun run index.ts` (or `bun index.ts`)
- Typecheck: `bunx tsc --noEmit` (`--noEmit` is redundant — already set in `tsconfig.json`)
- Install / add deps: `bun install` · `bun add <pkg>` · `bun add -d <pkg>`
- Tests: `bun test` (none configured — no test files exist)
- Lint / format: not configured — don't invent commands

## Code style

- **Always use arrow functions.** No `function` declarations, no `function` expressions. Use `const name = (...args) => ...` for top-level functions, callbacks, and React components (`const Panel = () => { ... }`).
- Avoid inline type annotations on arrow function parameters only when the type is obvious from the parameter name; otherwise annotate.

## TypeScript gotchas (`tsconfig.json`)

- `lib: ["ESNext"]` only — **no DOM types**. `document`, `window`, `fetch`, etc. will not resolve.
- `verbatimModuleSyntax: true` — type-only imports must use `import type { ... }`.
- `noUncheckedIndexedAccess: true` — array/record index access returns `T | undefined`; handle explicitly.
- `module: "Preserve"` + `moduleResolution: "bundler"` + `allowImportingTsExtensions: true` — Bun-bundler mode; `.ts`-extension imports are fine.
- `strict: true`, `noFallthroughCasesInSwitch: true`, `noImplicitOverride: true`.
- `noUnusedLocals` / `noUnusedParameters` / `noPropertyAccessFromIndexSignature` are explicitly **off** — don't reflexively re-enable.

## Layout

- Single package, no workspaces. ESM (`"type": "module"`, `"module": "index.ts"`).
- `dependencies` is empty; only `@types/bun` (dev) and `typescript` (peer).
- No CI (`.github/`), no pre-commit, no test files, no lint config, no `.editorconfig`.
