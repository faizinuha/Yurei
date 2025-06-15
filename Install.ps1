Write-Host "🌸 Yurei CLI Installer for Windows" -ForegroundColor Magenta
Write-Host "-----------------------------------"

$installDeps = Read-Host "📦 Ingin jalankan 'npm install'? (y/n)"
if ($installDeps -eq "y") {
  npm install
  if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Gagal install dependency."; exit
  }
}

$linkGlobal = Read-Host "🔗 Ingin menjalankan 'npm link' untuk install global? (y/n)"
if ($linkGlobal -eq "y") {
  npm link
  if ($LASTEXITCODE -ne 0) {
    Write-Error "❌ Gagal link global."; exit
  }
  Write-Host "✅ Yurei CLI telah tersedia global! Jalankan: yurei"
} else {
  Write-Host "⚠️ Anda dapat menjalankan CLI secara lokal: node bin/yurei.js"
}

Write-Host "🎉 Instalasi selesai. Gunakan 'yurei menu' untuk memulai." -ForegroundColor Green
