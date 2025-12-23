// ==========================================
// 1. CONFIGURATION & CONSTANTS
// ==========================================

const CACHE_MAX_AGE = 31536000; // 1 year
const SHORT_CACHE = 300; // 5 minutes

const TRACKS = [
  { id: 'hydrogen', name: 'Hydrogen', number: '1', bpm: 132, key: 'D Major', length: '5:19', color: '#25daf0' },
  { id: 'lithium', name: 'Lithium', number: '2', bpm: 124, key: 'G minor', length: '5:33', color: '#cf2739' },
  { id: 'sodium', name: 'Sodium', number: '3', bpm: 140, key: 'G minor', length: '5:09', color: '#f7ca47' },
  { id: 'potassium', name: 'Potassium', number: '4', bpm: 90, key: 'C Major', length: '5:16', color: '#8f01ff' },
  { id: 'rubidium', name: 'Rubidium', number: '5', bpm: 132, key: 'G Major', length: '4:41', color: '#c71585' },
  { id: 'caesium', name: 'Caesium', number: '6', bpm: 130, key: 'C Major', length: '3:50', color: '#afa0ef' },
  { id: 'francium', name: 'Francium', number: '7', bpm: 128, key: 'B flat', length: '4:59', color: '#c1c1c1' }
];

// Quick lookup map for track data
const TRACK_MAP = TRACKS.reduce((acc, t) => { acc[t.id] = t; return acc; }, {});
const VALID_BUCKETS = new Set(TRACKS.map(t => t.id));

// ==========================================
// 2. WORKER LOGIC (CONTROLLER)
// ==========================================

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
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

    // --- ROUTE 3: BUCKET LISTING (Track Page) ---
    try {
      const listed = await bucket.list();
      const wavFiles = listed.objects.filter(obj => obj.key.toLowerCase().endsWith('.wav'));
      
      return renderTrackPage(bucketName, wavFiles);
    } catch (error) {
       console.error('List Error:', error);
       return new Response('Error listing files', { status: 500 });
    }
  }
};

// ==========================================
// 3. VIEW LAYER (HTML GENERATION)
// ==========================================

/**
 * Shared Layout for all pages to ensure consistent CSS/Header/Footer
 * @param {Object} options - Layout configuration
 * @param {string} options.title - Page title for <title> tag
 * @param {string} options.meta - Additional meta tags and links
 * @param {string} options.content - Main page content HTML
 * @returns {string} Complete HTML document
 */
function renderLayout({ title, meta, content }) {
  const css = getStyles(); // Extracted below to keep this clean
  
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  ${meta}
  <style>${css}</style>
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
function renderTrackPage(bucketName, files) {
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
              <th>Download</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>${capitalizedName}</strong></td>
              <td>${track.bpm}</td>
              <td>${track.key}</td>
              <td>${track.length}</td>
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
      // Wait for DOM and Defer script
      document.addEventListener('DOMContentLoaded', () => {
        const bucketName = '${bucketName}';
        const trackColor = '${track.color}';
        const files = ${JSON.stringify(files.map((f, i) => ({ idx: i, key: f.key })))};
        const wavesurfers = {};

        // Helper to format time
        const formatTime = (seconds) => {
          const mins = Math.floor(seconds / 60);
          const secs = Math.floor(seconds % 60);
          return mins + ':' + (secs < 10 ? '0' : '') + secs;
        };

        files.forEach(file => {
          const index = file.idx;
          const loadBtn = document.getElementById('load-' + index);
          
          loadBtn.addEventListener('click', function() {
            if (typeof WaveSurfer === 'undefined') {
              alert('Player is still initializing, please wait a moment.');
              return;
            }

            const playBtn = document.getElementById('play-' + index);
            const timeDisplay = document.getElementById('time-' + index);
            const placeholder = document.getElementById('placeholder-' + index);
            const waveformContainer = document.getElementById('waveform-' + index);
            
            loadBtn.disabled = true;
            loadBtn.innerHTML = '⏳ Loading waveform...';
            
            const ws = WaveSurfer.create({
              container: '#waveform-' + index,
              waveColor: trackColor,
              progressColor: trackColor,
              cursorColor: '#24292f',
              cursorWidth: 1,
              height: 128,
              responsive: true,
              normalize: true,
              backend: 'WebAudio',
              barWidth: 0
            });
            
            // Logic: Replace .wav with .m4a for lighter streaming
            const audioFileName = file.key.replace(/\.wav$/i, '.m4a');
            const audioUrl = '/' + bucketName + '/' + audioFileName;

            ws.load(audioUrl);
            
            ws.on('ready', function() {
              placeholder.style.display = 'none';
              loadBtn.style.display = 'none';
              waveformContainer.classList.add('loaded');
              playBtn.style.display = 'inline-block';
              playBtn.disabled = false;
              playBtn.innerHTML = '▶️ Play';
              timeDisplay.style.display = 'inline-block';
              updateTime();
            });
            
            ws.on('error', function(error) {
              loadBtn.innerHTML = '❌ Failed to load';
              console.error('WaveSurfer error:', error);
            });
            
            ws.on('audioprocess', updateTime);
            ws.on('seek', updateTime);
            
            function updateTime() {
              const current = ws.getCurrentTime();
              const duration = ws.getDuration();
              timeDisplay.textContent = formatTime(current) + ' / ' + formatTime(duration);
            }
            
            playBtn.addEventListener('click', () => ws.playPause());
            
            ws.on('play', function() {
              playBtn.innerHTML = '⏸️ Pause';
              // Pause others
              Object.keys(wavesurfers).forEach((key) => {
                if (key !== String(index) && wavesurfers[key].isPlaying()) {
                  wavesurfers[key].pause();
                }
              });
            });
            
            ws.on('pause', () => playBtn.innerHTML = '▶️ Play');
            ws.on('finish', () => playBtn.innerHTML = '▶️ Play');
            
            wavesurfers[index] = ws;
          });
        });
      });
    </script>
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

// ==========================================
// 4. HELPERS
// ==========================================

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

/**
 * Returns CSS stylesheet for all pages
 * Clean, minimal style with responsive design
 * @returns {string} Complete CSS as string
 */
function getStyles() {
  return `
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif; background: #ffffff; color: #24292f; line-height: 1.5; }
    .site-header { background: #24292f; color: #ffffff; padding: 16px; border-bottom: 1px solid #d0d7de; }
    .site-header-content { max-width: 1280px; margin: 0 auto; display: flex; align-items: center; gap: 8px; }
    .site-header h1 { font-size: 14px; font-weight: 600; color: #ffffff; margin: 0; padding: 0; border: none; }
    .main-content { max-width: 1012px; margin: 0 auto; padding: 32px 16px; }
    .header { text-align: center; margin-bottom: 32px; }
    .header img { max-width: 450px; width: 100%; height: auto; margin-bottom: 16px; }
    h1 { font-size: 32px; font-weight: 600; margin: 0 0 16px 0; padding-bottom: 8px; border-bottom: 1px solid #d0d7de; }
    h2 { padding-bottom: 8px; font-size: 24px; font-weight: 600; border-bottom: 1px solid #d0d7de; margin-top: 24px; margin-bottom: 16px; color: #24292f; }
    .intro { margin-bottom: 24px; font-size: 16px; }
    .intro strong { font-weight: 600; }
    blockquote { margin: 16px 0; padding: 0 16px; color: #57606a; border-left: 4px solid #d0d7de; }
    blockquote strong { color: #24292f; }
    hr { height: 2px; padding: 0; margin: 24px 0; background-color: #d0d7de; border: 0; }
    table { border-spacing: 0; border-collapse: collapse; width: 100%; overflow: auto; margin-top: 0; margin-bottom: 16px; }
    table thead th { padding: 6px 13px; font-weight: 600; border: 1px solid #d0d7de; background-color: #f6f8fa; text-align: left; }
    table tbody td { padding: 6px 13px; border: 1px solid #d0d7de; }
    table tr { background-color: #ffffff; border-top: 1px solid #d0d7de; }
    table tr:nth-child(2n) { background-color: #f6f8fa; }
    table img.track-symbol { width: 50px; height: 50px; border-radius: 6px; display: block; }
    a { color: #0969da; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .back-link { display: inline-block; margin-bottom: 16px; color: #0969da; text-decoration: none; font-size: 14px; }
    .file { background: #ffffff; padding: 16px; margin: 0 0 8px 0; border: 1px solid #d0d7de; border-radius: 6px; }
    .file h3 { margin: 0 0 8px 0; color: #24292f; font-size: 14px; font-weight: 600; word-break: break-word; }
    .file h3 .description { font-weight: normal; font-style: italic; color: #57606a; }
    .file-info { color: #57606a; font-size: 12px; margin-bottom: 12px; }
    .waveform { margin: 12px 0; border-radius: 6px; overflow: hidden; display: none; background: #f6f8fa; }
    .waveform.loaded { display: block; }
    .controls { display: flex; gap: 8px; align-items: center; margin-top: 12px; }
    .btn { background: #0969da; color: #ffffff; border: 1px solid rgba(27, 31, 36, 0.15); padding: 5px 16px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; transition: background 0.2s; line-height: 20px; }
    .btn:hover { background: #0860ca; }
    .btn:disabled { background: #94d3a2; border-color: rgba(27, 31, 36, 0.15); cursor: not-allowed; opacity: 0.6; }
    .btn-load { background: #1a7f37; border-color: rgba(27, 31, 36, 0.15); }
    .btn-load:hover { background: #1a7f37; filter: brightness(0.9); }
    .btn-download { background: #ffffff; color: #24292f; border: 1px solid #d0d7de; text-decoration: none; display: inline-flex; align-items: center; padding: 5px 16px; border-radius: 6px; font-size: 14px; font-weight: 500; }
    .btn-download:hover { background: #f6f8fa; border-color: #d0d7de; text-decoration: none; }
    .time { color: #57606a; font-size: 12px; font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace; }
    .empty { text-align: center; padding: 64px 16px; color: #57606a; background: #ffffff; border: 1px solid #d0d7de; border-radius: 6px; }
    .placeholder { background: #f6f8fa; height: 128px; border-radius: 6px; display: flex; align-items: center; justify-content: center; color: #57606a; font-size: 12px; margin: 12px 0; border: 1px solid #d0d7de; cursor: pointer; }
    .track-summary { background: #ffffff; border: 1px solid #d0d7de; border-radius: 6px; padding: 24px; margin-bottom: 24px; display: flex; gap: 24px; align-items: center; }
    .track-image { flex-shrink: 0; }
    .track-image img { width: 100px; height: 100px; border-radius: 6px; }
    .track-info-table { flex: 1; }
    .track-info-table table { width: 100%; margin-bottom: 0; }
    @media (max-width: 768px) { .track-summary { flex-direction: column; padding: 16px; gap: 16px; } table { font-size: 14px; } }
    .footer { margin-top: 40px; padding: 40px 0 32px; border-top: 1px solid #d0d7de; font-size: 12px; color: #57606a; text-align: center; }
    .footer-content { display: flex; flex-direction: column; justify-content: center; align-items: center; gap: 16px; }
    .footer-links { display: flex; flex-wrap: wrap; gap: 16px; list-style: none; padding: 0; margin: 0; justify-content: center; }
    .footer-links a { color: #57606a; text-decoration: none; }
    .footer-links a:hover { color: #0969da; text-decoration: underline; }
  `;
}

// ==========================================
// 5. DATA (STEM DESCRIPTIONS)
// ==========================================

const stemDescriptions = {
  '1.Hydrogen_Master.wav': 'Full mix master track',
  '1.Hydrogen_Stem_BEEPS.wav': 'Beeps/electronic sounds',
  '1.Hydrogen_Stem_BGVOX AAHH.wav': 'Background vocals "aahh"',
  '1.Hydrogen_Stem_BGVOX ECHO.wav': 'Background vocals with echo/delay',
  '1.Hydrogen_Stem_BGVOX HARMONY.wav': 'Background vocals harmony/chord progression',
  '1.Hydrogen_Stem_DRUMS BREAK 1.wav': 'Drum break pattern 1',
  '1.Hydrogen_Stem_DRUMS BREAK 2.wav': 'Drum break pattern 2',
  '1.Hydrogen_Stem_HH.wav': 'Hi-hat percussion',
  '1.Hydrogen_Stem_MAIN DRUMS.wav': 'Main drum pattern',
  '1.Hydrogen_Stem_MICROCOSM EFFECT.wav': 'Microcosm granular effect',
  '1.Hydrogen_Stem_MINILOGUE SYNTH.wav': 'Minilogue synthesizer',
  '1.Hydrogen_Stem_SWEEPS.wav': 'Sweep/riser effects',
  '1.Hydrogen_Stem_VOX LEAD.wav': 'Lead vocals',
  '2.Lithium_Master.wav': 'Full mix master track',
  '2.Lithium_Stem_ALT HH.wav': 'Alternate hi-hat pattern',
  '2.Lithium_Stem_ARP DIST.wav': 'Distorted arpeggiator',
  '2.Lithium_Stem_BEEP.wav': 'Beep sound effect',
  '2.Lithium_Stem_BGVOX 1.wav': 'Background vocals 1',
  '2.Lithium_Stem_BGVOX 2.wav': 'Background vocals 2',
  '2.Lithium_Stem_BGVOX 3.wav': 'Background vocals 3',
  '2.Lithium_Stem_BGVOX AAAAAHHHH.wav': 'Background vocals extended "ahhh"',
  '2.Lithium_Stem_BGVOX HARMONY GLITCH.wav': 'Background vocals harmony with glitch effect',
  '2.Lithium_Stem_BGVOX ICK ICK.wav': 'Background vocals "ick ick" sample',
  '2.Lithium_Stem_BGVOX MAIN.wav': 'Main background vocals',
  '2.Lithium_Stem_BGVOX REVERSE.wav': 'Background vocals reverse effect',
  '2.Lithium_Stem_BREAK BEAT.wav': 'Breakbeat drum pattern',
  '2.Lithium_Stem_CRASH FADE.wav': 'Crash cymbal fade',
  '2.Lithium_Stem_CRASH INTRO.wav': 'Crash cymbal intro',
  '2.Lithium_Stem_CRUSH BREAK.wav': 'Bit-crush break effect',
  '2.Lithium_Stem_ECHO PAD.wav': 'Echo pad texture',
  '2.Lithium_Stem_EDM BUILD.wav': 'EDM build-up/riser',
  '2.Lithium_Stem_FILL PIANO.wav': 'Piano fill/accent',
  '2.Lithium_Stem_GLITCH HH.wav': 'Glitchy hi-hat',
  '2.Lithium_Stem_HAT FILL.wav': 'Hi-hat fill',
  '2.Lithium_Stem_HATS.wav': 'Main hi-hats',
  '2.Lithium_Stem_HH GLITCH.wav': 'Hi-hat glitch effect',
  '2.Lithium_Stem_HOUSE BEAT.wav': 'House beat pattern',
  '2.Lithium_Stem_INTRO DRUMS.wav': 'Intro drum pattern',
  '2.Lithium_Stem_KICK.wav': 'Main kick drum',
  '2.Lithium_Stem_MELODY PAD.wav': 'Melodic pad',
  '2.Lithium_Stem_MINILOGUE_SYNTH.wav': 'Minilogue synthesizer',
  '2.Lithium_Stem_OFF KICK.wav': 'Off-beat kick drum',
  '2.Lithium_Stem_ORGAN SWEEP EFFECT.wav': 'Organ sweep effect',
  '2.Lithium_Stem_PAD INTRO.wav': 'Pad intro/atmosphere',
  '2.Lithium_Stem_PLUCK.wav': 'Plucked synth',
  '2.Lithium_Stem_SLOW BEAT.wav': 'Slow/half-time beat pattern',
  '2.Lithium_Stem_SNARE BUILD.wav': 'Snare build-up/roll',
  '2.Lithium_Stem_SY BASS.wav': 'Synthesizer bass',
  '2.Lithium_Stem_TOM BREAK.wav': 'Tom drum break pattern',
  '2.Lithium_Stem_TOMS.wav': 'Tom drums',
  '2.Lithium_Stem_VOX ECHO.wav': 'Vocals with echo effect',
  '2.Lithium_Stem_VOX LEAD.wav': 'Lead vocals',
  '3.Sodium_Master.wav': 'Full mix master track',
  '3.Sodium_Stem_ALT HATS.wav': 'Alternate hi-hat pattern',
  '3.Sodium_Stem_BASS STAB.wav': 'Bass stab/accent',
  '3.Sodium_Stem_BGVOX BUILD.wav': 'Background vocals build-up',
  '3.Sodium_Stem_BGVOX OOH.wav': 'Background vocals "ooh"',
  '3.Sodium_Stem_BGVOX OUTRO.wav': 'Background vocals outro/ending',
  '3.Sodium_Stem_BUILD PRC.wav': 'Build-up percussion',
  '3.Sodium_Stem_CLAP.wav': 'Clap/handclap',
  '3.Sodium_Stem_FAST HATS.wav': 'Fast/double-time hi-hats',
  '3.Sodium_Stem_FILL BUILD.wav': 'Fill build-up',
  '3.Sodium_Stem_GLITCH HH.wav': 'Glitchy hi-hat',
  '3.Sodium_Stem_HH BUILD.wav': 'Hi-hat build-up',
  '3.Sodium_Stem_HH.wav': 'Main hi-hats',
  '3.Sodium_Stem_HIGH STABS.wav': 'High frequency stabs/accents',
  '3.Sodium_Stem_HVY KICK.wav': 'Heavy kick drum',
  '3.Sodium_Stem_K & SN.wav': 'Kick and snare combined',
  '3.Sodium_Stem_KICK.wav': 'Main kick drum',
  '3.Sodium_Stem_MICROCOSM_EFFECT.wav': 'Microcosm granular effect',
  '3.Sodium_Stem_MINILOGUE_SYNTH.wav': 'Minilogue synthesizer',
  '3.Sodium_Stem_PLUCK.wav': 'Plucked synth',
  '3.Sodium_Stem_REVERSE SWEEP.wav': 'Reverse sweep effect',
  '3.Sodium_Stem_RISE.wav': 'Riser effect',
  '3.Sodium_Stem_SLIDE.wav': 'Slide/portamento effect',
  '3.Sodium_Stem_SLOW BEAT.wav': 'Slow beat/half-time pattern',
  '3.Sodium_Stem_SWEEPS.wav': 'Sweep/filter sweep effect',
  '3.Sodium_Stem_SY BASS.wav': 'Synthesizer bass',
  '3.Sodium_Stem_TOPS.wav': 'Top-end/high frequency elements',
  '3.Sodium_Stem_TRANSISTION.wav': 'Transition effect',
  '3.Sodium_Stem_VOX LEAD.wav': 'Lead vocals',
  '4.Potassium_Master.wav': 'Full mix master track',
  '4.Potassium_Stem_BGVOX ALT.wav': 'Alternate background vocals',
  '4.Potassium_Stem_BGVOX ECHO.wav': 'Background vocals with echo effect',
  '4.Potassium_Stem_BREAKBEAT.wav': 'Breakbeat drum pattern',
  '4.Potassium_Stem_BUILD.wav': 'Build-up/riser section',
  '4.Potassium_Stem_END DRUMS.wav': 'Ending drum pattern',
  '4.Potassium_Stem_HAT FILL.wav': 'Hi-hat fill',
  '4.Potassium_Stem_HATS.wav': 'Main hi-hats',
  '4.Potassium_Stem_KEYS.wav': 'Keyboard/piano',
  '4.Potassium_Stem_KICK HATS.wav': 'Kick drum with hi-hats',
  '4.Potassium_Stem_KICK.wav': 'Main kick drum',
  '4.Potassium_Stem_MALLET.wav': 'Mallet percussion',
  '4.Potassium_Stem_MICROCOSM_EFFECT.wav': 'Microcosm granular effect',
  '4.Potassium_Stem_MINILOGUE_SYNTH.wav': 'Minilogue synthesizer',
  '4.Potassium_Stem_OUTRO DRUM.wav': 'Outro drum pattern',
  '4.Potassium_Stem_PAD + BASS.wav': 'Pad and bass combined',
  '4.Potassium_Stem_SNARE.wav': 'Snare drum',
  '4.Potassium_Stem_SWEEP.wav': 'Sweep/filter sweep effect',
  '4.Potassium_Stem_TRAP BEAT.wav': 'Trap-style beat pattern',
  '4.Potassium_Stem_VOX LEAD.wav': 'Lead vocals',
  '5.Rubidium_Master.wav': 'Full mix master track',
  '5.Rubidium_Stem_BGVOX.wav': 'Background vocals',
  '5.Rubidium_Stem_BUILD.wav': 'Build-up/riser section',
  '5.Rubidium_Stem_DRUMS 2.wav': 'Drum pattern 2',
  '5.Rubidium_Stem_DRUMS MAIN.wav': 'Main drum pattern',
  '5.Rubidium_Stem_DRUMS OUTRO.wav': 'Outro drum pattern',
  '5.Rubidium_Stem_MELODY BREAK.wav': 'Melodic break section',
  '5.Rubidium_Stem_MINILOGUE_SYNTH.wav': 'Minilogue synthesizer',
  '5.Rubidium_Stem_PLUCK.wav': 'Plucked synth',
  '5.Rubidium_Stem_VOX LEAD.wav': 'Lead vocals',
  '6.Caesium_Master.wav': 'Full mix master track',
  '6.Caesium_Stem_ALT HATS.wav': 'Alternate hi-hat pattern',
  '6.Caesium_Stem_BGVOX ALT.wav': 'Alternate background vocals',
  '6.Caesium_Stem_BGVOX ECHO.wav': 'Background vocals with echo effect',
  '6.Caesium_Stem_BGVOX HARMONY.wav': 'Background vocals harmony/chord progression',
  '6.Caesium_Stem_BGVOX HIGH.wav': 'Background vocals high frequency elements',
  '6.Caesium_Stem_BGVOX MAIN.wav': 'Main background vocals',
  '6.Caesium_Stem_BREAK.wav': 'Break/breakdown section',
  '6.Caesium_Stem_BUILD.wav': 'Build-up/riser section',
  '6.Caesium_Stem_FILL SCRATCH.wav': 'Fill with scratch effect',
  '6.Caesium_Stem_GARAGE BEAT.wav': 'Garage-style beat pattern',
  '6.Caesium_Stem_HATS.wav': 'Main hi-hats',
  '6.Caesium_Stem_KICK.wav': 'Kick drum',
  '6.Caesium_Stem_MICROCOSM_EFFECT.wav': 'Microcosm granular effect',
  '6.Caesium_Stem_MINILOGUE_SYNTH.wav': 'Minilogue synthesizer',
  '6.Caesium_Stem_SCRATCH HATS.wav': 'Scratch hi-hat sound effects',
  '6.Caesium_Stem_VOX LEAD.wav': 'Lead vocals',
  '7.Francium_Master.wav': 'Full mix master track',
  '7.Francium_Stem_BGVOX ALT OUTRO.wav': 'Alternate background vocals outro',
  '7.Francium_Stem_BGVOX BOP.wav': 'Background vocals bop/bounce rhythm element',
  '7.Francium_Stem_BGVOX BUILD.wav': 'Background vocals build-up',
  '7.Francium_Stem_BGVOX ECHO.wav': 'Background vocals with echo effect',
  '7.Francium_Stem_BGVOX OUTRO.wav': 'Background vocals outro',
  '7.Francium_Stem_BGVOX SCATTER OUTRO.wav': 'Background vocals scatter/glitch outro',
  '7.Francium_Stem_BIG BEAT.wav': 'Big/heavy beat pattern',
  '7.Francium_Stem_BREAK.wav': 'Break/breakdown section',
  '7.Francium_Stem_CLAPS.wav': 'Clap/handclap',
  '7.Francium_Stem_CRASH.wav': 'Crash cymbal',
  '7.Francium_Stem_CYMBALS.wav': 'Cymbal elements',
  '7.Francium_Stem_FILL BEAT.wav': 'Fill beat pattern',
  '7.Francium_Stem_FILL BUILD.wav': 'Fill with build-up',
  '7.Francium_Stem_FILL SCRATCH.wav': 'Fill with scratch effect',
  '7.Francium_Stem_GARAGE BEAT.wav': 'Garage-style beat pattern',
  '7.Francium_Stem_HATS.wav': 'Main hi-hats',
  '7.Francium_Stem_KICK.wav': 'Kick drum',
  '7.Francium_Stem_MELODY GLITCH.wav': 'Melody with glitch effect',
  '7.Francium_Stem_MICROCOSM_EFFECT.wav': 'Microcosm granular effect',
  '7.Francium_Stem_MINILOGUE_SYNTH.wav': 'Minilogue synthesizer',
  '7.Francium_Stem_OPEN HATS.wav': 'Open hi-hats',
  '7.Francium_Stem_PERC BUILD.wav': 'Percussion build-up',
  '7.Francium_Stem_SCRATCH BEAT.wav': 'Scratch beat effect',
  '7.Francium_Stem_SINE.wav': 'Sine wave/sub bass',
  '7.Francium_Stem_TEXTURE.wav': 'Texture/atmosphere',
  '7.Francium_Stem_VOX LEAD.wav': 'Lead vocals'
};