#!/bin/bash

# 🌐 Universal Yurei CLI Installer
echo "🔍 Mendeteksi sistem operasi..."

# Deteksi OS
if [[ "$OSTYPE" == "linux-gnu"* || "$OSTYPE" == "darwin"* ]]; then
  echo "🟢 Linux/macOS terdeteksi"
  
  echo "🌸 Memulai instalasi Yurei CLI untuk Linux/macOS..."
  
  while true; do
    read -p "📦 Jalankan 'npm install'? (y/n): " installDeps
    case $installDeps in
      [Yy]* ) npm install || { echo "❌ Gagal install dependency."; exit 1; }; break;;
      [Nn]* ) break;;
      * ) echo "Silakan jawab dengan 'y' atau 'n'.";;
    esac
  done

  while true; do
    read -p "🔗 Ingin meng-link Yurei secara global (npm link)? (y/n): " doLink
    case $doLink in
      [Yy]* ) npm link || { echo "❌ Gagal link global."; exit 1; }; echo "✅ Yurei CLI berhasil di-link secara global!"; break;;
      [Nn]* ) echo "⚠️ Anda dapat menjalankan secara lokal via: node bin/yurei.js"; break;;
      * ) echo "Silakan jawab dengan 'y' atau 'n'.";;
    esac
  done

  echo "🎉 Instalasi selesai. Jalankan 'yurei menu' untuk memulai."
else
  echo "❌ Sistem operasi tidak didukung. Hanya Linux dan macOS yang didukung."
  exit 1
fi