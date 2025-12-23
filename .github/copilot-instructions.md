## Copilot / AI agent instructions for this repo

This project is an audio album repository ("Everything is Free") that keeps large, canonical audio files in Cloudflare R2 and smaller streaming files for the web UI. Use these notes to be productive quickly — they focus on repository-specific patterns, integration points, and where to make changes.

- **Repo purpose:** exports album metadata and powers a Cloudflare Worker UI. Key code: [index.js](index.js) and the worker at [src/workers/r2-bucket-lister.js](src/workers/r2-bucket-lister.js).
- **High-level architecture:** static repo for metadata + Cloudflare R2 buckets for large media. The Worker lists buckets and streams M4A files for playback while offering WAV downloads.

Key conventions and patterns
- **Tracks layout:** each track lives under `src/` with a numeric prefix (e.g. `src/1.Hydrogen/`). See the repository README and track READMEs for examples: [README.md](README.md) and `src/*/README.md`.
- **Filenames:** stems and masters follow `[N].[Element]_...` naming. WAV is canonical; M4A mirrors WAV names but with `.m4a` for streaming.
- **Worker responsibilities:** `src/workers/r2-bucket-lister.js` generates the web UI, maps environment bindings to R2 buckets, maintains a `stemDescriptions` mapping (keep it in-file), and replaces `.wav` with `.m4a` for the WaveSurfer player.
- **Where to add tracks:** update `TRACKS` in `src/workers/r2-bucket-lister.js`, add the track folder under `src/`, and add the track object to the `tracks` array exported by [index.js](index.js).

Developer workflows and commands
- **NPM scripts:** the package has small helper scripts. Useful ones (documented in the repo): `npm run manifesto` and `npm run info` — check `package.json` for exact commands.
- **Publishing:** bump `version` in `package.json` and run `npm publish` when updating `index.js` track metadata.

Integration points and places to edit
- **Streaming vs download:** The Worker serves M4A to the player and WAV for downloads. If changing audio URL logic, update the `.wav -> .m4a` replacement in `src/workers/r2-bucket-lister.js` and test the web UI.
- **R2 bindings:** bucket bindings are provided via environment variables to the Worker. Adding a new track requires adding the binding and `TRACKS` entry.
- **Stem descriptions:** `stemDescriptions` inside `src/workers/r2-bucket-lister.js` is authoritative — do not externalize it.

Repository-specific caveats (do not guess or change these without verification)
- Do not commit large WAV files to git — they are stored in R2 buckets. Local M4A files may appear in track folders but are optional.
- Keep the UI structure (header/main/footer) intact when editing the Worker — front-end relies on predictable structure and WaveSurfer integration.

Examples (where to change things)
- Add a track: create `src/8.YourTrack/` → add artwork + README → add R2 bucket + env binding → add `TRACKS` entry in [src/workers/r2-bucket-lister.js](src/workers/r2-bucket-lister.js) → add metadata entry in [index.js](index.js) → bump `package.json` version.
- Fix playback URL: edit the `.wav` → `.m4a` substitution in `src/workers/r2-bucket-lister.js` (player code) and validate playback on `https://ev3.ichbinsoftware.com` or worker preview.

References
- CLAUDE guidance: [CLAUDE.md](CLAUDE.md) (contains additional project notes and exact audio specs).
- Worker: [src/workers/r2-bucket-lister.js](src/workers/r2-bucket-lister.js)
- Package exports and metadata: [index.js](index.js)
- Root docs: [README.md](README.md)

**Manifesto (context & usage)**

- The album manifesto is authoritative project text and appears both in `MANIFESTO.md` and embedded in `index.js` as `manifesto`.
- Short excerpt (copy-paste safe):

> EVERYTHING IS FREE

> This work is not a product. It is not content. It is not owned.

> Everything here is released without restriction. You may: copy it, remix it, destroy it, commercialise it, repackage it, ignore it.

- Usage notes for agents:
	- When updating `index.js`, keep the `manifesto` string intact or intentionally update both `MANIFESTO.md` and the `manifesto` field in `index.js` to keep them in sync.
	- Use `npm run manifesto` to print the manifesto locally for verification.
	- Do not alter manifesto wording without explicit intent — it's a core project declaration and used in package exports and docs.

**Examples & command snippets**

- Print the album manifesto (local):

```bash
npm run manifesto
```

- Show package metadata (local):

```bash
npm run info
```

- Add a new track (manual steps):
	1. Create track folder and add artwork + README:

```bash
mkdir -p src/8.YourTrack/artwork
# add PNG artwork files and a README.md inside src/8.YourTrack
```

	2. Upload WAV and M4A stems to a new Cloudflare R2 bucket and add a binding/environment variable to the Worker deployment.

	3. Add a `TRACKS` entry in [src/workers/r2-bucket-lister.js](src/workers/r2-bucket-lister.js). Example track object (use as a template):

```javascript
{
	title: "Oganesson",
	bpm: 120,
	key: "C Major",
	repoSource: "https://github.com/ichbinsoftware/everythingisfree/tree/main/src/8.Oganesson",
	webUrl: "https://ev3.ichbinsoftware.com/oganesson",
	streamUrl: "https://oganesson.ichbinsoftware.com/8.Oganesson_Master.m4a",
	wavUrl: "https://oganesson.ichbinsoftware.com/8.Oganesson_Master.wav",
	stemsUrl: "https://oganesson.ichbinsoftware.com/8.Oganesson_STEMS.zip"
}
```

	4. Add the same metadata object to the `tracks` array exported by [index.js](index.js).

	5. Bump `version` in `package.json` and publish if releasing the package:

```bash
# update version in package.json
npm publish
```

- Example: change player URL from WAV to M4A (worker uses this pattern):

```javascript
const audioUrl = fileName.endsWith('.wav') ? fileUrl.replace(/\.wav$/, '.m4a') : fileUrl;
```

- `stemDescriptions` lives in [src/workers/r2-bucket-lister.js](src/workers/r2-bucket-lister.js). Example entry:

```javascript
const stemDescriptions = {
	"1.Hydrogen_Kick.wav": "Kick drum (dry)",
	"1.Hydrogen_Bass.wav": "Electric bass"
};
```

- Previewing the Worker: use the Cloudflare dashboard Worker preview, or `wrangler` if you have it configured locally (only if your environment is set up):

```bash
# (optional) with Wrangler installed and configured
wrangler login
wrangler dev --local
```
 
**Technical details (exact, copy-paste friendly)**

- Worker routes:
	- `GET /` → index page with `TRACKS` listing
	- `GET /:bucket` → list WAV files in the bucket and render track page
	- `GET /:bucket/:filename` → stream/download the raw object from R2

- Environment bindings: Cloudflare Worker expects bucket bindings named in UPPERCASE (e.g. `HYDROGEN`, `LITHIUM`) that map to the `:bucket` path segment.

- `index.js` track object fields (use these when adding to `tracks`):
	- `title`, `number`, `symbol`, `color`, `bpm`, `key`, `repoSource`, `webUrl`, `streamUrl`, `wavUrl`, `stemsUrl`, `gradientImageUrl`, `symbolImageUrl`, `textImageUrl`

- Worker internals to be careful with:
	- `TRACKS`, `TRACK_MAP`, and `VALID_BUCKETS` are used to validate routes and build pages.
	- `stemDescriptions` lives in the worker source and maps exact WAV filenames to human-readable descriptions.
	- The player uses the pattern: serve/list `.wav` files but load the `.m4a` equivalent for WaveSurfer (`file.key.replace(/\.wav$/i, '.m4a')`).

**Quick checklist for adding a track (PR-ready)**

1. Add `src/N.TrackName/` with `README.md` and `artwork/` PNGs.
2. Upload WAV + M4A to a new R2 bucket and add a Cloudflare binding named `TRACKID` (uppercase, e.g. `OGANESSON`).
3. Add an entry to `TRACKS` in `src/workers/r2-bucket-lister.js` (id must match the binding name lowercased).
4. Add the same metadata object to the `tracks` array in `index.js` (fill all fields listed above).
5. Update `stemDescriptions` in the worker if you want custom labels for stems.
6. Bump `version` in `package.json` and `npm publish` if releasing.
