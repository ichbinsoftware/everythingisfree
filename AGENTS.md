# AGENTS.md

## Project Context
**Everything is Free** is an open-source music album by Software-Entwicklungskit, released under the **CC0 1.0 Universal** license. The project serves raw audio stems to the public via a custom web interface powered by Cloudflare infrastructure.

## Architecture

### Infrastructure
- **Runtime**: Cloudflare Workers (Service Worker syntax).
- **Storage**: Cloudflare R2 Buckets.
  - **Track Buckets**: One bucket per track (e.g., `HYDROGEN`, `LITHIUM`) containing audio files.
  - **Assets Bucket**: Stores static resources (`style.css`, `app.js`, `stem-descriptions.json`).

### Core Components
1.  **Worker (`src/workers/everything-is-free-worker.js`)**:
    -   **Controller**: Handles routing for Home (`/`), Track pages (`/:track`), and Assets (`/assets/*`).
    -   **View**: Generates Server-Side Rendered (SSR) HTML.
    -   **Data**: Fetches file lists from R2 and metadata from JSON.

2.  **Client Logic (`src/workers/app.js`)**:
    -   Manages `WaveSurfer.js` instances for audio visualization.
    -   **Crucial**: Automatically swaps `.wav` file extensions for `.m4a` when streaming audio to save bandwidth, while keeping download links as `.wav`.

3.  **Data (`src/workers/stem-descriptions.json`)**:
    -   A JSON map linking filenames (e.g., `1.Hydrogen_Stem_KICK.wav`) to human-readable descriptions.
    -   Loaded and cached by the Worker.

4.  **NPM Package (`@ichbinsoftware/everything-is-free`)**:
    -   Provides programmatic access to album metadata (BPM, keys, URLs).
    -   Exports the manifesto and license info.
    -   Entry point: `index.js`.

## Conventions & Patterns

### Audio Files
-   **WAV**: The canonical source. High-quality, uncompressed. Used for **Downloads**.
-   **M4A**: Compressed mirror of every WAV file. Used for **Streaming/Playback**.
-   **Naming**: `[Track#].[Element]_Stem_[Instrument].wav` (e.g., `1.Hydrogen_Stem_KICK.wav`).

### Worker Patterns
-   **Asset Serving**: Do not inline CSS or JS. Serve them via the `/assets/` route which fetches from the `ASSETS` R2 binding.
-   **Caching**:
    -   `cachedAssets`: Global variable used to cache parsed JSON data (hot start optimization).
    -   `Cache-Control`: Long cache (1 year) for assets, short cache (5 mins) for HTML pages.

### Development Guidelines
1.  **Adding Tracks**:
    -   Update `TRACKS` constant in the worker.
    -   Add stem descriptions to `stem-descriptions.json`.
    -   Ensure R2 bucket is bound in `wrangler.toml` (if applicable).
    -   Update `index.js` for the NPM package.
2.  **Modifying UI**:
    -   Edit `renderLayout`, `renderIndexPage`, or `renderTrackPage` in the worker for HTML structure.
    -   Edit `style.css` for visual changes.

## Philosophy & License
-   **Manifesto**: "Everything is Free". No scarcity, no control. Music as public infrastructure.
-   **License**: **CC0 1.0 Universal**. No copyright, no attribution required.