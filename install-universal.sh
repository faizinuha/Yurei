#!/bin/bash

# 🌐 Universal Yurei CLI Installer
echo "🔍 Mendeteksi sistem operasi..."

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Detect OS
if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    INSTALL_DIR="$HOME/.local/bin"
    echo -e "${GREEN}🐧 Linux terdeteksi${NC}"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    INSTALL_DIR="/usr/local/bin"
    echo -e "${GREEN}🍎 macOS terdeteksi${NC}"
else
    echo -e "${RED}❌ Sistem operasi tidak didukung. Hanya Linux dan macOS yang didukung.${NC}"
    exit 1
fi

echo -e "${MAGENTA}🌸 Memulai instalasi Yurei CLI untuk $OS...${NC}"

# Define paths
YUREI_HOME="$HOME/.yurei"
YUREI_BIN="$YUREI_HOME/bin"
YUREI_SCRIPT="$INSTALL_DIR/yurei"

# Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Gagal install dependency.${NC}"
    exit 1
fi

# Create installation directories
echo -e "${YELLOW}📁 Creating installation directory...${NC}"
mkdir -p "$YUREI_HOME"
mkdir -p "$YUREI_BIN"

# For Linux, ensure ~/.local/bin exists and is in PATH
if [[ "$OS" == "linux" ]]; then
    mkdir -p "$HOME/.local/bin"
    
    # Add to PATH if not already there
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo -e "${YELLOW}🔗 Adding ~/.local/bin to PATH...${NC}"
        
        # Add to various shell configs
        for shell_config in "$HOME/.bashrc" "$HOME/.zshrc" "$HOME/.profile"; do
            if [[ -f "$shell_config" ]]; then
                if ! grep -q 'export PATH="$HOME/.local/bin:$PATH"' "$shell_config"; then
                    echo 'export PATH="$HOME/.local/bin:$PATH"' >> "$shell_config"
                    echo -e "${GREEN}✅ Added to $shell_config${NC}"
                fi
            fi
        done
    fi
fi

# Copy files to installation directory
echo -e "${YELLOW}📋 Copying files...${NC}"
cp -r . "$YUREI_HOME/" 2>/dev/null || {
    # If direct copy fails, copy selectively
    find . -maxdepth 1 -type f -name "*.js" -o -name "*.json" -o -name "package*" | xargs -I {} cp {} "$YUREI_HOME/"
    [ -d "./bin" ] && cp -r ./bin "$YUREI_HOME/"
    [ -d "./lib" ] && cp -r ./lib "$YUREI_HOME/"
    [ -d "./src" ] && cp -r ./src "$YUREI_HOME/"
}

# Install dependencies in target location
echo -e "${YELLOW}📦 Installing production dependencies...${NC}"
cd "$YUREI_HOME"
npm install --production
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Gagal install dependency di lokasi target.${NC}"
    exit 1
fi

# Create executable script
echo -e "${YELLOW}🔧 Creating executable script...${NC}"
cat > "$YUREI_SCRIPT" << EOF
#!/bin/bash
node "$YUREI_HOME/bin/yurei.js" "\$@"
EOF

# Make executable
chmod +x "$YUREI_SCRIPT"

# For macOS, might need sudo for /usr/local/bin
if [[ "$OS" == "macos" && ! -w "$INSTALL_DIR" ]]; then
    echo -e "${YELLOW}🔐 Memerlukan sudo untuk install ke $INSTALL_DIR...${NC}"
    sudo chmod +x "$YUREI_SCRIPT"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Gagal membuat executable. Coba jalankan dengan sudo.${NC}"
        exit 1
    fi
fi

# Verify installation
if command -v yurei >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Yurei CLI berhasil diinstall dan tersedia secara global!${NC}"
else
    echo -e "${YELLOW}⚠️ Yurei CLI terinstall tapi mungkin belum tersedia di PATH saat ini.${NC}"
    echo -e "${BLUE}💡 Restart terminal atau jalankan: source ~/.bashrc (atau ~/.zshrc)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Instalasi selesai!${NC}"
echo -e "${CYAN}📍 Installed to: $YUREI_HOME${NC}"
echo -e "${CYAN}🔗 Executable: $YUREI_SCRIPT${NC}"
echo -e "${MAGENTA}✨ Gunakan: yurei menu${NC}"
echo ""
echo -e "${BLUE}💡 Jika command 'yurei' tidak ditemukan, restart terminal Anda.${NC}"