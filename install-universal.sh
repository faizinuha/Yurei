#!/bin/bash

echo "🔍 Detecting operating system..."

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

if [[ "$OSTYPE" == "linux-gnu"* ]]; then
    OS="linux"
    INSTALL_DIR="$HOME/.local/bin"
    echo -e "${GREEN}🐧 Linux detected${NC}"
elif [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
    INSTALL_DIR="/usr/local/bin"
    echo -e "${GREEN}🍎 macOS detected${NC}"
else
    echo -e "${RED}❌ Unsupported OS. Only Linux and macOS supported.${NC}"
    exit 1
fi

echo -e "${MAGENTA}🌸 Starting Yurei CLI installation for $OS...${NC}"

YUREI_HOME="$HOME/.yurei"
YUREI_BIN="$YUREI_HOME/bin"
YUREI_SCRIPT="$INSTALL_DIR/yurei"

if ! command -v node >/dev/null 2>&1; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi

if ! command -v npm >/dev/null 2>&1; then
    echo -e "${RED}❌ npm is not installed. Please install npm first.${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Installing dependencies in current directory...${NC}"
npm install --silent
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies.${NC}"
    exit 1
fi

echo -e "${YELLOW}📁 Creating installation directories...${NC}"
mkdir -p "$YUREI_HOME"
mkdir -p "$YUREI_BIN"

if [[ "$OS" == "linux" ]]; then
    mkdir -p "$HOME/.local/bin"
    if [[ ":$PATH:" != *":$HOME/.local/bin:"* ]]; then
        echo -e "${YELLOW}🔗 Adding ~/.local/bin to PATH...${NC}"
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

echo -e "${YELLOW}📋 Copying files to $YUREI_HOME...${NC}"
cp -r . "$YUREI_HOME/" 2>/dev/null || {
    find . -maxdepth 1 -type f \( -name "*.js" -o -name "*.json" -o -name "package*" \) -exec cp {} "$YUREI_HOME/" \;
    [ -d "./bin" ] && cp -r ./bin "$YUREI_HOME/"
    [ -d "./lib" ] && cp -r ./lib "$YUREI_HOME/"
    [ -d "./src" ] && cp -r ./src "$YUREI_HOME/"
}

echo -e "${YELLOW}📦 Installing production dependencies in $YUREI_HOME...${NC}"
cd "$YUREI_HOME" || { echo -e "${RED}❌ Failed to cd to $YUREI_HOME${NC}"; exit 1; }
npm install --production --silent
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install production dependencies.${NC}"
    exit 1
fi

echo -e "${YELLOW}🔧 Creating executable script at $YUREI_SCRIPT...${NC}"
cat > "$YUREI_SCRIPT" << EOF
#!/bin/bash
node "$YUREI_HOME/bin/yurei.js" "\$@"
EOF

chmod +x "$YUREI_SCRIPT"

if [[ "$OS" == "macos" && ! -w "$INSTALL_DIR" ]]; then
    echo -e "${YELLOW}🔐 Requires sudo to set executable permissions in $INSTALL_DIR...${NC}"
    sudo chmod +x "$YUREI_SCRIPT"
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to make executable. Try running with sudo.${NC}"
        exit 1
    fi
fi

# Function to show ASCII logo and system info
show_logo_and_system_info() {
    clear
    cat << "EOF"
       __     __   ____   ____  
       \ \   / /  |  _ \ |  _ \ 
        \ \ / /   | |_) || |_) |
         \ V /    |  _ < |  __/ 
          \_/     |_| \_\|_|    
EOF

    echo ""

    os_name=$(uname -s)
    cpu_info=$(uname -m)
    user_name=$USER
    hostname=$(hostname)

    if [[ "$os_name" == "Linux" ]]; then
        ram_total_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')
        ram_gb=$(echo "scale=2; $ram_total_kb/1024/1024" | bc)
    elif [[ "$os_name" == "Darwin" ]]; then
        ram_bytes=$(sysctl -n hw.memsize)
        ram_gb=$(echo "scale=2; $ram_bytes/1024/1024/1024" | bc)
    else
        ram_gb="N/A"
    fi

    disk_info=$(df -h / | tail -1)
    disk_free=$(echo $disk_info | awk '{print $4}')
    disk_size=$(echo $disk_info | awk '{print $2}')

    echo "User: $user_name"
    echo "Hostname: $hostname"
    echo "OS: $os_name"
    echo "CPU Architecture: $cpu_info"
    echo "RAM: ${ram_gb} GB"
    echo "Disk: $disk_free free / $disk_size total"
    echo ""
    echo "Thank you for installing Yurei CLI!"
}

if command -v yurei >/dev/null 2>&1; then
    echo -e "${GREEN}✅ Yurei CLI installed and available globally!${NC}"
else
    echo -e "${YELLOW}⚠️ Yurei CLI installed but may not be in PATH currently.${NC}"
    echo -e "${BLUE}💡 Restart terminal or run: source ~/.bashrc (or ~/.zshrc)${NC}"
fi

echo ""
echo -e "${GREEN}🎉 Installation complete!${NC}"
echo -e "${CYAN}📍 Installed to: $YUREI_HOME${NC}"
echo -e "${CYAN}🔗 Executable: $YUREI_SCRIPT${NC}"
echo -e "${MAGENTA}✨ Use: yurei menu${NC}"
echo ""
echo -e "${BLUE}💡 If 'yurei' command not found, restart your terminal.${NC}"

show_logo_and_system_info