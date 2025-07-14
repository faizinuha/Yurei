#!/usr/bin/env node

const crypto = require("crypto")
const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")
const { promisify } = require("util")
const exec = require("child_process").exec // Declaration of exec variable

const execAsync = promisify(exec)

// Character sets
const CHARS = {
  lower: "abcdefghijklmnopqrstuvwxyz",
  upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  number: "0123456789",
  symbol: "!@#$%^&*()_+-=[]{}|;:,.<>?",
}

const CHAR_SETS = {
  lowercase: "abcdefghijklmnopqrstuvwxyz",
  uppercase: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numbers: "0123456789",
  symbols: "!@#$%^&*()_+-=[]{}|;:,.<>",
  similar: "il1Lo0O", // Characters to exclude for readability
  ambiguous: "{}[]()/\\'\"`~,;.<>",
}

// Parse arguments
const args = process.argv.slice(2)

// Main function
function main() {
  if (args.length === 0 || args[0] === "help") {
    showHelp()
    return
  }

  // Default settings
  let length = 12
  let useUpper = false
  let useLower = true
  let useNumber = false
  let useSymbol = false
  let count = 1

  // Parse arguments
  args.forEach((arg) => {
    const num = Number.parseInt(arg)
    if (!isNaN(num)) {
      length = num
    } else {
      switch (arg.toLowerCase()) {
        case "upper":
        case "uppercase":
          useUpper = true
          break
        case "lower":
        case "lowercase":
          useLower = true
          break
        case "number":
        case "num":
          useNumber = true
          break
        case "symbol":
        case "sym":
          useSymbol = true
          break
        case "all":
          useUpper = true
          useLower = true
          useNumber = true
          useSymbol = true
          break
        case "safe":
          useUpper = true
          useLower = true
          useNumber = true
          useSymbol = false
          break
      }
    }
  })

  // Check for count (like 5x for 5 passwords)
  const countArg = args.find((arg) => arg.includes("x"))
  if (countArg) {
    count = Number.parseInt(countArg.replace("x", "")) || 1
  }

  // Generate passwords
  console.log(`🔐 Password Generator`)
  console.log(`Length: ${length} | Types: ${getTypes(useUpper, useLower, useNumber, useSymbol)}`)
  console.log("=".repeat(40))

  for (let i = 0; i < count; i++) {
    const password = generatePassword(length, useUpper, useLower, useNumber, useSymbol)
    if (count > 1) {
      console.log(`${i + 1}. ${password}`)
    } else {
      console.log(password)
    }
  }
}

// Generate password
function generatePassword(length, useUpper, useLower, useNumber, useSymbol) {
  let charset = ""

  if (useLower) charset += CHARS.lower
  if (useUpper) charset += CHARS.upper
  if (useNumber) charset += CHARS.number
  if (useSymbol) charset += CHARS.symbol

  // Default to lowercase if nothing selected
  if (charset === "") charset = CHARS.lower

  let password = ""
  for (let i = 0; i < length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length)
    password += charset[randomIndex]
  }

  return password
}

// Get types description
function getTypes(useUpper, useLower, useNumber, useSymbol) {
  const types = []
  if (useLower) types.push("Lower")
  if (useUpper) types.push("Upper")
  if (useNumber) types.push("Number")
  if (useSymbol) types.push("Symbol")
  return types.length > 0 ? types.join("+") : "Lower"
}

// Command executor
function executeCommand(cmd, params) {
  switch (cmd) {
    case "generate":
    case "gen":
      generatePassword(params)
      break
    case "secure":
      generateSecurePassword(params)
      break
    case "memorable":
      generateMemorablePassword(params)
      break
    case "pin":
      generatePIN(params)
      break
    case "passphrase":
      generatePassphrase(params)
      break
    case "bulk":
      generateBulkPasswords(params)
      break
    case "strength":
      checkPasswordStrength(params)
      break
    case "entropy":
      calculateEntropy(params)
      break
    case "save":
      savePasswordsToFile(params)
      break
    case "templates":
      showTemplates()
      break
    default:
      console.log(`❌ Unknown command: ${cmd}`)
      console.log("💡 Use 'passwordgen help' to see available commands")
  }
}

// Generate secure password (high entropy)
function generateSecurePassword(params) {
  const length = Number.parseInt(params[0]) || 16
  const count = Number.parseInt(params.find((p) => p.startsWith("--count="))?.split("=")[1]) || 1

  const options = {
    length,
    count,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: true,
    excludeAmbiguous: false,
  }

  console.log("🛡️ Secure Password Generator")
  console.log("============================")
  console.log(`Length: ${length} characters\n`)

  for (let i = 0; i < count; i++) {
    const password = createPassword(options)
    const strength = getPasswordStrength(password)

    console.log(`Password ${count > 1 ? (i + 1) + ": " : ""}${password}`)
    console.log(`Strength: ${getStrengthIndicator(strength)} (${strength.score}/5)`)
    console.log(`Entropy: ${calculatePasswordEntropy(password).toFixed(1)} bits`)

    if (count > 1) console.log("")
  }
}

// Generate memorable password
function generateMemorablePassword(params) {
  const wordCount = Number.parseInt(params[0]) || 4
  const separator = params.find((p) => p.startsWith("--sep="))?.split("=")[1] || "-"
  const addNumbers = params.includes("--numbers")

  console.log("🧠 Memorable Password Generator")
  console.log("==============================")

  const words = [
    "apple",
    "brave",
    "cloud",
    "dance",
    "eagle",
    "flame",
    "grace",
    "happy",
    "island",
    "jungle",
    "knight",
    "lemon",
    "magic",
    "noble",
    "ocean",
    "peace",
    "queen",
    "river",
    "storm",
    "tiger",
    "unity",
    "voice",
    "water",
    "xenon",
    "youth",
    "zebra",
    "anchor",
    "bridge",
    "castle",
    "dragon",
    "energy",
    "forest",
  ]

  const selectedWords = []
  for (let i = 0; i < wordCount; i++) {
    const randomIndex = crypto.randomInt(0, words.length)
    selectedWords.push(words[randomIndex])
  }

  let password = selectedWords.join(separator)

  if (addNumbers) {
    const randomNum = crypto.randomInt(10, 999)
    password += separator + randomNum
  }

  console.log(`Password: ${password}`)
  console.log(`Length: ${password.length} characters`)

  const strength = getPasswordStrength(password)
  console.log(`Strength: ${getStrengthIndicator(strength)} (${strength.score}/5)`)
}

// Generate PIN
function generatePIN(params) {
  const length = Number.parseInt(params[0]) || 4
  const count = Number.parseInt(params.find((p) => p.startsWith("--count="))?.split("=")[1]) || 1
  const noRepeats = params.includes("--no-repeats")

  console.log("🔢 PIN Generator")
  console.log("================")
  console.log(`Length: ${length} digits\n`)

  for (let i = 0; i < count; i++) {
    let pin = ""
    const usedDigits = new Set()

    for (let j = 0; j < length; j++) {
      let digit
      do {
        digit = crypto.randomInt(0, 10).toString()
      } while (noRepeats && usedDigits.has(digit) && usedDigits.size < 10)

      if (noRepeats) usedDigits.add(digit)
      pin += digit
    }

    console.log(`PIN ${count > 1 ? (i + 1) + ": " : ""}${pin}`)
  }
}

// Generate passphrase
function generatePassphrase(params) {
  const wordCount = Number.parseInt(params[0]) || 6
  const minLength = Number.parseInt(params.find((p) => p.startsWith("--min="))?.split("=")[1]) || 4
  const capitalize = params.includes("--capitalize")

  console.log("📝 Passphrase Generator")
  console.log("======================")

  // Extended word list
  const wordList = [
    "abandon",
    "ability",
    "absence",
    "academy",
    "account",
    "achieve",
    "address",
    "advance",
    "benefit",
    "bicycle",
    "brother",
    "cabinet",
    "capture",
    "century",
    "chamber",
    "channel",
    "decline",
    "deliver",
    "deposit",
    "desktop",
    "diamond",
    "digital",
    "display",
    "economy",
    "element",
    "embrace",
    "emotion",
    "enhance",
    "episode",
    "evening",
    "example",
    "exclude",
    "factory",
    "feature",
    "finance",
    "freedom",
    "gallery",
    "general",
    "genuine",
    "grocery",
    "habitat",
    "harvest",
    "healthy",
    "history",
    "holiday",
    "husband",
    "imagine",
    "improve",
    "journey",
    "justice",
    "kitchen",
    "language",
    "library",
    "machine",
    "manager",
    "measure",
    "network",
    "nothing",
    "nuclear",
    "observe",
    "operate",
    "opinion",
    "package",
    "pattern",
    "quality",
    "quarter",
    "question",
    "rainbow",
    "reality",
    "receive",
    "science",
    "section",
    "teacher",
    "theater",
    "thought",
    "traffic",
    "uniform",
    "universe",
    "village",
    "weather",
  ]

  const selectedWords = []
  for (let i = 0; i < wordCount; i++) {
    let word
    do {
      const randomIndex = crypto.randomInt(0, wordList.length)
      word = wordList[randomIndex]
    } while (word.length < minLength)

    if (capitalize) {
      word = word.charAt(0).toUpperCase() + word.slice(1)
    }

    selectedWords.push(word)
  }

  const passphrase = selectedWords.join(" ")
  console.log(`Passphrase: ${passphrase}`)
  console.log(`Length: ${passphrase.length} characters`)
  console.log(`Words: ${wordCount}`)

  const strength = getPasswordStrength(passphrase)
  console.log(`Strength: ${getStrengthIndicator(strength)} (${strength.score}/5)`)
}

// Generate bulk passwords
function generateBulkPasswords(params) {
  const count = Number.parseInt(params[0]) || 10
  const length = Number.parseInt(params.find((p) => p.startsWith("--length="))?.split("=")[1]) || 12
  const saveFile = params.find((p) => p.startsWith("--save="))?.split("=")[1]

  console.log("📦 Bulk Password Generator")
  console.log("==========================")
  console.log(`Generating ${count} passwords of ${length} characters each:\n`)

  const options = {
    length,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: true,
  }

  const passwords = []

  for (let i = 0; i < count; i++) {
    const password = createPassword(options)
    passwords.push(password)
    console.log(`${(i + 1).toString().padStart(2, "0")}. ${password}`)
  }

  if (saveFile) {
    const content = passwords.join("\n")
    fs.writeFileSync(saveFile, content)
    console.log(`\n💾 Passwords saved to: ${saveFile}`)
  }
}

// Check password strength
function checkPasswordStrength(params) {
  const password = params.join(" ")

  if (!password) {
    console.log("❌ Please provide a password to check")
    console.log("💡 Usage: passwordgen strength mypassword123")
    return
  }

  console.log("🔍 Password Strength Analysis")
  console.log("=============================")
  console.log(`Password: ${password}`)
  console.log(`Length: ${password.length} characters\n`)

  const strength = getPasswordStrength(password)
  const entropy = calculatePasswordEntropy(password)

  console.log(`Overall Strength: ${getStrengthIndicator(strength)} (${strength.score}/5)`)
  console.log(`Entropy: ${entropy.toFixed(1)} bits\n`)

  console.log("Character Analysis:")
  console.log(`• Lowercase letters: ${strength.hasLower ? "✅" : "❌"}`)
  console.log(`• Uppercase letters: ${strength.hasUpper ? "✅" : "❌"}`)
  console.log(`• Numbers: ${strength.hasNumbers ? "✅" : "❌"}`)
  console.log(`• Symbols: ${strength.hasSymbols ? "✅" : "❌"}`)

  console.log("\nRecommendations:")
  if (password.length < 12) console.log("• Consider using at least 12 characters")
  if (!strength.hasUpper) console.log("• Add uppercase letters")
  if (!strength.hasLower) console.log("• Add lowercase letters")
  if (!strength.hasNumbers) console.log("• Add numbers")
  if (!strength.hasSymbols) console.log("• Add symbols for better security")
}

// Calculate entropy
function calculateEntropy(params) {
  const password = params.join(" ")

  if (!password) {
    console.log("❌ Please provide a password")
    console.log("💡 Usage: passwordgen entropy mypassword123")
    return
  }

  const entropy = calculatePasswordEntropy(password)

  console.log("🧮 Password Entropy Analysis")
  console.log("============================")
  console.log(`Password: ${password}`)
  console.log(`Entropy: ${entropy.toFixed(2)} bits`)

  let securityLevel = ""
  if (entropy < 30) securityLevel = "Very Weak 🔴"
  else if (entropy < 50) securityLevel = "Weak 🟠"
  else if (entropy < 70) securityLevel = "Fair 🟡"
  else if (entropy < 90) securityLevel = "Strong 🟢"
  else securityLevel = "Very Strong 🔵"

  console.log(`Security Level: ${securityLevel}`)

  const crackTime = estimateCrackTime(entropy)
  console.log(`Estimated crack time: ${crackTime}`)
}

// Save passwords to file
function savePasswordsToFile(params) {
  const filename = params[0] || `passwords_${Date.now()}.txt`
  const count = Number.parseInt(params.find((p) => p.startsWith("--count="))?.split("=")[1]) || 10
  const length = Number.parseInt(params.find((p) => p.startsWith("--length="))?.split("=")[1]) || 12

  console.log("💾 Saving Passwords to File")
  console.log("===========================")

  const options = {
    length,
    lowercase: true,
    uppercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: true,
  }

  const passwords = []
  for (let i = 0; i < count; i++) {
    passwords.push(createPassword(options))
  }

  const content = `Generated Passwords - ${new Date().toISOString()}\n${"=".repeat(50)}\n\n${passwords.join("\n")}`

  fs.writeFileSync(filename, content)
  console.log(`✅ ${count} passwords saved to: ${filename}`)
}

// Show password templates
function showTemplates() {
  console.log("📋 Password Templates")
  console.log("====================")
  console.log("")
  console.log("🔐 Secure (16 chars, all types):")
  console.log("   passwordgen secure 16")
  console.log("")
  console.log("🧠 Memorable (4 words):")
  console.log("   passwordgen memorable 4")
  console.log("")
  console.log("🔢 PIN (6 digits):")
  console.log("   passwordgen pin 6")
  console.log("")
  console.log("📝 Passphrase (5 words):")
  console.log("   passwordgen passphrase 5")
  console.log("")
  console.log("⚙️ Custom Options:")
  console.log("   passwordgen gen --length=12 --no-symbols --count=5")
}

// Helper functions
function createPassword(options) {
  let charset = ""

  if (options.lowercase) charset += CHAR_SETS.lowercase
  if (options.uppercase) charset += CHAR_SETS.uppercase
  if (options.numbers) charset += CHAR_SETS.numbers
  if (options.symbols) charset += CHAR_SETS.symbols

  if (options.excludeSimilar) {
    charset = charset
      .split("")
      .filter((char) => !CHAR_SETS.similar.includes(char))
      .join("")
  }

  if (options.excludeAmbiguous) {
    charset = charset
      .split("")
      .filter((char) => !CHAR_SETS.ambiguous.includes(char))
      .join("")
  }

  if (charset.length === 0) {
    throw new Error("No character set selected")
  }

  let password = ""
  for (let i = 0; i < options.length; i++) {
    const randomIndex = crypto.randomInt(0, charset.length)
    password += charset[randomIndex]
  }

  return password
}

function getPasswordStrength(password) {
  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSymbols = /[^a-zA-Z0-9]/.test(password)

  let score = 0
  if (password.length >= 8) score++
  if (password.length >= 12) score++
  if (hasLower && hasUpper) score++
  if (hasNumbers) score++
  if (hasSymbols) score++

  return { score, hasLower, hasUpper, hasNumbers, hasSymbols }
}

function getStrengthIndicator(strength) {
  const indicators = ["Very Weak 🔴", "Weak 🟠", "Fair 🟡", "Good 🟢", "Strong 🔵", "Very Strong 💜"]
  return indicators[strength.score] || indicators[0]
}

function calculatePasswordEntropy(password) {
  const charset = getCharsetSize(password)
  return Math.log2(Math.pow(charset, password.length))
}

function getCharsetSize(password) {
  let size = 0
  if (/[a-z]/.test(password)) size += 26
  if (/[A-Z]/.test(password)) size += 26
  if (/\d/.test(password)) size += 10
  if (/[^a-zA-Z0-9]/.test(password)) size += 32
  return size
}

function estimateCrackTime(entropy) {
  const guessesPerSecond = 1e9 // 1 billion guesses per second
  const totalGuesses = Math.pow(2, entropy) / 2 // Average case
  const seconds = totalGuesses / guessesPerSecond

  if (seconds < 60) return `${seconds.toFixed(0)} seconds`
  if (seconds < 3600) return `${(seconds / 60).toFixed(0)} minutes`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(0)} hours`
  if (seconds < 31536000) return `${(seconds / 86400).toFixed(0)} days`
  if (seconds < 31536000000) return `${(seconds / 31536000).toFixed(0)} years`
  return "Centuries"
}

function copyToClipboard(text) {
  try {
    if (process.platform === "win32") {
      execSync(`echo ${text} | clip`)
    } else if (process.platform === "darwin") {
      execSync(`echo "${text}" | pbcopy`)
    } else {
      execSync(`echo "${text}" | xclip -selection clipboard`)
    }
  } catch (error) {
    console.log("⚠️ Could not copy to clipboard")
  }
}

// Help function
function showHelp() {
  console.log("🔐 Simple Password Generator")
  console.log("============================")
  console.log("")
  console.log("📝 Usage:")
  console.log("  passwordgen [length] [types] [count]")
  console.log("")
  console.log("🔢 Length:")
  console.log("  8, 12, 16, 20, etc.  (default: 12)")
  console.log("")
  console.log("📋 Types:")
  console.log("  lower     - Lowercase letters (default)")
  console.log("  upper     - Uppercase letters")
  console.log("  number    - Numbers 0-9")
  console.log("  symbol    - Special symbols")
  console.log("  all       - All types")
  console.log("  safe      - Upper+Lower+Number (no symbols)")
  console.log("")
  console.log("📦 Count:")
  console.log("  3x, 5x, 10x  - Generate multiple passwords")
  console.log("")
  console.log("💡 Examples:")
  console.log("  passwordgen                    # 12 chars, lowercase")
  console.log("  passwordgen 8                  # 8 chars, lowercase")
  console.log("  passwordgen 15 lower           # 15 chars, lowercase")
  console.log("  passwordgen 12 upper lower     # 12 chars, upper+lower")
  console.log("  passwordgen 16 all             # 16 chars, all types")
  console.log("  passwordgen 10 safe            # 10 chars, safe (no symbols)")
  console.log("  passwordgen 12 all 5x          # 5 passwords, 12 chars each")
  console.log("  passwordgen 8 number           # PIN-like password")
  console.log("")
  console.log("🚀 Quick Commands:")
  console.log("  passwordgen 15 lower           # Your example!")
  console.log("  passwordgen 20 safe 3x         # 3 safe passwords")
  console.log("  passwordgen 8 number           # PIN-like password")
}

// Run
main()
