// === Icons & Helper Functions ===
// File ini berisi semua fungsi helper dan icon management

import path from 'path';

// === Icon Functions ===
export function getAppIcon(filePath) {
  const name = path.basename(filePath).toLowerCase();
  
  // Game launchers
  if (name.includes('steam')) return '🎮';
  if (name.includes('epic')) return '🎮';
  if (name.includes('origin')) return '🎮';
  if (name.includes('uplay') || name.includes('ubisoft')) return '🎮';
  if (name.includes('battle') && name.includes('net')) return '🎮';
  
  // Specific games - Adventure/RPG
  if (name.includes('genshin') || name.includes('honkai')) return '⚔️';
  if (name.includes('minecraft')) return '🧱';
  if (name.includes('terraria')) return '⛏️';
  if (name.includes('stardew')) return '🌾';
  if (name.includes('witcher')) return '🗡️';
  if (name.includes('skyrim') || name.includes('elder scrolls')) return '🏰';
  if (name.includes('cyberpunk')) return '🤖';
  if (name.includes('assassin')) return '🗡️';
  
  // FPS Games
  if (name.includes('valorant') || name.includes('csgo') || name.includes('cs2')) return '🔫';
  if (name.includes('pubg') || name.includes('battlegrounds')) return '🔫';
  if (name.includes('apex') || name.includes('legends')) return '🔫';
  if (name.includes('overwatch')) return '🔫';
  if (name.includes('call of duty') || name.includes('cod')) return '🔫';
  if (name.includes('battlefield')) return '🔫';
  if (name.includes('doom')) return '🔫';
  if (name.includes('halo')) return '🔫';
  
  // MOBA Games
  if (name.includes('league') || name.includes('legends')) return '🏆';
  if (name.includes('dota')) return '🏆';
  if (name.includes('heroes') && name.includes('storm')) return '🏆';
  
  // Racing Games
  if (name.includes('forza')) return '🏎️';
  if (name.includes('need for speed') || name.includes('nfs')) return '🏎️';
  if (name.includes('gran turismo')) return '🏎️';
  
  // Sports Games
  if (name.includes('fifa')) return '⚽';
  if (name.includes('pes') || name.includes('efootball')) return '⚽';
  if (name.includes('nba')) return '🏀';
  if (name.includes('madden')) return '🏈';
  
  // Strategy Games
  if (name.includes('civilization') || name.includes('civ')) return '🏛️';
  if (name.includes('age of empires')) return '🏛️';
  if (name.includes('starcraft')) return '🚀';
  if (name.includes('total war')) return '⚔️';
  
  // Recording/Streaming
  if (name.includes('obs')) return '📹';
  if (name.includes('streamlabs')) return '📺';
  if (name.includes('bandicam')) return '🎬';
  if (name.includes('camtasia')) return '🎞️';
  if (name.includes('fraps')) return '📹';
  if (name.includes('shadowplay')) return '📹';
  if (name.includes('xsplit')) return '📺';
  
  // Communication
  if (name.includes('discord')) return '💬';
  if (name.includes('telegram')) return '💬';
  if (name.includes('whatsapp')) return '💬';
  if (name.includes('skype')) return '💬';
  if (name.includes('slack')) return '💬';
  if (name.includes('zoom')) return '📞';
  if (name.includes('teams')) return '📞';
  if (name.includes('meet')) return '📞';
  
  // Browsers
  if (name.includes('chrome')) return '🌐';
  if (name.includes('firefox')) return '🦊';
  if (name.includes('edge')) return '🌀';
  if (name.includes('brave')) return '🦁';
  if (name.includes('opera')) return '🎭';
  if (name.includes('vivaldi')) return '🌐';
  if (name.includes('safari')) return '🧭';
  
  // Creative Tools - Adobe
  if (name.includes('photoshop')) return '🎨';
  if (name.includes('illustrator')) return '🎨';
  if (name.includes('premiere')) return '🎬';
  if (name.includes('after effects')) return '🎞️';
  if (name.includes('lightroom')) return '📸';
  if (name.includes('indesign')) return '📄';
  if (name.includes('audition')) return '🎵';
  
  // Creative Tools - Other
  if (name.includes('blender')) return '🎨';
  if (name.includes('maya')) return '🎨';
  if (name.includes('3ds max')) return '🎨';
  if (name.includes('cinema 4d')) return '🎨';
  if (name.includes('unity')) return '🎮';
  if (name.includes('unreal')) return '🎮';
  if (name.includes('gimp')) return '🎨';
  if (name.includes('paint.net')) return '🎨';
  if (name.includes('krita')) return '🎨';
  
  // Development Tools
  if (name.includes('visual studio code') || name.includes('vscode')) return '💻';
  if (name.includes('visual studio')) return '💻';
  if (name.includes('intellij')) return '💻';
  if (name.includes('pycharm')) return '🐍';
  if (name.includes('webstorm')) return '💻';
  if (name.includes('atom')) return '💻';
  if (name.includes('sublime')) return '💻';
  if (name.includes('notepad++')) return '📝';
  if (name.includes('git')) return '📚';
  
  // Media Players
  if (name.includes('spotify')) return '🎵';
  if (name.includes('vlc')) return '🎥';
  if (name.includes('media player')) return '🎥';
  if (name.includes('itunes')) return '🎵';
  if (name.includes('winamp')) return '🎵';
  if (name.includes('foobar')) return '🎵';
  if (name.includes('musicbee')) return '🎵';
  
  // Utilities
  if (name.includes('winrar') || name.includes('7zip')) return '📦';
  if (name.includes('ccleaner')) return '🧹';
  if (name.includes('malwarebytes')) return '🛡️';
  if (name.includes('antivirus')) return '🛡️';
  if (name.includes('firewall')) return '🛡️';
  if (name.includes('vpn')) return '🔒';
  if (name.includes('torrent')) return '⬇️';
  
  // Office Suite
  if (name.includes('word')) return '📝';
  if (name.includes('excel')) return '📊';
  if (name.includes('powerpoint')) return '📊';
  if (name.includes('outlook')) return '📧';
  if (name.includes('onenote')) return '📓';
  if (name.includes('libreoffice')) return '📄';
  
  // File type fallback
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.lnk') return '🔗';
  if (ext === '.exe') return '⚙️';
  
  return '📱'; // Default icon
}

// === Game Category Functions ===
export function getGameCategory(gameName) {
  const name = gameName.toLowerCase();
  
  // Game Launchers
  if (name.includes('steam') || name.includes('epic') || name.includes('origin') || 
      name.includes('uplay') || name.includes('battle')) {
    return '🎮 Game Launchers';
  }
  
  // Adventure/RPG Games
  if (name.includes('genshin') || name.includes('honkai') || name.includes('minecraft') ||
      name.includes('terraria') || name.includes('stardew') || name.includes('witcher') ||
      name.includes('skyrim') || name.includes('cyberpunk') || name.includes('assassin')) {
    return '⚔️ Adventure & RPG';
  }
  
  // FPS Games
  if (name.includes('valorant') || name.includes('csgo') || name.includes('cs2') ||
      name.includes('pubg') || name.includes('apex') || name.includes('overwatch') ||
      name.includes('call of duty') || name.includes('cod') || name.includes('battlefield') ||
      name.includes('doom') || name.includes('halo')) {
    return '🔫 FPS Games';
  }
  
  // MOBA Games
  if (name.includes('league') || name.includes('dota') || name.includes('heroes')) {
    return '🏆 MOBA Games';
  }
  
  // Racing Games
  if (name.includes('forza') || name.includes('need for speed') || name.includes('nfs') ||
      name.includes('gran turismo')) {
    return '🏎️ Racing Games';
  }
  
  // Sports Games
  if (name.includes('fifa') || name.includes('pes') || name.includes('nba') ||
      name.includes('madden') || name.includes('efootball')) {
    return '⚽ Sports Games';
  }
  
  // Strategy Games
  if (name.includes('civilization') || name.includes('civ') || name.includes('age of empires') ||
      name.includes('starcraft') || name.includes('total war')) {
    return '🏛️ Strategy Games';
  }
  
  // Communication Apps
  if (name.includes('discord') || name.includes('telegram') || name.includes('whatsapp') ||
      name.includes('skype') || name.includes('slack') || name.includes('zoom') ||
      name.includes('teams') || name.includes('meet')) {
    return '💬 Communication';
  }
  
  // Recording/Streaming
  if (name.includes('obs') || name.includes('streamlabs') || name.includes('bandicam') ||
      name.includes('camtasia') || name.includes('fraps') || name.includes('xsplit')) {
    return '📹 Recording & Streaming';
  }
  
  // Browsers
  if (name.includes('chrome') || name.includes('firefox') || name.includes('edge') ||
      name.includes('brave') || name.includes('opera') || name.includes('vivaldi') ||
      name.includes('safari')) {
    return '🌐 Web Browsers';
  }
  
  // Creative Tools
  if (name.includes('photoshop') || name.includes('illustrator') || name.includes('premiere') ||
      name.includes('after effects') || name.includes('blender') || name.includes('maya') ||
      name.includes('unity') || name.includes('unreal') || name.includes('gimp')) {
    return '🎨 Creative Tools';
  }
  
  // Development Tools
  if (name.includes('visual studio') || name.includes('vscode') || name.includes('intellij') ||
      name.includes('pycharm') || name.includes('webstorm') || name.includes('atom') ||
      name.includes('sublime') || name.includes('git')) {
    return '💻 Development Tools';
  }
  
  // Media Players
  if (name.includes('spotify') || name.includes('vlc') || name.includes('media player') ||
      name.includes('itunes') || name.includes('winamp') || name.includes('musicbee')) {
    return '🎵 Media Players';
  }
  
  // Office Suite
  if (name.includes('word') || name.includes('excel') || name.includes('powerpoint') ||
      name.includes('outlook') || name.includes('onenote') || name.includes('libreoffice')) {
    return '📄 Office Suite';
  }
  
  // Utilities
  if (name.includes('winrar') || name.includes('7zip') || name.includes('ccleaner') ||
      name.includes('malwarebytes') || name.includes('antivirus') || name.includes('vpn')) {
    return '🔧 Utilities';
  }
  
  return '📱 Other Applications';
}

// === Game Detection Functions ===
export function isLikelyGame(fileName) {
  const gameKeywords = [
    // General game terms
    'game', 'play', 'launcher',
    
    // Game launchers
    'steam', 'epic', 'origin', 'uplay', 'battle', 'gog',
    
    // Popular games
    'genshin', 'honkai', 'minecraft', 'terraria', 'stardew',
    'valorant', 'league', 'dota', 'csgo', 'cs2', 'pubg', 'apex',
    'overwatch', 'fortnite', 'call of duty', 'cod', 'battlefield',
    'fifa', 'pes', 'nba', 'madden', 'forza', 'gta', 'cyberpunk',
    'witcher', 'assassin', 'skyrim', 'fallout', 'doom', 'halo',
    'civilization', 'civ', 'age of empires', 'starcraft', 'diablo',
    'world of warcraft', 'wow', 'destiny', 'borderlands', 'bioshock',
    'mass effect', 'dragon age', 'final fantasy', 'resident evil',
    'silent hill', 'metal gear', 'dark souls', 'sekiro', 'elden ring'
  ];
  
  return gameKeywords.some(keyword => fileName.includes(keyword));
}

export function isPopularApp(fileName) {
  const popularApps = [
    // Communication
    'discord', 'telegram', 'whatsapp', 'skype', 'slack',
    'zoom', 'teams', 'meet',
    
    // Browsers
    'chrome', 'firefox', 'edge', 'brave', 'opera', 'vivaldi', 'safari',
    
    // Media
    'spotify', 'vlc', 'media player', 'itunes', 'winamp', 'musicbee',
    
    // Creative
    'photoshop', 'illustrator', 'premiere', 'after effects', 'lightroom',
    'blender', 'maya', '3ds max', 'unity', 'unreal', 'gimp', 'krita',
    
    // Development
    'visual studio', 'vscode', 'intellij', 'pycharm', 'webstorm',
    'atom', 'sublime', 'notepad++', 'git',
    
    // Recording/Streaming
    'obs', 'streamlabs', 'bandicam', 'camtasia', 'fraps', 'xsplit',
    
    // Office
    'word', 'excel', 'powerpoint', 'outlook', 'onenote', 'libreoffice',
    
    // Utilities
    'winrar', '7zip', 'ccleaner', 'malwarebytes', 'antivirus', 'vpn'
  ];
  
  return popularApps.some(app => fileName.includes(app));
}

// === String Similarity Functions ===
export function calculateSimilarity(str1, str2) {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
}

export function levenshteinDistance(str1, str2) {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
}

// === Keyword Processing Functions ===
export function generateKeywordVariations(keyword) {
  const variations = [keyword.toLowerCase()];
  
  // Remove spaces
  variations.push(keyword.replace(/\s+/g, ''));
  
  // Replace spaces with underscore and dash
  variations.push(keyword.replace(/\s+/g, '_'));
  variations.push(keyword.replace(/\s+/g, '-'));
  
  // Individual words
  const words = keyword.toLowerCase().split(/\s+/);
  variations.push(...words);
  
  // Acronym
  if (words.length > 1) {
    variations.push(words.map(w => w[0]).join(''));
  }
  
  // Common abbreviations
  const abbreviations = {
    'call of duty': 'cod',
    'counter strike': 'cs',
    'player unknown battlegrounds': 'pubg',
    'grand theft auto': 'gta',
    'need for speed': 'nfs',
    'world of warcraft': 'wow',
    'league of legends': 'lol',
    'defense of the ancients': 'dota',
    'visual studio code': 'vscode'
  };
  
  const keywordLower = keyword.toLowerCase();
  Object.keys(abbreviations).forEach(full => {
    if (keywordLower.includes(full)) {
      variations.push(abbreviations[full]);
    }
    if (keywordLower === abbreviations[full]) {
      variations.push(full);
    }
  });
  
  return [...new Set(variations)];
}

export function calculateRelevanceScore(fileName, keyword) {
  let score = 0;
  
  // Exact match - highest score
  if (fileName === keyword) score += 100;
  
  // Starts with keyword
  if (fileName.startsWith(keyword)) score += 80;
  
  // Contains keyword
  if (fileName.includes(keyword)) score += 60;
  
  // Word matching
  const keywordWords = keyword.split(/\s+/);
  const fileWords = fileName.split(/[\s\-_\.]/);
  
  keywordWords.forEach(kw => {
    fileWords.forEach(fw => {
      if (fw === kw) score += 40;
      else if (fw.includes(kw) || kw.includes(fw)) score += 20;
    });
  });
  
  // Similarity bonus
  score += calculateSimilarity(fileName, keyword) * 30;
  
  // Length penalty (prefer shorter, more specific names)
  score -= fileName.length * 0.1;
  
  // Bonus for popular games/apps
  if (isLikelyGame(fileName) || isPopularApp(fileName)) {
    score += 10;
  }
  
  return score;
}

export function isAdvancedMatch(fileName, keyword) {
  const keywordWords = keyword.split(/\s+/);
  
  // Exact match
  if (fileName.includes(keyword)) return true;
  
  // All words present
  if (keywordWords.every(word => fileName.includes(word))) return true;
  
  // Any significant word present
  if (keywordWords.length > 1 && keywordWords.some(word => word.length > 2 && fileName.includes(word))) return true;
  
  // Similarity check
  if (calculateSimilarity(fileName, keyword) > 0.3) return true;
  
  // Word boundary matching
  const fileWords = fileName.split(/[\s\-_\.]/);
  if (fileWords.some(word => keywordWords.some(kw => word.includes(kw) || kw.includes(word)))) return true;
  
  return false;
}

// === Utility Functions ===
export function groupGamesByCategory(games) {
  const grouped = {};
  
  games.forEach(game => {
    const category = game.category;
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(game);
  });
  
  // Sort categories by priority
  const categoryOrder = [
    '🎮 Game Launchers',
    '⚔️ Adventure & RPG',
    '🔫 FPS Games',
    '🏆 MOBA Games',
    '🏎️ Racing Games',
    '⚽ Sports Games',
    '🏛️ Strategy Games',
    '💬 Communication',
    '📹 Recording & Streaming',
    '🌐 Web Browsers',
    '🎨 Creative Tools',
    '💻 Development Tools',
    '🎵 Media Players',
    '📄 Office Suite',
    '🔧 Utilities',
    '📱 Other Applications'
  ];
  
  const sortedGrouped = {};
  categoryOrder.forEach(category => {
    if (grouped[category]) {
      sortedGrouped[category] = grouped[category];
    }
  });
  
  // Add any remaining categories not in the order
  Object.keys(grouped).forEach(category => {
    if (!sortedGrouped[category]) {
      sortedGrouped[category] = grouped[category];
    }
  });
  
  return sortedGrouped;
}