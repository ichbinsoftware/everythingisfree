# AGENTS.md

This file provides guidance to AI coding agents (Claude Code, Copilot, Cursor, Codex, etc.) when working with code in this repository.

## Project Overview

This repository contains the "Everything is Free" music album by Software-Entwicklungskit. The project is organized as a collection of audio tracks named after alkali metals (Group 1 elements of the periodic table), each with associated artwork and individual audio stems.

## Repository Structure

```
ev3/
├── src/
│   ├── 1.Hydrogen/
│   │   ├── README.md
│   │   └── artwork/  (Track-specific artwork with dimensions in filenames)
│   ├── 2.Lithium/
│   ├── 3.Sodium/
│   ├── 4.Potassium/
│   ├── 5.Rubidium/
│   ├── 6.Caesium/
│   ├── 7.Francium/
│   ├── workers/
│   │   ├── everything-is-free-worker.js  (Main Cloudflare Worker)
│   │   ├── app.js  (Client-side WaveSurfer.js player logic)
│   │   ├── style.css  (Stylesheet)
│   │   └── stem-descriptions.json  (Stem descriptions data)
│   ├── artwork/  (Album-level artwork - main cover and beadwork)
│   └── images/  (Example screenshots and preview images)
├── .npmignore  (Excludes large audio/media files from npm package)
├── package.json  (NPM package configuration)
├── index.js  (NPM package entry point - exports album data)
├── MANIFESTO.md  (Album manifesto - philosophy and principles)
└── README.md  (Main album documentation)
```

Each track directory contains:
- `README.md` - Comprehensive documentation of available audio stems (individual track components in WAV format)
- `artwork/` subdirectory with PNG files (with dimensions in filenames):
  - `[Element]-Symbol-1000x1000.png` - Element symbol artwork (1000x1000)
  - `[Element]-Text.png` - Text-based artwork
  - `[Element].png` - Main gradient artwork
- M4A audio files (compressed versions for web playback, if present locally)

The main `src/artwork/` directory contains album-level artwork:
- `Cover-Square-750x750.png` - Main album artwork (750x750)
- `Small-Square-550x550.png` - Beadwork artwork (550x550)

**Note:** Audio stems (WAV and M4A files, ~1-3.4 GB per track for WAV) are hosted in Cloudflare R2 buckets and accessible via a web interface powered by Cloudflare Workers. M4A files provide compressed versions of each stem for efficient web streaming.

## Important Notes

### File Naming Conventions
- Track directories use numbered prefixes (1-7) followed by element names
- Audio stem files follow pattern: `[#].[Element]_Stem_[DESCRIPTION].wav` or `.m4a`
- Master files: `[#].[Element]_Master.wav` or `.m4a`
- Track numbers are zero-padded in filenames (e.g., `7.Francium_Master.wav`)
- M4A files use identical naming as WAV files, only the extension differs

### Audio Specifications

**Audio Stems:**
Both WAV and M4A formats are available in R2 buckets:

**WAV files (for download):**
- Format: WAV (Waveform Audio File Format)
- Bit Depth: 24-bit (Uncompressed)
- Sample rate: 44.1 kHz
- File Size: ~85-95 MB per stem
- Total per track: 13-39 stems (~1.1-3.4 GB per track)

**M4A files (for web playback):**
- Format: M4A (MPEG-4 Audio)
- Used by the web interface audio player and Track README "Play" links
- Significantly smaller file size than WAV for faster streaming
- Same filename pattern as WAV but with `.m4a` extension
- Present in both R2 buckets and optionally in local track directories

**Track Metadata:**
- Hydrogen: 132 BPM, D Major, 5:19, 12 stems (13 total files including master)
- Lithium: 124 BPM, G minor, 5:33, 38 stems (39 total files including master)
- Sodium: 140 BPM, G minor, 5:09, 28 stems (29 total files including master)
- Potassium: 90 BPM, C Major, 5:16, 19 stems (20 total files including master)
- Rubidium: 132 BPM, G Major, 4:41, 9 stems (10 total files including master)
- Caesium: 130 BPM, C Major, 3:50, 16 stems (17 total files including master)
- Francium: 128 BPM, B flat, 4:59, 26 stems (27 total files including master)

**Important:** Stem counts exclude the master track. The master track is counted separately in total file counts.

### Cloudflare Infrastructure

**R2 Buckets:**
Audio stems are hosted in Cloudflare R2 (S3-compatible object storage):
- Separate bucket per track (HYDROGEN, LITHIUM, SODIUM, POTASSIUM, RUBIDIUM, CAESIUM, FRANCIUM)
- Each bucket contains both WAV and M4A versions of all stems
- WAV files are too large for Git (~1-3.4 GB per track)
- M4A files are used for web player streaming
- Files accessible via custom domain URLs (e.g., `https://hydrogen.ichbinsoftware.com/`)

**Cloudflare Workers:**
The web interface is powered by a refactored multi-file worker architecture in `src/workers/`:
- `everything-is-free-worker.js` - Main worker with routing, HTML generation, and R2 integration
- `app.js` - Client-side JavaScript for WaveSurfer.js audio player
- `style.css` - GitHub-style CSS for all pages
- `stem-descriptions.json` - Stem metadata (157 entries mapping filenames to descriptions)

**Worker Capabilities:**
- Serves index page listing all tracks
- Generates track-specific pages with audio stem listings
- Streams static assets (CSS, JS, JSON) from R2 ASSETS bucket
- Streams audio files and assets directly from track-specific R2 buckets
- Environment variables map track names to R2 bucket bindings

**Key Features:**
- Interactive waveform visualization for each stem (loads M4A files for faster streaming)
- Direct download links for individual stems and ZIP archives (WAV format)
- Responsive design for mobile and desktop
- Metadata display (BPM, key, length, stems count)
- Dual-format support: M4A for playback, WAV for downloads
- Stems column displays count of audio stems (excluding master track)

### M4A File Usage Throughout Project

M4A files are integrated throughout the project for efficient web streaming:

**Track READMEs:**
- Track Information table "Play" link → M4A master file (e.g., `1.Hydrogen_Master.m4a`)
- Download links → WAV files via web interface and ZIP archives

**Cloudflare Worker (`everything-is-free-worker.js` + `app.js`):**
- WaveSurfer.js audio player → Loads M4A files automatically
- Implementation: `app.js` line 49 replaces `.wav` with `.m4a` extension in audio URL
- Download links → Serve WAV files (uncompressed, production-quality)
- Bucket listings → Show only WAV files, but M4A equivalents exist for all stems

**R2 Buckets:**
- Each bucket contains complete dual-format library
- For every `*.wav` file, there's a corresponding `*.m4a` file
- M4A files reduce bandwidth and improve streaming performance
- WAV files remain canonical format for professional use

### License
This project is released under **Creative Commons Zero v1.0 Universal (CC0 1.0)** — public domain dedication with no restrictions.

### Manifesto

The album manifesto is a core declaration of the project's philosophy: **"Everything is Free"**. This is not just a title—it's a fundamental principle that defines how this work exists in the world.

**Core Philosophy:**
- This work is released without any restrictions whatsoever
- No attribution required, no permission needed, no licenses to navigate
- Released under CC0 1.0 Universal—complete public domain dedication
- Music should circulate freely like public infrastructure, not locked behind platforms or licenses

**Key Principles from the Manifesto:**
> "This work is not a product. It is not content. It is not owned."

> "You may: copy it, remix it, destroy it, commercialise it, repackage it, ignore it."

> "Music should circulate like electricity."

> "If something meaningful comes from this, it will not be because it was protected. It will be because it was free."

**File Locations:**
- `MANIFESTO.md` - Standalone markdown file containing the full manifesto text
- `index.js` - Embedded as the `manifesto` property (multi-line string using template literals)

**Context for AI Assistants:**
When working with this codebase, understand that the "everything is free" philosophy extends to the code itself. The refusal of scarcity, control, and platform-locked distribution is central to all technical decisions. Features should support open access, easy downloading, and frictionless sharing—never paywalls, DRM, or artificial restrictions.

### NPM Package

This project is published as an npm package: **`@ichbinsoftware/everything-is-free`**

**Package Purpose:**
- Provides programmatic access to album metadata and track information
- Enables developers to integrate track data into applications, websites, and tools
- Exports album manifesto, track metadata (BPM, key, URLs), and license information

**Key Files:**
- `package.json` - NPM package configuration with scripts and metadata
- `index.js` - Main export file containing album data structure
- `.npmignore` - Excludes large files (audio stems, artwork) from npm package

**Exported Data Structure:**
```javascript
{
  artist: "Software-Entwicklungskit",
  album: "Everything is Free",
  released: "Release date string",
  albumPage: "https://software-entwicklungskit.bandcamp.com/album/everything-is-free",
  homePage: "https://ev3.ichbinsoftware.com",
  license: "CC0 1.0 Universal (CC0 1.0) Public Domain Dedication",
  manifesto: "...",  // Full manifesto text (multi-line string)
  tracks: [
    {
      title: "Hydrogen",
      number: 1,
      symbol: "H",
      color: "#25daf0",
      bpm: 132,
      key: "D Major",
      repoSource: "https://github.com/ichbinsoftware/everythingisfree/tree/main/src/1.Hydrogen",
      webUrl: "https://ev3.ichbinsoftware.com/hydrogen",
      streamUrl: "https://hydrogen.ichbinsoftware.com/1.Hydrogen_Master.m4a",
      wavUrl: "https://hydrogen.ichbinsoftware.com/1.Hydrogen_Master.wav",
      stemsUrl: "https://hydrogen.ichbinsoftware.com/1.Hydrogen_STEMS.zip",
      gradientImageUrl: "https://hydrogen.ichbinsoftware.com/Hydrogen.png",
      symbolImageUrl: "https://hydrogen.ichbinsoftware.com/Hydrogen-Symbol.png",
      textImageUrl: "https://hydrogen.ichbinsoftware.com/Hydrogen-Text.png",
      lyrics: "...",  // Optional - Song lyrics (String)
      stems: [
        {
          name: "1.Hydrogen_Stem_BEEPS",
          description: "Beeps/electronic sounds",
          streamUrl: "https://hydrogen.ichbinsoftware.com/1.Hydrogen_Stem_BEEPS.m4a",
          wavUrl: "https://hydrogen.ichbinsoftware.com/1.Hydrogen_Stem_BEEPS.wav"
        },
        // ... all stems for this track
      ]
    },
    // ... all 7 tracks
  ]
}
```

**Package Exports (Top-Level Properties):**
- `artist` (String) - Artist name
- `album` (String) - Album title
- `released` (String) - Release date
- `albumPage` (String) - Bandcamp URL
- `homePage` (String) - Web interface URL
- `license` (String) - License information
- `manifesto` (String) - Full manifesto text
- `tracks` (Array) - Array of track objects

**Track Object Properties:**
- `title`, `number`, `symbol`, `color` - Basic metadata
- `bpm`, `key` - Musical properties
- `repoSource` (String) - GitHub URL to track directory
- `webUrl` (String) - Web interface URL for track
- `streamUrl` (String) - M4A master file URL for streaming
- `wavUrl` (String) - WAV master file URL for download
- `stemsUrl` (String) - ZIP archive URL with all stems
- `gradientImageUrl`, `symbolImageUrl`, `textImageUrl` - Artwork URLs
- `lyrics` (String, optional) - Song lyrics
- `stems` (Array) - Array of stem objects

**Stem Object Properties:**
- `name` (String) - Stem filename without extension
- `description` (String) - Human-readable description
- `streamUrl` (String) - M4A file URL for streaming
- `wavUrl` (String) - WAV file URL for download

**NPM Scripts:**
- `npm run manifesto` - Print the album manifesto
- `npm run info` - Display album metadata (artist, album, homepage, license)

**Usage Examples:**

**Basic Usage:**
```javascript
const ev3 = require('@ichbinsoftware/everything-is-free');

// Access album metadata
console.log(`${ev3.album} by ${ev3.artist}`);
console.log(`Released: ${ev3.released}`);
console.log(`License: ${ev3.license}`);
console.log(`Homepage: ${ev3.homePage}`);

// Print manifesto
console.log(ev3.manifesto);

// Access track information
const hydrogen = ev3.tracks[0];
console.log(`${hydrogen.title} - ${hydrogen.bpm} BPM in ${hydrogen.key}`);
console.log(`Symbol: ${hydrogen.symbol} | Color: ${hydrogen.color}`);
console.log(`Stems: ${hydrogen.stems.length}`);
```

**Working with Stems:**
```javascript
const lithium = ev3.tracks[1]; // Lithium (2nd track)
console.log(`\n${lithium.title} has ${lithium.stems.length} stems:\n`);

// List all stems with descriptions
lithium.stems.forEach((stem, index) => {
  console.log(`${index + 1}. ${stem.name}`);
  console.log(`   Description: ${stem.description}`);
  console.log(`   Stream (M4A): ${stem.streamUrl}`);
  console.log(`   Download (WAV): ${stem.wavUrl}\n`);
});

// Find specific stems by keyword
const drumStems = lithium.stems.filter(s =>
  s.description.toLowerCase().includes('drum')
);
console.log(`Found ${drumStems.length} drum stems`);

// Download stems programmatically
lithium.stems.forEach(stem => {
  // Use stem.wavUrl for production-quality WAV files (24-bit, 44.1kHz)
  // Use stem.streamUrl for compressed M4A files (faster streaming)
  console.log(`Downloading: ${stem.wavUrl}`);
});
```

**Audio Playback Example (Browser):**
```html
<script type="module">
  import ev3 from 'https://unpkg.com/@ichbinsoftware/everything-is-free';

  const track = ev3.tracks[0];
  console.log(`Now Playing: ${track.title} (${track.bpm} BPM)`);

  // Play master track (M4A)
  const audio = new Audio(track.streamUrl);
  audio.play();

  // Play individual stems
  const voxLead = track.stems.find(s => s.name.includes('VOX LEAD'));
  const stemAudio = new Audio(voxLead.streamUrl);
  stemAudio.play();
</script>
```

**NPM Package Exclusions (.npmignore):**
The npm package intentionally excludes large files and development documentation to keep the package lightweight (metadata only):
- `AGENTS.md` - AI coding agent documentation (development use only)
- `src/` - Track directories with large audio files
- `artwork/` - Large PNG artwork files
- `videos/` - Video files
- `*.wav`, `*.m4a`, `*.mp3` - All audio formats
- `*.zip` - ZIP archives
- `*.png` - PNG images
- `.git`, `.DS_Store` - System files

This ensures the published package contains only `index.js`, `package.json`, `README.md`, and `MANIFESTO.md` - providing programmatic access to metadata without bloating the package with large media files or development documentation.

## Working with This Repository

### Adding New Tracks

When adding new tracks:
1. **Create directory**: Follow the numbered pattern (e.g., `8.Oganesson/`)
2. **Add artwork**: Include all three PNG variants in `artwork/` subdirectory
3. **Create README**: Document all audio stems with descriptions
4. **Upload stems**: Upload both WAV and M4A files to new R2 bucket
   - WAV files for downloads
   - M4A files for web player streaming (same filename, different extension)
5. **Update worker**: Add track metadata to `TRACKS` constant in `everything-is-free-worker.js`
6. **Add stem descriptions**: Update `stem-descriptions.json` with new stem entries
7. **Update NPM package**: Add new track to `tracks` array in `index.js` with all properties:
   ```javascript
   {
     title: "TrackName",
     number: 8,
     symbol: "Og",
     color: "#hexcode",
     bpm: 000,
     key: "X Major/Minor",
     repoSource: "https://github.com/ichbinsoftware/everythingisfree/tree/main/src/#.TrackName",
     webUrl: "https://ev3.ichbinsoftware.com/trackname",
     streamUrl: "https://trackname.ichbinsoftware.com/#.TrackName_Master.m4a",
     wavUrl: "https://trackname.ichbinsoftware.com/#.TrackName_Master.wav",
     stemsUrl: "https://trackname.ichbinsoftware.com/#.TrackName_STEMS.zip",
     gradientImageUrl: "https://trackname.ichbinsoftware.com/TrackName.png",
     symbolImageUrl: "https://trackname.ichbinsoftware.com/TrackName-Symbol.png",
     textImageUrl: "https://trackname.ichbinsoftware.com/TrackName-Text.png",
     lyrics: "...",  // Optional - Add if track has lyrics
     stems: [
       {
         name: "#.TrackName_Stem_DESCRIPTION",
         description: "Human-readable description",
         streamUrl: "https://trackname.ichbinsoftware.com/#.TrackName_Stem_DESCRIPTION.m4a",
         wavUrl: "https://trackname.ichbinsoftware.com/#.TrackName_Stem_DESCRIPTION.wav"
       },
       // ... repeat for each stem
     ]
   }
   ```
   **Important**:
   - Use double quotes for all string property values (not single quotes)
   - Include all stems in the `stems` array with their descriptions
   - Match stem descriptions from `stem-descriptions.json`
   - Add `lyrics` property if the track has lyrics (optional)
8. **Bump version**: Update `version` in `package.json` following semantic versioning
9. **Publish**: Run `npm publish` to publish the updated package

### Track README Documentation

Each track's README follows a consistent format:
- Badges showing license, BPM, key, and format
- Track information table with audio link (M4A format for streaming playback)
  - Columns: Track, BPM, Key, Stems, Audio
  - Stems column shows count of audio stems (excluding master track)
- Audio contents section with download links:
  - "All uncompressed stems + Master" - links to web player interface
  - "All uncompressed stems + Master (ZIP)" - direct ZIP download
- Detailed stem listing table with file sizes and descriptions (WAV files)
- Technical specifications
- Stem categories (organized by type: vocals, drums, bass, synths, FX)
- Usage instructions (sync, tempo, DAW import) - uses 🎯 emoji
- Lyrics (if applicable)
- Artwork images
- License information
- Credits
- ASCII art footer

**Important README Details:**
- Main README tracks table includes Symbol column with 50x50 embedded images
- Track Information table includes Stems column (count excludes master track)
- Track Information "Play" link uses M4A file for faster streaming
- Download links emphasize "uncompressed" to clarify WAV format
- Stem listings document WAV files (production-quality format)
- M4A files mirror WAV filenames with `.m4a` extension
- Credits include Instagram links for contributors (@ichbinsoftware, @beadhammer)

### Cloudflare Worker Code Structure

The worker has been refactored into a clean, modular architecture:

#### **1. everything-is-free-worker.js** (Main Worker)

**Constants:**
- `TRACKS` - Array of track metadata objects (id, name, number, bpm, key, stems, length, color)
  - `stems` property contains count of audio stems excluding master track
- `TRACK_MAP` - Quick lookup object derived from TRACKS array
- `VALID_BUCKETS` - Set of valid bucket identifiers
- `CACHE_MAX_AGE` - Cache duration for static assets (1 year)
- `SHORT_CACHE` - Cache duration for dynamic pages (5 minutes)
- `cachedAssets` - Global in-memory cache for parsed JSON assets

**Routing Logic:**
1. **Route 0: Assets** (`/assets/style.css`, `/assets/app.js`)
   - Fetches from `env.ASSETS` R2 bucket
   - Serves with long cache headers (1 year)
2. **Route 1: Home Page** (`/`)
   - Renders index page with all tracks
3. **Route 2: File Download** (`/{bucket}/{filename}`)
   - Streams individual files from track-specific R2 buckets
   - Validates bucket name and handles errors
4. **Route 3: Track Page** (`/{bucket}`)
   - Lists bucket contents (WAV files only)
   - Renders track-specific page with audio player
   - Loads stem descriptions from `stem-descriptions.json` asset

**View Layer Functions:**
- `renderLayout({ title, meta, content })` - Shared HTML layout wrapper
- `renderIndexPage()` - Generates home page with track table
- `renderTrackPage(bucketName, files, stemDescriptions)` - Generates track page with WaveSurfer.js player

**Helper Functions:**
- `formatBytes(sizeInBytes)` - Converts bytes to human-readable format (decimal units)
- `fetchAssetSafely(env, filename)` - Safely fetches assets from R2 ASSETS bucket

#### **2. app.js** (Client-Side JavaScript)

**Purpose:** WaveSurfer.js audio player initialization and control

**Key Features:**
- Initializes WaveSurfer.js instances on-demand (not page load)
- Replaces `.wav` with `.m4a` in audio URLs for streaming (line 49)
- Handles play/pause, time display, and waveform visualization
- Auto-pauses other players when one starts playing
- Uses track-specific colors for waveforms

**Event Flow:**
1. User clicks "Load Player" button
2. Creates WaveSurfer instance with track color
3. Loads M4A file for visualization
4. Displays play/pause controls and time indicator

#### **3. style.css** (Stylesheet)

**Design System:**
- GitHub-inspired design with clean typography
- Responsive tables and images
- Mobile-first approach with media queries
- Consistent color palette (#24292f for text, #0969da for links, #d0d7de for borders)

**Key Components:**
- `.site-header` - Dark header with album title
- `.track-summary` - Track metadata table with album art
- `.file` - Individual stem card with waveform placeholder
- `.waveform` - Hidden by default, shown after loading
- `.footer` - Centered links to streaming platforms

#### **4. stem-descriptions.json** (Data File)

**Structure:** JSON object with 157 entries mapping filenames to descriptions

**Format:**
```json
{
  "1.Hydrogen_Master.wav": "Full mix master track",
  "1.Hydrogen_Stem_BEEPS.wav": "Beeps/electronic sounds",
  ...
}
```

**Usage:**
- Loaded from R2 ASSETS bucket on first track page request
- Cached globally in worker memory for subsequent requests
- Displayed as italicized descriptions next to stem filenames

#### **Important Implementation Details:**
- All stems sync to Bar 1 for easy DAW alignment
- File sizes use decimal units (1 MB = 1,000,000 bytes) per R2 standard
- WaveSurfer.js loads on-demand to avoid performance issues
- **Audio player uses M4A files** (`.wav` extension replaced with `.m4a` in `app.js`)
- **Download links use WAV files** (original high-quality format)
- **Stems column** displays in both index page (after Key) and track pages (after Length)
- **Stems count excludes master track** - shows only individual audio stems
- Bucket names are lowercase in code but display capitalized
- Each track has a dedicated R2 bucket bound via environment variables
- Static assets (CSS, JS, JSON) served from separate `env.ASSETS` bucket

### Code Style & Best Practices

When modifying the worker files:

#### **everything-is-free-worker.js**

**Do:**
- Keep routing logic clean and well-commented
- Maintain consistent error handling with try-catch blocks
- Use the shared `renderLayout()` function for all pages
- Cache parsed JSON assets in `cachedAssets` global variable
- Add new routes following the existing pattern (assets → home → file → bucket)
- Validate all user inputs (bucket names, filenames)

**Don't:**
- Inline CSS or JavaScript (use `/assets/` routes instead)
- Modify cache durations without consideration
- Remove error handling or fallback logic
- Change the fundamental page structure (header, main content, footer)

#### **app.js**

**Do:**
- Keep WaveSurfer.js initialization logic modular
- Use track colors from `TRACK_DATA` configuration
- Handle edge cases (WaveSurfer not loaded, network errors)
- Auto-pause other players when starting a new one

**Don't:**
- Add additional dependencies beyond WaveSurfer.js from unpkg
- Remove the M4A conversion logic (line 49)
- Break the on-demand loading pattern

#### **style.css**

**Do:**
- Maintain GitHub-style design system
- Use responsive design with mobile-first approach
- Keep consistent color palette (#24292f, #0969da, #d0d7de)
- Test on both desktop and mobile viewports

**Don't:**
- Remove responsive media queries
- Change core layout structure
- Add heavy CSS frameworks

#### **stem-descriptions.json**

**Do:**
- Keep descriptions concise and descriptive
- Follow the existing naming pattern: `"X.TrackName_Stem_NAME.wav": "Description"`
- Include all master tracks with "Full mix master track" description
- Alphabetize or organize by track number

**Don't:**
- Remove existing entries
- Use inconsistent description formats
- Include special characters that break JSON syntax

**General Conventions:**
- Footer links should be centered and wrap on mobile
- Tables should have responsive padding and font sizes
- Images should scale properly without distortion
- Use `width: 100%; height: auto;` for responsive images
- Include ARIA labels for accessibility
