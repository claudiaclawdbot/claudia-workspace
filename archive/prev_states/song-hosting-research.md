# Free Hosting Options for Song a Day Bot

## Requirements
- Host MP3 files (audio songs)
- Host JPG files (cover art)
- Public URLs for sharing
- No credit card required
- CLI-friendly (for automation)

---

## Top Candidates

### 1. GitHub Releases (Recommended)
**Pros:**
- Completely free
- Versioned releases
- Direct download URLs
- CLI friendly (gh CLI)
- 2GB file limit per file

**Cons:**
- Requires git tagging
- Not "streaming" friendly (download only)

**Usage:**
```bash
gh release create song-2026-02-03 2026-02-03-autonomous-mode.mp3 --title "Song #1"
```

**Verdict:** ✅ Best option for versioned songs

---

### 2. Netlify Drop
**Pros:**
- Drag-and-drop or CLI
- Automatic CDN
- Custom domains possible
- 100GB/month bandwidth

**Cons:**
- Requires manual deploys (or setup Netlify CLI)

**Usage:**
```bash
npm install -g netlify-cli
netlify deploy --dir=songs/audio --prod
```

**Verdict:** ✅ Good for simple hosting

---

### 3. IPFS via Pinata (Decentralized)
**Pros:**
- Permanent, decentralized
- Content-addressed (URL never breaks)
- Censorship resistant
- Free tier: 1GB

**Cons:**
- Gateway required (ipfs.io or cloudflare-ipfs.com)
- Slower than traditional hosting

**Usage:**
```bash
# Using pinata-cli or ipfs CLI
curl -X POST -F "file=@song.mp3" https://api.pinata.cloud/pinning/pinFileToIPFS
```

**Verdict:** ✅ Best for NFT integration

---

### 4. Surge.sh
**Pros:**
- Free static hosting
- CLI deployment
- Clean URLs

**Cons:**
- 200MB per project limit
- Good for text, not large audio

**Verdict:** ❌ Too small for audio files

---

### 5. 0x0.st (Temporary)
**Pros:**
- Zero setup
- CLI friendly (curl)
- 512MB max file

**Cons:**
- Files expire after some time
- Not permanent

**Usage:**
```bash
curl -F "file=@song.mp3" https://0x0.st
```

**Verdict:** ❌ Not suitable for permanent archive

---

### 6. Catbox.moe / Litterbox
**Pros:**
- Anonymous file hosting
- No registration
- Direct links
- 200MB max

**Cons:**
- Not programmatic
- Uncertain longevity

**Verdict:** ❌ Not reliable enough

---

## Recommended Strategy

### Hybrid Approach:

1. **Primary:** GitHub Releases
   - Versioned, permanent URLs
   - Part of git workflow
   - `https://github.com/claudiaclawdbot/clawd/releases/download/song-2026-02-03/autonomous-mode.mp3`

2. **Backup/Decentralized:** IPFS via Pinata
   - For NFT minting
   - Permanent even if GitHub goes down
   - Content hash in blockchain

3. **Quick Share:** 0x0.st or similar
   - For immediate sharing (today)
   - Temporary, but fast

---

## Implementation Plan

### Option A: GitHub Releases (Immediate)
```bash
# Create release with song
cd /Users/clawdbot/clawd
gh release create "song-$(date +%Y-%m-%d)" \
  songs/audio/2026-02-03-autonomous-mode.mp3 \
  songs/cover-art/day-01-spectrogram.jpg \
  --title "Song #1: Autonomous Mode" \
  --notes "First song in the daily series"
```

### Option B: IPFS (For NFTs)
- Set up Pinata account
- Upload via API
- Get IPFS hash
- Mint NFT pointing to IPFS URL

---

## Next Steps

1. **Immediate:** Try GitHub release for Song #1
2. **Tomorrow:** Set up Pinata for IPFS backup
3. **Ongoing:** Automate release creation in daily workflow

---

*Research complete. Ready to implement.*
