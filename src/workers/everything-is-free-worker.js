// ==========================================
// Cloudflare Worker: EV3 -  Bucket Lister
// Version: Refactored
// ==========================================

// --- CONFIGURATION & DATA ---

const CACHE_MAX_AGE = 31536000; // 1 year
const SHORT_CACHE = 300; // 5 minutes

const TRACKS = [
  { id: 'hydrogen', name: 'Hydrogen', number: '1', bpm: 132, key: 'D Major', stems: 12, length: '5:19', color: '#25daf0' },
  { id: 'lithium', name: 'Lithium', number: '2', bpm: 124, key: 'G minor', stems: 38, length: '5:33', color: '#cf2739' },
  { id: 'sodium', name: 'Sodium', number: '3', bpm: 140, key: 'G minor', stems: 28, length: '5:09', color: '#f7ca47' },
  { id: 'potassium', name: 'Potassium', number: '4', bpm: 90, key: 'C Major', stems: 19, length: '5:16', color: '#8f01ff' },
  { id: 'rubidium', name: 'Rubidium', number: '5', bpm: 132, key: 'G Major', stems: 9, length: '4:41', color: '#c71585' },
  { id: 'caesium', name: 'Caesium', number: '6', bpm: 130, key: 'C Major', stems: 16, length: '3:50', color: '#afa0ef' },
  { id: 'francium', name: 'Francium', number: '7', bpm: 128, key: 'B flat', stems: 26, length: '4:59', color: '#c1c1c1' }
];

// Quick lookup map for track data
const TRACK_MAP = TRACKS.reduce((acc, t) => { acc[t.id] = t; return acc; }, {});
const VALID_BUCKETS = new Set(TRACKS.map(t => t.id));

// Global in-memory cache for parsed assets
let cachedAssets = null;

// --- WORKER HANDLER ---

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    
    // --- ROUTE 0: ASSETS ---
    if (url.pathname === '/assets/style.css') {
      const css = await fetchAssetSafely(env, 'style.css');
      if (!css) return new Response('Not Found', { status: 404 });
      return new Response(css, {
        headers: {
          'Content-Type': 'text/css',
          'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    if (url.pathname === '/assets/app.js') {
      const js = await fetchAssetSafely(env, 'app.js');
      if (!js) return new Response('Not Found', { status: 404 });
      return new Response(js, {
        headers: {
          'Content-Type': 'application/javascript',
          'Cache-Control': `public, max-age=${CACHE_MAX_AGE}`,
          'Access-Control-Allow-Origin': '*'
        }
      });
    }

    const pathParts = url.pathname.split('/').filter(p => p);
    
    // --- ROUTE 1: HOME PAGE (Root) ---
    if (pathParts.length === 0) {
      return renderIndexPage();
    }

    const bucketName = pathParts[0].toLowerCase();
    const fileName = decodeURIComponent(pathParts.slice(1).join('/'));

    // Validate Bucket Name
    if (!VALID_BUCKETS.has(bucketName)) {
      return new Response('Invalid bucket name', { status: 404 });
    }

    // Dynamic Environment Access (env.HYDROGEN, env.LITHIUM, etc.)
    const bucket = env[bucketName.toUpperCase()];

    if (!bucket) {
      return new Response(`Service configuration error: Bucket ${bucketName} not bound.`, { status: 503 });
    }

    // --- ROUTE 2: FILE DOWNLOAD ---
    if (fileName) {
      try {
        const object = await bucket.get(fileName);

        if (!object) {
          return new Response(`File not found: "${fileName}"`, { status: 404 });
        }

        const headers = new Headers();
        object.writeHttpMetadata(headers);
        headers.set('etag', object.httpEtag);
        headers.set('Access-Control-Allow-Origin', '*');
        headers.set('Cache-Control', `public, max-age=${CACHE_MAX_AGE}`);

        return new Response(object.body, { headers });
      } catch (error) {
        console.error('R2 Error:', error);
        return new Response('Service temporarily unavailable', { status: 503 });
      }
    }

    // --- ROUTE: BUCKET LISTING (Track Page) ---
    try {
      // Load JSON data from ASSETS (with global caching)
      if (!cachedAssets) {
        let stemDescriptions = {};
        try {
          const jsonRaw = await fetchAssetSafely(env, 'stem-descriptions.json');
          if (jsonRaw) {
            try { stemDescriptions = JSON.parse(jsonRaw); } catch (e) { console.error("Invalid stem-descriptions.json:", e); }
          }
        } catch (e) { console.error("Asset Fetch Error", e); }
        cachedAssets = { stemDescriptions };
      }
      const { stemDescriptions } = cachedAssets;

      const listed = await bucket.list();
      const wavFiles = listed.objects.filter(obj => obj.key.toLowerCase().endsWith('.wav'));
      
      return renderTrackPage(bucketName, wavFiles, stemDescriptions);
    } catch (error) {
       console.error('List Error:', error);
       return new Response('Error listing files', { status: 500 });
    }
  }
};

//  - VIEW LAYER (HTML GENERATION)

/**
 * Shared Layout for all pages to ensure consistent CSS/Header/Footer
 * @param {Object} options - Layout configuration
 * @param {string} options.title - Page title for <title> tag
 * @param {string} options.meta - Additional meta tags and links
 * @param {string} options.content - Main page content HTML
 * @returns {string} Complete HTML document
 */
function renderLayout({ title, meta, content }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${meta}
  <link rel="stylesheet" href="/assets/style.css">
</head>
<body>
  <header class="site-header">
    <div class="site-header-content">
      <h1>Software-Entwicklungskit - Everything is Free</h1>
    </div>
  </header>

  <div class="main-content">
    ${content}
  </div>

  <footer class="footer">
    <div class="footer-content">
      <ul class="footer-links">
        <li><a href="https://software-entwicklungskit.bandcamp.com/" target="_blank" rel="noopener">Bandcamp</a></li>
        <li><a href="https://www.instagram.com/ichbinsoftware/" target="_blank" rel="noopener">Instagram</a></li>
        <li><a href="https://www.youtube.com/@ichbinsoftware" target="_blank" rel="noopener">YouTube</a></li>
        <li><a href="https://open.spotify.com/artist/6qo7PqvYZvrkIrr8gF2uHL?si=S1I8K4miSFCEki1PMINrXA" target="_blank" rel="noopener">Spotify</a></li>
        <li><a href="https://music.apple.com/au/artist/software-entwicklungskit/1489827998" target="_blank" rel="noopener">Apple Music</a></li>
        <li><a href="https://music.youtube.com/channel/UCizCkDBNL71vyneWPAg-t6g?si=RlpS-ZMEQyU9SheC" target="_blank" rel="noopener">YouTube Music</a></li>
        <li><a href="https://www.tiktok.com/@ichbinsoftware" target="_blank" rel="noopener">TikTok</a></li>
        <li><a href="https://github.com/ichbinsoftware/everythingisfree" target="_blank" rel="noopener">Github</a></li>
        <li><a href="https://creativecommons.org/publicdomain/zero/1.0/deed.en" target="_blank" rel="noopener">CC0 1.0 Universal</a></li>
      </ul>
    </div>
  </footer>
</body>
</html>`;
}

/**
 * Renders the Home/Index Page with all tracks listed
 * @returns {Response} HTTP response with index page HTML
 */
function renderIndexPage() {
  const meta = `
    <meta name="description" content="Free audio stems from Software-Entwicklungskit's Everything is Free album. All stems released under CC0 1.0 Universal.">
    <meta property="og:title" content="Software-Entwicklungskit - Everything is Free">
    <meta property="og:description" content="Free audio stems from Everything is Free album. CC0 licensed.">
    <meta property="og:image" content="https://artwork.ichbinsoftware.com/Cover-Square-750x750.png">
    <meta property="og:type" content="website">
    <link rel="preconnect" href="https://artwork.ichbinsoftware.com">
  `;

  const rows = TRACKS.map((track, index) => {
    const trackName = track.id;
    return `
      <tr>
        <td align="left">${index + 1}</td>
        <td align="left">${track.name}</td>
        <td align="left"><img src="https://${trackName}.ichbinsoftware.com/${track.name}-Symbol.png" width="50" height="50" alt="${track.name} symbol" class="track-symbol" loading="lazy"></td>
        <td align="left">${track.bpm}</td>
        <td align="left">${track.key}</td>
        <td align="left">${track.stems}</td>
        <td align="left"><a href="/${trackName}" aria-label="Play and download ${track.name} stems">Play & Download</a></td>
      </tr>`;
  }).join('');

  const content = `
    <div class="header">
      <img src="https://artwork.ichbinsoftware.com/Cover-Square-750x750.png" width="450" height="450" alt="Software-Entwicklungskit - Everything is Free" loading="eager">
    </div>

    <div class="intro">
      <p>An open, zero-restriction release of <strong>Software-Entwicklungskit's</strong> album <a href="https://software-entwicklungskit.bandcamp.com/album/everything-is-free">Everything is Free</a>.</p>
      <p>All audio stems, artwork, lyrics, and information in this repository are released under <strong>Creative Commons Zero v1.0 Universal (CC0 1.0)</strong> — meaning:</p>
      <blockquote>
        <strong>You may use, remix, transform, sample, commercialize, or redistribute these files with absolutely no restrictions and no attribution required.</strong>
      </blockquote>
    </div>

    <hr>
    <h2>🎵 Tracks</h2>
    <img src="https://artwork.ichbinsoftware.com/Example-Waveform-View.png" alt="Example waveform view" loading="lazy" style="width: 100%; height: auto; display: block; margin-bottom: 16px;">
    
    <table>
      <thead>
        <tr>
          <th align="left">#</th>
          <th align="left">Track</th>
          <th align="left">Symbol</th>
          <th align="left">BPM</th>
          <th align="left">Key</th>
          <th align="left">Stems</th>
          <th align="left">Assets</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
      </tbody>
    </table>
  `;

  return new Response(renderLayout({ 
    title: 'Software-Entwicklungskit - Everything is Free', 
    meta, 
    content 
  }), {
    headers: { 'Content-Type': 'text/html; charset=utf-8' }
  });
}

/**
 * Renders the specific Track/Bucket page with audio stems listing
 * @param {string} bucketName - Track identifier (e.g., 'hydrogen', 'lithium')
 * @param {Array<Object>} files - Array of R2 file objects with .key and .size properties
 * @returns {Response} HTTP response with track page HTML and WaveSurfer.js player
 */
function renderTrackPage(bucketName, files, stemDescriptions) {
  const track = TRACK_MAP[bucketName];
  const capitalizedName = bucketName.charAt(0).toUpperCase() + bucketName.slice(1);
  
  const meta = `
    <meta name="description" content="${capitalizedName} audio stems from Software-Entwicklungskit. Free download, CC0 licensed.">
    <meta property="og:title" content="Everything is Free - ${capitalizedName} Stems">
    <meta property="og:image" content="https://${bucketName}.ichbinsoftware.com/${capitalizedName}-Symbol.png">
    <link rel="preconnect" href="https://unpkg.com">
    <link rel="preconnect" href="https://${bucketName}.ichbinsoftware.com">
    <script src="https://unpkg.com/wavesurfer.js@7" defer></script>
  `;

  // --- 1. Track Info Section ---
  const zipFileName = `${track.number}.${capitalizedName}_STEMS.zip`;
  const zipUrl = `https://${bucketName}.ichbinsoftware.com/${zipFileName}`;
  
  const trackSummaryHtml = `
    <div class="track-summary">
      <div class="track-image">
        <img src="https://${bucketName}.ichbinsoftware.com/${capitalizedName}-Symbol.png" width="100" height="100" alt="${capitalizedName} symbol" loading="eager">
      </div>
      <div class="track-info-table">
        <table>
          <thead>
            <tr>
              <th>Track</th>
              <th>BPM</th>
              <th>Key</th>
              <th>Length</th>
              <th>Stems</th>
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${capitalizedName}</strong></td>
              <td>${track.bpm}</td>
              <td>${track.key}</td>
              <td>${track.length}</td>
              <td>${track.stems}</td>
              <td><a href="${zipUrl}" class="btn-download" download="${zipFileName}">⬇️ All Stems (ZIP)</a></td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>`;

  // --- 2. File List Section ---
  const fileListHtml = files.length === 0 
    ? `<div class="empty"><p>No WAV files found in this bucket.</p></div>`
    : files.map((obj, index) => {
        const escapedKey = obj.key.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
        const description = stemDescriptions[obj.key] || '';
        const displayTitle = description
          ? `#${index + 1} ${obj.key} <span class="description">(${description})</span>`
          : `#${index + 1} ${obj.key}`;

        return `
        <div class="file">
          <h3>${displayTitle}</h3>
          <div class="file-info">Size: ${formatBytes(obj.size)}</div>
          
          <div class="placeholder" id="placeholder-${index}">
            Click "Load Player" to visualize this audio file
          </div>
          <div class="waveform" id="waveform-${index}"></div>
          
          <div class="controls">
            <button class="btn btn-load" id="load-${index}" data-key="${escapedKey}" aria-label="Load audio player">
              📊 Load Player
            </button>
            <button class="btn" id="play-${index}" style="display: none;" disabled>
              <span class="loading">Loading...</span>
            </button>
            <span class="time" id="time-${index}" style="display: none;">0:00 / 0:00</span>
            <a href="/${bucketName}/${obj.key}" download="${obj.key}" class="btn btn-download">
              ⬇️ Download
            </a>
          </div>
        </div>`;
      }).join('');

  // --- 3. JavaScript Logic ---
  const scriptHtml = `
    <script>
      const TRACK_DATA = {
        bucketName: "${bucketName}",
        trackColor: "${track.color}",
        files: ${JSON.stringify(files.map((f, i) => ({ idx: i, key: f.key })))}
      };
    </script>
    <script src="/assets/app.js" defer></script>
  `;

  const content = `
    <a href="/" class="back-link">← Home</a>
    <h2>Everything is Free - ${capitalizedName} Stems</h2>
    ${trackSummaryHtml}
    ${fileListHtml}
    ${scriptHtml}
  `;

  return new Response(renderLayout({ 
    title: `Software-Entwicklungskit - Everything is Free - ${capitalizedName} Stems`, 
    meta, 
    content 
  }), {
    headers: { 
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': `public, max-age=${SHORT_CACHE}`
    }
  });
}

// - HELPERS

/**
 * Formats byte size into human-readable format (B, KB, MB, GB)
 * Uses decimal units (1 MB = 1,000,000 bytes) per R2 standard
 * @param {number|string} sizeInBytes - Size in bytes
 * @returns {string} Formatted size string (e.g., "85.23 MB")
 */
function formatBytes(sizeInBytes) {
  const bytes = Number(sizeInBytes);
  if (isNaN(bytes) || bytes === 0) return 'Unknown';
  if (bytes < 1000) return bytes + ' B';
  if (bytes < 1000 * 1000) return (bytes / 1000).toFixed(2) + ' KB';
  if (bytes < 1000 * 1000 * 1000) return (bytes / (1000 * 1000)).toFixed(2) + ' MB';
  return (bytes / (1000 * 1000 * 1000)).toFixed(2) + ' GB';
}

async function fetchAssetSafely(env, filename) {
  if (!env.ASSETS) return null;
  try {
    const obj = await env.ASSETS.get(filename);
    return obj ? await obj.text() : null;
  } catch (e) { return null; }
}