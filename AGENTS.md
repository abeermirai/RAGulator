<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Cursor Cloud specific instructions

- This is a front-end-only prototype: a bilingual (Arabic RTL / English LTR) SSR web UI for the "Alinma Intelligent Audit Platform" (RAGulator AI). There is **no backend, database, or external service** — all content is hardcoded mock data, so the app's own dev server is the only service to run.
- Package manager is **Bun** (`bun.lock`, `bunfig.toml`). Standard scripts live in `package.json`: `bun run dev`, `bun run build`, `bun run lint`, `bun run format`. Run in development with `bun run dev` (Vite + TanStack Start SSR); it serves on `http://localhost:8080/`.
- `bunfig.toml` sets `minimumReleaseAge = 86400` (a 24h supply-chain guard that skips packages published less than a day ago); this can make `bun install` skip very fresh versions. Do not add packages to `minimumReleaseAgeExcludes` without user confirmation.
- App flow to smoke-test end to end: `/` redirects to `/signin`; sign-in is mock (fields are prefilled, any input works) → click Continue → enter any 6-digit code on the MFA step → Verify → lands on `/_shell/dashboard`. Other authenticated routes: `/dashboard`, `/ingestion`, `/workspace`, `/report`.
- Lint uses ESLint + Prettier; the imported source currently has many pre-existing `prettier/prettier` formatting violations, so `bun run lint` exits non-zero out of the box. `bun run format` (prettier --write) would fix them, but that rewrites source — only do so if intended.
- There are no automated tests (no vitest/jest/playwright); verify changes by exercising the UI in the dev server.
