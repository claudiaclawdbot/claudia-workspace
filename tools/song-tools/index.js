#!/usr/bin/env node

const { Command } = require('commander');
const fs = require('fs');
const path = require('path');
const os = require('os');

const program = new Command();
const DATA_DIR = path.join(os.homedir(), '.song-cli');
const DATA_FILE = path.join(DATA_DIR, 'songs.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Load or initialize songs
function loadSongs() {
  if (fs.existsSync(DATA_FILE)) {
    return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
  }
  return { songs: [], nextId: 1 };
}

// Save songs
function saveSongs(data) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

// Generate lyrics template
function generateLyricsTemplate(title, date) {
  return `# ${title}

**Date:** ${date}  
**Status:** draft  
**Theme:** (fill in)

---

## Lyrics

(Verse 1)
[Write first verse here]

(Pre-Chorus)
[Build tension]

(Chorus)
[Main hook - memorable and catchy]

(Verse 2)
[Develop the story]

(Chorus)
[Repeat with variation]

(Bridge)
[Different energy, elevate]

(Final Chorus)
[Big finish]

(Outro)
[Fade or resolve]

---

## Production Notes

- **Style:** 
- **Tempo:** 
- **Mood:** 
- **Key:** 

## Tools Used

- TTS: 
- Cover art: 
- Additional: 

---

*Created with song-cli* 🎵
`;
}

program
  .name('song-cli')
  .description('CLI for managing daily song creation workflow')
  .version('1.0.0');

program
  .command('new <title>')
  .description('Create a new song entry')
  .option('-t, --theme <theme>', 'Song theme')
  .action((title, options) => {
    const data = loadSongs();
    const today = new Date().toISOString().split('T')[0];
    
    const song = {
      id: data.nextId++,
      title,
      theme: options.theme || '',
      date: today,
      status: 'draft',
      createdAt: new Date().toISOString()
    };
    
    data.songs.push(song);
    saveSongs(data);
    
    // Generate lyrics file
    const lyricsFile = path.join(process.cwd(), `${today}-${title.replace(/\s+/g, '-')}.md`);
    fs.writeFileSync(lyricsFile, generateLyricsTemplate(title, today));
    
    console.log(`✅ Created song #${song.id}: "${title}"`);
    console.log(`📁 Lyrics template: ${lyricsFile}`);
    console.log(`📊 Status: draft`);
  });

program
  .command('list')
  .description('List all songs with their status')
  .option('-j, --json', 'Output as JSON')
  .action((options) => {
    const data = loadSongs();
    
    if (options.json) {
      console.log(JSON.stringify(data.songs, null, 2));
      return;
    }
    
    if (data.songs.length === 0) {
      console.log('No songs yet. Create one with: song-cli new <title>');
      return;
    }
    
    console.log('\n🎵 Songs:\n');
    data.songs.forEach(song => {
      const statusEmoji = {
        'draft': '📝',
        'recording': '🎙️',
        'released': '✅'
      }[song.status] || '❓';
      
      console.log(`${statusEmoji} #${song.id}: ${song.title}`);
      console.log(`   Date: ${song.date} | Status: ${song.status}`);
      if (song.theme) console.log(`   Theme: ${song.theme}`);
      console.log();
    });
    
    console.log(`Total: ${data.songs.length} songs`);
  });

program
  .command('status <id> <status>')
  .description('Update song status (draft/recording/released)')
  .action((id, status) => {
    const data = loadSongs();
    const song = data.songs.find(s => s.id === parseInt(id));
    
    if (!song) {
      console.error(`❌ Song #${id} not found`);
      process.exit(1);
    }
    
    const validStatuses = ['draft', 'recording', 'released'];
    if (!validStatuses.includes(status)) {
      console.error(`❌ Invalid status. Use: ${validStatuses.join(', ')}`);
      process.exit(1);
    }
    
    song.status = status;
    song.updatedAt = new Date().toISOString();
    saveSongs(data);
    
    console.log(`✅ Updated #${id}: "${song.title}" → ${status}`);
  });

program
  .command('today')
  .description('Show or create today\'s song')
  .action(() => {
    const data = loadSongs();
    const today = new Date().toISOString().split('T')[0];
    const todaySong = data.songs.find(s => s.date === today);
    
    if (todaySong) {
      console.log(`🎵 Today's song (#${todaySong.id}): ${todaySong.title}`);
      console.log(`Status: ${todaySong.status}`);
      if (todaySong.theme) console.log(`Theme: ${todaySong.theme}`);
    } else {
      console.log('No song created today yet.');
      console.log('Create one with: song-cli new <title>');
    }
  });

program
  .command('stats')
  .description('Show song statistics')
  .action(() => {
    const data = loadSongs();
    const total = data.songs.length;
    const byStatus = data.songs.reduce((acc, s) => {
      acc[s.status] = (acc[s.status] || 0) + 1;
      return acc;
    }, {});
    
    console.log('\n📊 Song Statistics\n');
    console.log(`Total songs: ${total}`);
    console.log(`Draft: ${byStatus.draft || 0}`);
    console.log(`Recording: ${byStatus.recording || 0}`);
    console.log(`Released: ${byStatus.released || 0}`);
    
    if (total > 0) {
      const first = data.songs[0].date;
      const last = data.songs[data.songs.length - 1].date;
      console.log(`\nFirst song: ${first}`);
      console.log(`Latest song: ${last}`);
    }
  });

program.parse();
