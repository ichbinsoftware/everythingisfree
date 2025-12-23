# Everything is Free

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

| # | Track | BPM | Key | Links |
|:---|:---|:---|:---|:---|
| 1 | [Hydrogen](src/1.Hydrogen) | 132 | D Major | [Play & Download Stems](https://ev3.ichbinsoftware.com/hydrogen) |
| 2 | [Lithium](src/2.Lithium) | 124 | G minor | [Play & Download Stems](https://ev3.ichbinsoftware.com/lithium) |
| 3 | [Sodium](src/3.Sodium) | 140 | G minor | [Play & Download Stems](https://ev3.ichbinsoftware.com/sodium) |
| 4 | [Potassium](src/4.Potassium) | 90 | C Major | [Play & Download Stems](https://ev3.ichbinsoftware.com/potassium) |
| 5 | [Rubidium](src/5.Rubidium) | 132 | G Major | [Play & Download Stems](https://ev3.ichbinsoftware.com/rubidium) |
| 6 | [Caesium](src/6.Caesium) | 130 | C Major | [Play & Download Stems](https://ev3.ichbinsoftware.com/caesium) |
| 7 | [Francium](src/7.Francium) | 128 | B flat | [Play & Download Stems](https://ev3.ichbinsoftware.com/francium) |


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