# 👻 Yurei CLI

<p align="center">
  <pre>
  ██╗   ██╗██╗   ██╗██████╗ ███████╗██╗████████╗ ██████╗  ██████╗ ██╗     ███████╗
  ██║   ██║██║   ██║██╔══██╗██╔════╝██║╚══██╔══╝██╔═══██╗██╔═══██╗██║     ██╔════╝
  ██║   ██║██║   ██║██████╔╝█████╗  ██║   ██║   ██║   ██║██║   ██║██║     █████╗  
  ╚██╗ ██╔╝██║   ██║██╔═══╝ ██╔══╝  ██║   ██║   ██║   ██║██║   ██║██║     ██╔══╝  
   ╚████╔╝ ╚██████╔╝██║     ███████╗██║   ██║   ╚██████╔╝╚██████╔╝███████╗███████╗
    ╚═══╝   ╚═════╝ ╚═╝     ╚══════╝╚═╝   ╚═╝    ╚═════╝  ╚═════╝ ╚══════╝╚══════╝
  </pre>
  <h3 align="center">Yurei CLI - Developer tool lokal serbaguna dengan sentuhan Jepang ✨</h3>
</p>

---

**Yurei** adalah CLI serbaguna buatan lokal. Siap membantu Anda membuka website, game, dan aplikasi langsung dari terminal—cepat, ringan, dan dapat dikustomisasi sesuai selera.

> 🌸 *"Jiwa developer modern tapi tetap oldschool."*

---

## ✨ Fitur Utama

- 🔗 `yurei open <site>` — Buka website populer atau custom (YouTube, Instagram, dll)
- 🚀 `yurei run <app>` — Jalankan aplikasi atau game dari konfigurasi path
- 🛠️ `yurei install [--save-dev]` — Simulasi perintah install
- ⚙️ `yurei config` — Tambah, lihat, dan hapus path app secara lokal
- 🔍 `yurei search <filename>` — Cari file dan buka foldernya di Explorer
- 🧠 `yurei whoami` — Lihat info tentang Yurei CLI (tanpa spoiler!)
- 🧠 `yurei menu` — Menu interaktif ala GUI di terminal

---

## 📦 Instalasi

### 🪟 Windows

1. Clone atau download folder ini.
2. Jalankan `install.cmd` (klik dua kali atau via CMD):

```bash
Remove/install.cmd
```

### 🐧 Linux / macOS
```bash
curl -s https://raw.githubusercontent.com/faizinuha/Yuri-Install/main/install-universal.sh | bash
```
### windows
```powershell
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
powershell -Command "iwr https://raw.githubusercontent.com/faizinuha/Yuri-Install/main/Install.ps1 -OutFile install.ps1; powershell -ExecutionPolicy Bypass -File ./install.ps1"
```

### 🔄 Alternatif (Tanpa Clone)
```bash
npx github:faizinuha/Yuri-Install
```

### Manual dari source
```bash
git clone https://github.com/faizinuha/Yuri-Install.git
cd Yuri-Install
npm install && npm link
```

=================================================

#### 📁 Struktur Proyek
```plaintext
Yuri-Install/
├── bin/
│   └── yurei.js          # Entry point CLI
├── utils/
│   └── asciiWelcome.js   # Teks welcome (easter egg)
├── Worker/
│   └── ScanWorker.js     # Worker thread pencari game
├── package.json
└── README.md
```
=================================================

### 🎉 Contoh Penggunaan
```bash
yurei whoami
# Informasi tentang Yurei CLI (easter egg misterius~)

yurei open youtube
# Membuka https://youtube.com

yurei run genshin.exe
# Menjalankan game jika ditemukan di desktop/start menu
```

### 💖 Credits
```plaintext
Dibuat dengan penuh profesionalisme 
untuk semua developer yang ingin terminal-nya
berasa anime~
Inspired by the spirit of 
open-source and a touch of waifu magic ✨
```

## 📜 Lisensi
```bash
Kalau Anda suka tools ini, jangan lupa bintangin repo-nya di GitHub ya! 🌟
https://github.com/faizinuha/Yuri-Install
```
## download
```bash
## 📦 Download
Grab the latest release:
➡️ [Yurei CLI v1.0.5 (zip)](https://github.com/faizinuha/Yuri-Install/releases)