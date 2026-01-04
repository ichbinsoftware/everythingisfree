# GitHub Copilot / AI Assistant Instructions

Purpose: Help AI coding assistants be productive in this repository by summarizing the architecture, developer workflows, and repository-specific conventions.

Big picture
- Runtime: Cloudflare Workers serving an SSR web UI and proxying audio files from Cloudflare R2.
- Assets: static files (`style.css`, `app.js`, `stem-descriptions.json`) are served from a separate R2 `ASSETS` binding.
- Audio: canonical WAV files (downloads) + M4A mirrors (streaming). Worker lists WAVs but client loads `.m4a` for playback.

Key files (start here)
- [AGENTS.md](AGENTS.md) — project overview and conventions
- [CLAUDE.md](CLAUDE.md) — longer assistant guidance and implementation notes
- [src/workers/everything-is-free-worker.js](src/workers/everything-is-free-worker.js) — main Worker: routing, HTML rendering, R2 access
- [src/workers/app.js](src/workers/app.js) — client WaveSurfer.js logic (note: replaces `.wav` → `.m4a` for streaming)
- [src/workers/stem-descriptions.json](src/workers/stem-descriptions.json) — human-readable stem descriptions served as an asset
- [index.js](index.js) — NPM package entry (exports album metadata)

Important patterns & constraints
- Do not inline CSS/JS into HTML — use `/assets/*` (assets are fetched from `env.ASSETS`).
- Streaming vs download: keep `.wav` as canonical download URLs; client-side code converts to `.m4a` for playback (preserve this behavior).
- `cachedAssets` is used as a global in-memory cache for parsed asset JSON — reuse it to avoid repeated R2 reads.
- Track lists and metadata are maintained in the `TRACKS` constant in the worker; update this for new tracks.
- Cache durations: assets use long caching (1 year); pages use short caching (5 minutes). Preserve these headers unless you understand the impact.

Developer workflows (discoverable)
- Print manifesto / metadata: `npm run manifesto` and `npm run info` (see `package.json`).
- Adding a track (checked sequence):
  1. Add `N.TrackName/` directory under `src/` with README and artwork.
  2. Upload WAV and M4A to a new R2 bucket (bucket per track).
  3. Add stem descriptions to `src/workers/stem-descriptions.json`.
  4. Update `TRACKS` in [src/workers/everything-is-free-worker.js](src/workers/everything-is-free-worker.js).
  5. Add track metadata to `index.js` (NPM package) and bump `package.json` version if publishing.

Code-change guidance for AI assistants
- When changing routing or views, prefer small, local edits to `renderLayout`, `renderIndexPage`, or `renderTrackPage` in the worker.
- Preserve the M4A conversion in `src/workers/app.js` (the file contains the exact replacement used for streaming).
- Avoid adding new runtime dependencies; client code relies on WaveSurfer.js from unpkg.
- Keep error handling and input validation for bucket/filename lookups in place.

Examples to reference in edits
- M4A streaming: see `src/workers/app.js` where `.wav` → `.m4a` replacement occurs.
- Asset fetch + caching: refer to `fetchAssetSafely` / `cachedAssets` usage in the worker.
- Track metadata shape: look at `index.js` (tracks array with `streamUrl`, `wavUrl`, `stemsUrl`, artwork URLs).

If you are unsure
- Search these files first: [AGENTS.md](AGENTS.md), [CLAUDE.md](CLAUDE.md), [src/workers/everything-is-free-worker.js](src/workers/everything-is-free-worker.js), [src/workers/app.js](src/workers/app.js).
- Ask: which environment bindings (R2 bucket names) are available in the target deployment? Changes touching bindings require `wrangler.toml`/deploy coordination.

Do NOT
- Do not inline assets into HTML pages.
- Do not remove the WAV/M4A dual-format support.