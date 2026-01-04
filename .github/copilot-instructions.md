# Copilot instructions — Everything is Free

Purpose
- Help AI coding agents become immediately productive in this repo by summarizing architecture, conventions, and concrete examples.

Big picture
- Runtime: Cloudflare Workers serving an SSR web UI and listing audio files from Cloudflare R2 buckets.
- Storage: One R2 bucket per track (e.g., `hydrogen`, `lithium`); assets live in the `ASSETS` R2 binding.
- Playback vs download: WAV files are canonical (downloads). The web UI streams compressed M4A mirrors for playback.

Key files & where to look
- Worker (controller + view + data): `src/workers/everything-is-free-worker.js` — routing, R2 listing, HTML render helpers.
- Client: `src/workers/app.js` — WaveSurfer player logic; shows the `.wav -> .m4a` swap for streaming.
- Asset metadata: `src/workers/stem-descriptions.json` — maps filenames to human-readable descriptions used on track pages.
- Package entry / developer scripts: `package.json` (scripts: `manifesto`, `info`).

Critical patterns and examples (do this, not that)
- Streaming vs download: Use `streamUrl` (M4A) for playback and `wavUrl` for downloads. The client replaces `.wav` with `.m4a` when constructing the audio URL (see `src/workers/app.js`).
- Asset fetching: The Worker reads `ASSETS` via `env.ASSETS.get(...)` and caches parsed JSON in a global `cachedAssets` variable for hot starts (see `cachedAssets` usage in the worker).
- Route responsibilities: `/assets/*` serves CSS/JS from ASSETS; `/` renders index; `/:track` lists WAVs in R2; `/:track/:file` returns R2 object body for download.
- No inlined CSS/JS: Assets must be served through the `/assets/` route (do not inline into HTML).

Dev workflows & commands
- Inspect metadata locally: `npm run info` — prints album/tracks.
- Print manifesto: `npm run manifesto`.
- Adding a track: update the `TRACKS` array in `src/workers/everything-is-free-worker.js`, add stems to `stem-descriptions.json`, and ensure the corresponding R2 bucket is bound in your Cloudflare worker config (e.g., `wrangler.toml` bindings).
- Deploy: standard Cloudflare Workers workflow (bind R2 buckets and `ASSETS` in your dev/prod `wrangler.toml`, then `wrangler publish`).

Project-specific conventions
- Filenames: `[Track#].[Element]_Stem_[Instrument].wav` (e.g., `1.Hydrogen_Stem_KICK.wav`) — used as keys in `stem-descriptions.json`.
- Cache strategy: long cache (1 year) for static assets; short cache (~5 minutes) for HTML track pages (see `CACHE_MAX_AGE` and `SHORT_CACHE` constants).
- Track metadata source: `TRACKS` constant in the worker is the ground truth for the web UI.

Integration points & external deps
- Cloudflare R2 buckets (per-track bindings) and `ASSETS` R2 binding.
- WaveSurfer (loaded via unpkg in rendered pages) for client waveform visualization.
- NPM package export (`index.js`) exposes album metadata for programmatic use.

When editing
- Update `stem-descriptions.json` when renaming or adding stem files.
- Keep `.wav` filenames as-is for downloads; add corresponding `.m4a` mirrors for streaming where applicable.
- When changing HTML structure, edit `renderLayout`, `renderIndexPage`, or `renderTrackPage` in the worker — these are the single source of SSR HTML.

What this file does NOT cover
- CI, tests, or lint rules — there are no repository tests. Avoid inventing test conventions not present in the codebase.

