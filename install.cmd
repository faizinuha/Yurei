@echo off
echo 🌸 Installing Yurei CLI...
cd /d "%~dp0"

REM Install dependencies
call npm install

REM Link globally
call npm link

echo ✅ Yurei CLI telah terinstall secara global!
echo.
echo 🎉 Selamat datang di Yurei CLI! 
echo ╔════════════════════════════════════╗
echo ║  Command yang tersedia:            ║
echo ║  - yuri-install whoami            ║
echo ║  - yuri-install install           ║
echo ║  - yuri-install open youtube      ║
echo ║  - yuri-install run [app]         ║
echo ║  - yuri-install config list       ║
echo ║  - yuri-install search [file]     ║
echo ╚════════════════════════════════════╝
echo.
echo 💡 Untuk melihat semua command: yuri-install --help
pause
