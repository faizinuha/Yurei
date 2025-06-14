#!/bin/bash

echo "🌸 Installing Yurei CLI..."

# Pindah ke direktori skrip ini
cd "$(dirname "$0")"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Link global
echo "🔗 Linking globally..."
npm link

# Selesai
echo "✅ Yurei CLI has been installed globally!"
echo "👉 You can now run: yurei whoami"
