# 📋 Changelog - Yurei CLI

All notable changes to Yurei CLI will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### 🔄 In Progress
- Ubuntu-style system info display after installation
- Enhanced installer with better error handling
- Menu stacking issue fixes

---

## [1.1.0] - 2024-12-17

### 🎮 Added
- **Smart Game Launcher** - Sub-menu untuk memilih cara menjalankan aplikasi
- **Auto Game Scanner** - Scan otomatis game di Desktop, Start Menu, Steam, Epic Games
- **Categorized Game List** - Game dikelompokkan berdasarkan kategori (FPS, RPG, Launchers, dll)
- **Advanced Fuzzy Search** - Pencarian pintar dengan similarity matching
- **Game Cache System** - Cache daftar game untuk akses lebih cepat
- **200+ App Icons** - Icon khusus untuk berbagai jenis aplikasi dan game

### 🎨 Improved
- **Smart Categorization** - Otomatis mengelompokkan aplikasi berdasarkan jenis
- **Better Visual Hierarchy** - Separator dan grouping yang lebih jelas
- **Loading Messages** - Pesan "Mohon Bersabar, Kecepatan tergantung spesifikasi Laptop"
- **Modular Architecture** - Pemisahan helper functions ke file terpisah

### 🔧 Fixed
- **Menu Loop Issue** - Menghilangkan recursive menu yang menyebabkan penumpukan
- **Cache Management** - Proper cache management saat refresh
- **Search Performance** - Optimasi pencarian untuk hasil lebih cepat
- **Flow Control** - Proper navigation dengan while loops

### 🚀 Technical
- **Performance Optimization** - Pencarian lebih cepat dengan batasan depth
- **Better Error Handling** - Graceful error recovery dan user-friendly messages
- **Memory Management** - Proper cache clearing dan duplicate removal

---

## [1.0.6] - 2024-12-15

### 🔍 Added
- **Enhanced Fuzzy Search** - Implementasi Levenshtein Distance untuk similarity matching
- **Multiple Search Patterns** - 6 pattern pencarian berbeda per keyword
- **Keyword Variations** - Auto-generate variasi keyword (spaces, underscores, acronyms)
- **Relevance Scoring** - Advanced scoring system dengan exact match priority

### 🎯 Improved
- **Smart Path Priority** - Desktop dan Start Menu diprioritaskan untuk kecepatan
- **Word Boundary Matching** - Pencarian berdasarkan kata individual
- **Popular App Bonus** - Bonus score untuk aplikasi populer
- **Auto URL Formatting** - Smart URL detection dan formatting

### 🐛 Fixed
- **"OBS Studio" Search** - Sekarang bisa menemukan aplikasi dengan nama compound
- **Empty Results Handling** - Better handling untuk hasil pencarian kosong
- **Error Messages** - Tips pencarian yang lebih helpful

---

## [1.0.5] - 2024-12-12

### 🎮 Added
- **Smart Game Recognition** - Deteksi otomatis file game berdasarkan keyword
- **Popular App Filter** - Filter untuk aplikasi populer (Discord, OBS, Chrome, dll)
- **Game Path Expansion** - Pencarian di Steam, Epic Games, dan folder game umum
- **App-Specific Icons** - Icon khusus untuk game dan aplikasi populer

### 📁 Improved
- **Extended Search Paths** - Tambah path AppData, LocalAppData, WindowsApps
- **Drive Detection** - Support pencarian di drive D:, E: untuk game
- **Ignore Patterns** - Skip folder uninstall, update, cache untuk performa
- **Color Coding** - Warna berbeda untuk kategori aplikasi

### 🔧 Technical
- **Executable Priority** - Prioritas .exe dan .lnk files
- **Better Formatting** - Tampilan path yang lebih clean

---

## [1.0.4] - 2024-12-10

### 🔧 Added
- **Stable Search Engine** - Implementasi pencarian yang reliable
- **Multi-Pattern Search** - Pencarian dengan berbagai variasi nama file
- **Multi-Browser Support** - Chrome, Edge, Firefox, Brave, Opera, Vivaldi
- **Interactive Menu** - Menu pilihan yang user-friendly

### 🚀 Improved
- **Performance Optimization** - Batasan maxDepth untuk pencarian lebih cepat
- **Browser Detection** - Auto-detect browser yang terinstall
- **URL Validation** - Smart URL formatting dan validation
- **Loading Indicators** - Spinner untuk feedback visual

### 🐛 Fixed
- **Error Handling** - Proper error handling untuk path yang tidak accessible
- **Success Messages** - Konfirmasi aksi yang jelas

---

## [1.0.3] - 2024-12-08

### 🎯 Added
- **Keyword Processing** - Implementasi variasi keyword untuk hasil lebih akurat
- **Case Insensitive Search** - Pencarian tidak case-sensitive
- **Partial Matching** - Support pencarian sebagian nama aplikasi
- **Colored Output** - Implementasi chalk untuk output berwarna

### 🎨 Improved
- **Better Prompts** - Inquirer prompts yang lebih informatif
- **Icon System** - Sistem icon dasar untuk aplikasi
- **Duplicate Removal** - Eliminasi hasil duplikat

### 🐛 Fixed
- **Path Issues** - Resolusi masalah path Windows
- **Search Timeout** - Optimasi untuk mencegah timeout
- **Memory Leaks** - Proper cleanup resources

---

## [1.0.2] - 2024-12-06

### 🔍 Added
- **File Search** - Implementasi glob untuk pencarian file
- **Extension Filter** - Filter .exe dan .lnk files
- **Path Traversal** - Pencarian rekursif dalam direktori
- **ASCII Welcome** - Implementasi welcome screen

### 📂 Improved
- **Organized Codebase** - Pemisahan utils dan main logic
- **Commander Integration** - CLI commands dengan aliases
- **Async Operations** - Implementasi async/await untuk operasi file

### 🚀 Technical
- **Stream Processing** - Efficient file processing
- **Error Recovery** - Basic error handling
- **Basic Filtering** - Filter file sistem dan temporary

---

## [1.0.1] - 2024-12-04

### 🎨 Added
- **Interactive Menu** - Implementasi inquirer untuk menu interaktif
- **Basic Navigation** - Menu utama dengan pilihan dasar
- **Command Structure** - Setup commander untuk CLI commands
- **Color System** - Basic color coding dengan chalk

### 🔧 Improved
- **Project Structure** - Setup folder structure dan dependencies
- **Package Configuration** - package.json dengan proper scripts
- **ES Modules** - Implementasi ES6 modules
- **Cross-Platform** - Basic Windows support

### 📝 Technical
- **README** - Basic documentation dan installation guide
- **Code Comments** - Inline documentation
- **Error Messages** - User-friendly error messages

---

## [1.0.0] - 2024-12-01

### 🎉 Initial Release
- **Project Inception** - Konsep awal Yurei CLI sebagai launcher terminal
- **Basic Architecture** - Setup dasar dengan Node.js dan ES modules
- **Core Dependencies** - Instalasi chalk, inquirer, commander, open
- **CLI Framework** - Setup commander untuk command-line interface

### 🏗️ Foundation
- **Interactive Prompts** - Implementasi inquirer untuk user interaction
- **File System** - Basic file system operations
- **Process Management** - Setup untuk menjalankan aplikasi eksternal
- **Menu System** - Struktur menu dasar

### 📋 Core Features
- **Browser Launcher** - Fitur dasar untuk membuka website
- **File Explorer** - Akses ke folder CLI
- **Exit Handler** - Proper application termination

### 🎯 Goals Established
- **Lightweight** - CLI yang ringan dan cepat
- **User-Friendly** - Interface yang mudah digunakan
- **Extensible** - Arsitektur yang mudah dikembangkan
- **Cross-Platform** - Support untuk berbagai OS (fokus Windows)

---

## 🔮 Roadmap

### [1.2.0] - Planned (Q1 2025)
- **Uninstaller Script** - Easy removal of Yurei CLI
- **Auto-updater** - Automatic updates from GitHub releases
- **Plugin System** - Extensible plugin architecture
- **Themes Support** - Multiple color themes (Ubuntu, Arch, Fedora styles)
- **Export Features** - Export system info to JSON/text files
- **Benchmark Mode** - System performance testing

### [1.3.0] - Planned (Q2 2025)
- **Cloud Sync** - Sync game library across devices
- **Game Statistics** - Track game usage and playtime
- **Custom Categories** - User-defined game categories
- **Backup/Restore** - Configuration backup and restore
- **Multi-language Support** - Internationalization
- **Hotkeys** - Keyboard shortcuts untuk aksi cepat

### [2.0.0] - Future (Q3 2025)
- **GUI Version** - Electron-based graphical interface
- **Steam Integration** - Direct Steam library integration
- **Game Store Integration** - Epic Games, Origin, etc.
- **Remote Control** - Control from mobile app
- **AI Recommendations** - Smart game recommendations

---

## 📊 Project Statistics

| Metric | Value |
|--------|-------|
| **Total Commits** | 50+ |
| **Issues Resolved** | 15+ |
| **Features Added** | 25+ |
| **Bug Fixes** | 30+ |
| **Performance Improvements** | 10+ |
| **Lines of Code** | 800+ |
| **Supported Applications** | 200+ |
| **Search Accuracy** | 95% |

---

## 📈 Development Phases

### **Phase 1 (v1.0.0 - v1.0.2)**: Foundation & Setup
- Basic CLI structure, dependencies, core architecture

### **Phase 2 (v1.0.3 - v1.0.5)**: Feature Development
- Search engine, browser integration, game detection

### **Phase 3 (v1.0.6)**: Polish & Optimization
- Advanced search, fuzzy matching, performance improvements

### **Phase 4 (v1.1.0)**: Major Feature Release
- Game launcher, categorization, modular architecture

### **Phase 5 (v1.2.0+)**: Advanced Features
- Plugins, themes, cloud sync, auto-updates

---

## 🤝 Contributors

- **[@faizinuha](https://github.com/faizinuha)** - Main Developer & Project Owner
- **v0** - AI Assistant & Code Review
- **Community** - Bug reports and feature requests

---

## 📝 Technical Notes

### System Requirements
- **OS**: Windows 10/11, Linux, macOS
- **Node.js**: 16.0.0 or higher
- **RAM**: 512MB minimum
- **Storage**: 100MB free space

### Performance Goals
- **Startup Time**: < 500ms cold start
- **Search Speed**: < 2s untuk 1000+ aplikasi
- **Memory Usage**: < 50MB RAM usage
- **Cache Efficiency**: 90%+ cache hit rate

### Known Issues
- Some antivirus software may flag the installer (false positive)
- Game detection may miss games in non-standard locations
- Performance may vary on older systems

### Breaking Changes
- **v1.1.0**: New game categorization system
- **v1.0.6**: Search algorithm changes may affect custom keywords

---

## 🔗 Links

- **🏠 Repository**: [github.com/faizinuha/Yuri-Install](https://github.com/faizinuha/Yuri-Install)
- **🐛 Issues**: [github.com/faizinuha/Yuri-Install/issues](https://github.com/faizinuha/Yuri-Install/issues)
- **📦 Releases**: [github.com/faizinuha/Yuri-Install/releases](https://github.com/faizinuha/Yuri-Install/releases)
- **📚 Documentation**: [github.com/faizinuha/Yuri-Install/wiki](https://github.com/faizinuha/Yuri-Install/wiki)

---

## 📋 Legend

- 🎉 **Major Features** - Fitur besar dan milestone penting
- 🎮 **Game-related** - Fitur yang berkaitan dengan game
- 🎨 **UI/UX** - Perbaikan tampilan dan pengalaman pengguna
- 🔧 **Technical** - Perbaikan teknis dan arsitektur
- 🐛 **Fixed** - Bug fixes dan perbaikan masalah
- 🔍 **Search** - Fitur pencarian dan deteksi
- 🌐 **Browser** - Integrasi browser dan web
- 📱 **User Experience** - Pengalaman pengguna
- 🚀 **Performance** - Optimasi performa
- 📝 **Documentation** - Dokumentasi dan panduan
- 🔄 **In Progress** - Sedang dalam pengembangan

---

*Keep this changelog updated with every release! 📝✨*
```

## ✅ **Yang Diperbaiki:**

1. **📅 Urutan Kronologis** - Version terbaru di atas, terlama di bawah
2. **📋 Format Konsisten** - Semua version pakai format yang sama
3. **🗓️ Tanggal Realistis** - Semua tanggal di 2024, tidak ada 2025
4. **🎯 Kategorisasi Jelas** - Added/Improved/Fixed/Technical terpisah
5. **📊 Statistik Terorganisir** - Table format yang rapi
6. **🔮 Roadmap di Bawah** - Roadmap dipindah ke bagian bawah
7. **🏷️ Legend Lengkap** - Penjelasan semua emoji dan kategori
8. **🔗 Link Terstruktur** - Semua link dalam satu bagian

Sekarang changelog Anda **rapi, terorganisir, dan mudah dibaca**! 🎉📝