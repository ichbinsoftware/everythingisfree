document.addEventListener('DOMContentLoaded', () => {
  // Ensure configuration exists
  if (typeof TRACK_DATA === 'undefined') return;

  const { bucketName, trackColor, files } = TRACK_DATA;
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
    
    if (!loadBtn) return;

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