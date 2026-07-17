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

- **Source lives in a zip.** The git repo only tracks config files plus `RAGulator AI Assistant.zip`; there is no committed `src/`. The startup update script auto-extracts the zip into `src/`, `public/`, and `.lovable/` (only when `src/` is missing, so it is safe/idempotent). To extract manually: `unzip -o "RAGulator AI Assistant.zip" -d .`. The extracted files are gitignored-free but intentionally left uncommitted so they don't diverge from the zip / Lovable sync.
- **Package manager is Bun**, installed at `~/.bun/bin` (added to `~/.bashrc`). If `bun` is not on PATH in a non-interactive shell, use `~/.bun/bin/bun` or `export PATH="$HOME/.bun/bin:$PATH"`. Scripts: `bun install`, `bun run dev`, `bun run lint`, `bun run format`, `bun run build`, `bun run preview` (see `package.json`).
- **One service only:** the Vite dev server (`bun run dev`) on http://localhost:8080 (host/port are managed by `@lovable.dev/vite-tanstack-config`). `/` redirects to `/signin`.
- **Frontend-only mock app** — no backend, database, API keys, or env vars. Sign-in is a simulated email/OTP flow (credentials are pre-filled; any 6-digit OTP is accepted) that navigates to `/dashboard`. All chat/RAG/report content is hard-coded mock data.
- **Lint state:** `bun run lint` currently reports pre-existing `prettier/prettier` formatting errors from the zipped source; these are code-style issues, not environment problems. `bun run format` fixes them but edits source.
- Do not manually add plugins already bundled by `@lovable.dev/vite-tanstack-config` (tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro, etc.) — see the note in `vite.config.ts`.
