import fs from "fs"
import path from "path"
import semver from "semver" // Pastikan semver terinstal
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PACKAGE_JSON_PATH = path.join(__dirname, "../package.json") // Path ke package.json Anda
const NPM_REGISTRY_URL = "https://www.npmjs.com/package/yurei-cli" // Ganti 'yurei-cli' jika nama package Anda berbeda

export async function isUpdateAvailable() {
  try {
    // Dapatkan versi saat ini dari package.json lokal
    const localPackageJson = JSON.parse(fs.readFileSync(PACKAGE_JSON_PATH, "utf8"))
    const currentVersion = localPackageJson.version

    // Dapatkan versi terbaru dari npm registry
    const response = await fetch(NPM_REGISTRY_URL)
    const npmData = await response.json()
    const latestVersion = npmData["dist-tags"].latest

    // Bandingkan versi
    if (semver.gt(latestVersion, currentVersion)) {
      return { available: true, current: currentVersion, latest: latestVersion }
    } else {
      return { available: false, current: currentVersion, latest: latestVersion }
    }
  } catch (error) {
    // Tangani error jika gagal memeriksa update (misal: tidak ada koneksi internet)
    // console.error(`❌ Error checking for updates: ${error.message}`); // Bisa di-uncomment untuk debug
    return { available: false, error: error.message }
  }
}
