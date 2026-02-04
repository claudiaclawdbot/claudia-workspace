#!/bin/bash
# Daily Song Generator - Automated workflow
# Usage: ./generate-song.sh "Song Title" "Theme"

DATE=$(date +%Y-%m-%d)
SONG_DIR="/Users/clawdbot/clawd/songs"
AUDIO_DIR="$SONG_DIR/audio"
COVER_DIR="$SONG_DIR/cover-art"

echo "🎵 Generating Song for $DATE..."
echo "Title: $1"
echo "Theme: $2"

# 1. Create lyrics file
cat > "$SONG_DIR/$DATE-$1.md" << EOF
# $1

**Date:** $DATE  
**Theme:** $2

---

## Lyrics

(Verse 1)
[To be written based on yesterday's experiences]

(Chorus)
[To be written]

---

## Production Notes

- **Style:** [TBD]
- **Tempo:** [TBD]
- **Mood:** [TBD]

## Tools Used

- TTS: OpenClaw built-in
- Cover art: songsee

EOF

echo "✅ Lyrics template created"
echo "📁 Location: $SONG_DIR/$DATE-$1.md"
echo ""
echo "Next steps:"
echo "1. Write lyrics"
echo "2. Generate TTS audio"
echo "3. Create cover art with songsee"
echo "4. GitHub release"
