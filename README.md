# Everything is Free

[![npm version](https://img.shields.io/npm/v/@ichbinsoftware/everything-is-free.svg?style=flat-square)](https://www.npmjs.com/package/@ichbinsoftware/everything-is-free)
[![License: CC0-1.0](https://img.shields.io/badge/License-CC0%201.0-lightgrey.svg?style=flat-square)](http://creativecommons.org/publicdomain/zero/1.0/)
[![Status: Public Infrastructure](https://img.shields.io/badge/Status-Public_Infrastructure-000000.svg?style=flat-square)](https://ev3.ichbinsoftware.com)


<div align="center">
  <img src="src/artwork/Cover-Square-750x750.png" width="450" alt="Software-Entwicklungskit - Everything is Free">
  <br/>
</div>  

An open, zero-restriction release of **Software-Entwicklungskit’s** album [Everything is Free](https://software-entwicklungskit.bandcamp.com/album/everything-is-free).

All audio stems, artwork, lyrics, and information in this repository are released under **Creative Commons Zero v1.0 Universal (CC0 1.0)** — meaning:

> **You may use, remix, transform, sample, commercialize, or redistribute these files with absolutely no restrictions and no attribution required.**


## 🎵 Tracks
<img src="src/images/Example-Waveform-View.png" height="300" width="100%" alt="ev3.ichbinsoftware.com view">
<br>

| # | Track | Symbol | BPM | Key | Assets |
|:---|:---|:---|:---|:---|:---|
| 1 | Hydrogen | <img src="src/1.Hydrogen/artwork/Hydrogen-Symbol-1000x1000.png" width="50" height="50" alt="Hydrogen symbol"> | 132 | D Major | [Interactive](https://ev3.ichbinsoftware.com/hydrogen) • [Source](src/1.Hydrogen) |
| 2 | Lithium | <img src="src/2.Lithium/artwork/Lithium-Symbol-1000x1000.png" width="50" height="50" alt="Lithium symbol"> | 124 | G minor | [Interactive](https://ev3.ichbinsoftware.com/lithium) • [Source](src/2.Lithium) |
| 3 | Sodium | <img src="src/3.Sodium/artwork/Sodium-Symbol-1000x1000.png" width="50" height="50" alt="Sodium symbol"> | 140 | G minor | [Interactive](https://ev3.ichbinsoftware.com/sodium) • [Source](src/3.Sodium) |
| 4 | Potassium | <img src="src/4.Potassium/artwork/Potassium-Symbol-1000x1000.png" width="50" height="50" alt="Potassium symbol"> | 90 | C Major | [Interactive](https://ev3.ichbinsoftware.com/potassium) • [Source](src/4.Potassium) |
| 5 | Rubidium | <img src="src/5.Rubidium/artwork/Rubidium-Symbol-1000x1000.png" width="50" height="50" alt="Rubidium symbol"> | 132 | G Major | [Interactive](https://ev3.ichbinsoftware.com/rubidium) • [Source](src/5.Rubidium) |
| 6 | Caesium | <img src="src/6.Caesium/artwork/Caesium-Symbol-1000x1000.png" width="50" height="50" alt="Caesium symbol"> | 130 | C Major | [Interactive](https://ev3.ichbinsoftware.com/caesium) • [Source](src/6.Caesium) |
| 7 | Francium | <img src="src/7.Francium/artwork/Francium-Symbol-1000x1000.png" width="50" height="50" alt="Francium symbol"> | 128 | B flat | [Interactive](https://ev3.ichbinsoftware.com/francium) • [Source](src/7.Francium) |


## 🎨 Artwork

Digital artwork by **Maubere**.

Bead work by **Beadhammer**.

### Main  
<img src="src/artwork/Cover-Square-750x750.png" width="400" />

### Beadwork  
<img src="src/artwork/Small-Square-550x550.png" width="400" />

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/awesome-feature`)
3. Commit your changes (`git commit -m 'Add awesome feature'`)
4. Push to the branch (`git push origin feature/awesome-feature`)
5. Open a Pull Request

## 🎯 Usage

### 🎛️ For Producers and musicians

1.  **Download:** Clone respository or **Download** uncompressed WAV stems [Here](https://ev3.ichbinsoftware.com).
2.  **Sync:** All stems begin at **Bar 1**.
3.  **Tempo:** Set your DAW to **BPM** of track.
4.  **Import:** Drag & drop into Ableton, Logic, FL Studio, Reaper, Bitwig, etc. Stems will align automatically.


### 📦 For Developers

```bash
npm install @ichbinsoftware/everything-is-free
```

```javascript
const album = require('@ichbinsoftware/everything-is-free');

// Print the manifesto
console.log(album.manifesto);

// Play a track (Stream directly from our CDN)
const track = album.tracks[0];
console.log(`Now Playing: ${track.title} (${track.bpm} BPM)`);

const audio = new Audio(track.streamUrl);
audio.play();
```


## ⚖️ License

This work is dedicated to the public domain under  
**Creative Commons Zero v1.0 Universal (CC0 1.0)**.

You may copy, modify, distribute, perform, remix, sample, or commercialize this work  
**without permission, credit, or restriction**.


## 👥 Credits
- **Music & Production:** Software-Entwicklungskit | [@ichbinsoftware](https://www.instagram.com/ichbinsoftware/)
- **Artwork:** Maubere  
- **Beadwork:** Beadhammer | [@beadhammer](https://www.instagram.com/beadhammer/)