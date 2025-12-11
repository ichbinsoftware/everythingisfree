# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This repository contains the "Everything is Free" music album by Software-Entwicklungskit. The project is organized as a collection of audio tracks named after alkali metals (Group 1 elements of the periodic table), each with associated artwork and individual audio stems.

## Repository Structure

```
ev3/
├── src/
│   ├── 1.Hydrogen/
│   │   ├── README.md
│   │   └── artwork/
│   ├── 2.Lithium/
│   ├── 3.Sodium/
│   ├── 4.Potassium/
│   ├── 5.Rubidium/
│   ├── 6.Caesium/
│   ├── 7.Francium/
│   ├── workers/
│   │   └── r2-bucket-lister.js  (Cloudflare Worker for web interface)
│   └── artwork/  (Album-level artwork)
└── README.md  (Main album documentation)
```

Each track directory contains:
- `README.md` - Comprehensive documentation of available audio stems (individual track components in WAV format)
- `artwork/` subdirectory with three PNG files:
  - `[Element]-Symbol.png` - Element symbol artwork
  - `[Element]-Text.png` - Text-based artwork
  - `[Element].png` - Main artwork

**Note:** Audio stems (WAV files, ~1-3.4 GB per track) are hosted in Cloudflare R2 buckets and accessible via a web interface powered by Cloudflare Workers.

## Important Notes

### File Naming Conventions
- Track directories use numbered prefixes (1-7) followed by element names
- Audio stem files follow pattern: `[#].[Element]_Stem_[DESCRIPTION].wav`
- Master files: `[#].[Element]_Master.wav`
- Track numbers are zero-padded in filenames (e.g., `7.Francium_Master.wav`)

### Audio Specifications

**Audio Stems (WAV files):**
- Format: WAV (Waveform Audio File Format)
- Bit Depth: 24-bit (Uncompressed)
- Sample rate: 44.1 kHz
- File Size: ~85-95 MB per stem
- Total per track: 13-39 stems (~1.1-3.4 GB per track)

**Track Metadata:**
- Hydrogen: 132 BPM, D Major, 5:19, 13 stems
- Lithium: 124 BPM, G minor, 5:33, 39 stems
- Sodium: 140 BPM, G minor, 5:09, 28 stems
- Potassium: 90 BPM, C Major, 5:16, 20 stems
- Rubidium: 132 BPM, G Major, 4:41, 10 stems
- Caesium: 130 BPM, C Major, 3:50, 17 stems
- Francium: 128 BPM, B flat, 4:59, 27 stems

### Cloudflare Infrastructure

**R2 Buckets:**
Audio stems are hosted in Cloudflare R2 (S3-compatible object storage):
- Separate bucket per track (HYDROGEN, LITHIUM, SODIUM, POTASSIUM, RUBIDIUM, CAESIUM, FRANCIUM)
- WAV files are too large for Git (~1-3.4 GB per track)
- Files accessible via custom domain URLs (e.g., `https://hydrogen.ichbinsoftware.com/`)

**Cloudflare Workers:**
The file `src/workers/r2-bucket-lister.js` powers the web interface:
- Serves index page listing all tracks
- Generates track-specific pages with audio stem listings
- Integrates WaveSurfer.js for audio visualization
- Streams files directly from R2 buckets
- Environment variables map track names to R2 bucket bindings

**Key Features:**
- Interactive waveform visualization for each stem
- Direct download links for individual stems and ZIP archives
- Responsive design for mobile and desktop
- Metadata display (BPM, key, length)

### License
This project is released under **Creative Commons Zero v1.0 Universal (CC0 1.0)** — public domain dedication with no restrictions.

## Working with This Repository

### Adding New Tracks

When adding new tracks:
1. **Create directory**: Follow the numbered pattern (e.g., `8.Oganesson/`)
2. **Add artwork**: Include all three PNG variants in `artwork/` subdirectory
3. **Create README**: Document all audio stems with descriptions
4. **Upload stems**: Upload WAV files to new R2 bucket
5. **Update worker**: Add track metadata to `TRACKS` constant in `r2-bucket-lister.js`
6. **Add stem descriptions**: Update `stemDescriptions` object in worker code

### Track README Documentation

Each track's README follows a consistent format:
- Badges showing license, BPM, key, and format
- Track information table with audio link
- Audio contents section with download links
- Detailed stem listing table with file sizes and descriptions
- Technical specifications
- Stem categories (organized by type: vocals, drums, bass, synths, FX)
- Usage instructions (sync, tempo, DAW import)
- Lyrics (if applicable)
- Artwork images
- License information
- Credits
- ASCII art footer

### Cloudflare Worker Code Structure

The `src/workers/r2-bucket-lister.js` file contains:

**Constants:**
- `stemDescriptions` - Object mapping stem filenames to human-readable descriptions (155 entries)
- `TRACKS` - Array of track metadata objects (id, name, number, bpm, key, length)
- `VALID_BUCKET_NAMES` - Derived list of valid bucket identifiers
- `CACHE_MAX_AGE` / `SHORT_CACHE` - Cache duration constants

**Request Handler:**
1. Parse URL to determine bucket name and file name
2. Validate bucket name against allowed list
3. Check environment variables for R2 bucket bindings
4. Serve index page (if no bucket specified)
5. Stream individual files (if filename specified)
6. List bucket contents and generate track page (default)

**Important Implementation Details:**
- All stems sync to Bar 1 for easy DAW alignment
- File sizes use decimal units (1 MB = 1,000,000 bytes) per R2 standard
- WaveSurfer.js loads on-demand to avoid performance issues
- Bucket names are lowercase in code but display capitalized
- Each track has a dedicated R2 bucket bound via environment variables

### Code Style & Best Practices

When modifying `r2-bucket-lister.js`:

**Do:**
- Keep `stemDescriptions` object in the file (don't externalize it)
- Maintain consistent GitHub-style UI with current color scheme
- Use responsive design with mobile-first approach
- Add try-catch blocks for R2 operations
- Include ARIA labels for accessibility
- Test on both desktop and mobile viewports

**Don't:**
- Remove or externalize the `stemDescriptions` object
- Change the fundamental page structure (header, main content, footer)
- Modify cache durations without consideration
- Break the existing WaveSurfer.js integration
- Add dependencies beyond WaveSurfer.js from unpkg

**CSS Conventions:**
- Footer links should be centered and wrap on mobile
- Tables should have responsive padding and font sizes
- Images should scale properly without distortion
- Use `width: 100%; height: auto;` for responsive images

