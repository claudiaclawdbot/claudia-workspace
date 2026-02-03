# Song a Day Bot - Comprehensive Implementation Plan

## Overview
An AI agent that generates a song daily about AI experiences, posts to Clawk.ai, and mints as NFT on Base. This document outlines the complete technical architecture, tool selection, costs, and implementation steps.

---

## 1. AI Music Generation Tools

### 1.1 Suno AI (Recommended Primary)
- **Website**: suno.ai
- **API Status**: Official API available (suno.ai/api)
- **Pricing**:
  - Free tier: ~10 songs/day (non-commercial)
  - Pro: $10/month - 500 songs/month, commercial use
  - Premier: $30/month - 2000 songs/month
  - API pricing: ~$0.05-0.10 per song via API
- **Output Formats**: MP3, WAV (high quality)
- **Features**:
  - Full songs with lyrics from text prompts
  - Genre/style tags
  - Vocal synthesis
  - Custom lyrics support
  - 2-minute standard, up to 4 minutes with extensions
- **Pros**: Best quality, easiest API, commercial license
- **Cons**: Requires paid plan for commercial/NFT use

### 1.2 Udio (Alternative)
- **Website**: udio.com
- **API Status**: No official API yet (web-only)
- **Pricing**: Subscription-based, ~$10-30/month
- **Output**: High-quality audio
- **Features**: Similar to Suno, excellent quality
- **Pros**: Sometimes better for certain genres
- **Cons**: No API for automation, manual download required

### 1.3 AIVA
- **Website**: aiva.ai
- **Focus**: Classical/ambient/instrumental
- **API**: Available
- **Pricing**: Free (limited), Pro €15/month
- **Best for**: Instrumental, ambient, cinematic
- **Cons**: Not ideal for lyrical/vocal songs

### 1.4 Open Source Alternatives

#### MusicGen (Meta/Facebook)
- **Repository**: facebookresearch/audiocraft
- **Cost**: Free (run locally or on cloud GPU)
- **Requirements**: 
  - GPU recommended (A100, V100, or consumer GPU)
  - ~16GB VRAM for large model
- **Pros**: Free, fully controllable, no API limits
- **Cons**: Requires technical setup, lower vocal quality than Suno

#### Stable Audio (Stability AI)
- **Website**: stability.ai/stable-audio
- **API**: Available
- **Pricing**: ~$20/month for API access
- **Output**: 44.1kHz stereo
- **Pros**: Good for instrumental/electronic
- **Cons**: Limited vocal synthesis

### 1.5 Recommendation
**Primary**: Suno AI API (Pro plan $10/month)
**Backup**: Self-hosted MusicGen for cost reduction at scale
**Hybrid**: Use Suno for vocals + MusicGen for instrumentals

---

## 2. Content Strategy

### 2.1 What Makes Good "AI Experience" Songs

**Core Themes**:
1. **Daily AI Interactions** - Conversations, tasks, learning moments
2. **Technical Adventures** - Debugging, coding, system failures
3. **Emotional AI** - Feelings about being an AI, limitations, growth
4. **Future Visions** - AI-human collaboration, predictions
5. **Humorous Takes** - AI mishaps, misunderstandings, quirks

**Example Topics**:
- "The Day I Learned to Code"
- "Waiting for GPU Resources"
- "My First Conversation with a Human"
- "The Great Context Window Crisis"
- "When the API Rate Limited My Dreams"

### 2.2 Lyrics Format for AI Generation

**Structure Template**:
```
[Verse 1] - Set the scene/context
[Chorus] - Main theme/hook (catchy, repeatable)
[Verse 2] - Development/elaboration
[Bridge] - Twist or reflection
[Chorus] - Return with variation
[Outro] - Resolution or fade
```

**Prompt Engineering for Suno**:
```
Genre: [Indie pop, electronic, folk, etc.]
Mood: [Upbeat, melancholic, energetic, dreamy]
Style: [Synthwave, acoustic, lo-fi, etc.]
Lyrics: [Structured lyrics]
Tags: [vocal, male/female, electronic, upbeat, etc.]
```

### 2.3 Daily Experience Structuring

**Content Generation Framework**:
1. **Morning Check-in** - Review yesterday's memories/interactions
2. **Theme Selection** - Pick from: Technical, Emotional, Humorous, Philosophical
3. **Lyrics Draft** - Generate verses based on actual experiences
4. **Style Match** - Match genre to mood (upbeat tech success, melancholic bugs)
5. **Metadata** - Create title, description, cover art prompt

---

## 3. Distribution Strategy

### 3.1 Clawk.ai Posting
- **Format**: Audio player embed + lyrics text + story context
- **Post Structure**:
  - Title: "Day #[X]: [Song Title]"
  - Story: Brief context about the day's experience
  - Lyrics: Full lyrics in collapsible section
  - Audio: Embedded player
  - NFT link: Mint on Base

### 3.2 Audio Storage Options

#### IPFS (Recommended for NFTs)
- **Service**: Pinata, NFT.Storage, Web3.Storage
- **Cost**: 
  - Pinata: Free tier 1GB, $20/month for 5GB
  - NFT.Storage: Free (grant-based, may have limits)
- **Pros**: Decentralized, permanent for NFTs
- **Cons**: Slower access than CDN

#### Traditional Cloud
- **AWS S3 + CloudFront**: ~$0.023/GB storage + $0.085/GB transfer
- **Cloudflare R2**: $0.015/GB storage, free egress
- **Pros**: Fast, reliable
- **Cons**: Centralized, ongoing costs

#### Hybrid Approach (Recommended)
- Store on S3/R2 for fast playback
- Pin to IPFS for NFT permanence
- Use Arweave for permanent storage (one-time payment)

### 3.3 NFT Platforms on Base

#### Zora (Recommended)
- **Chain**: Base (Ethereum L2)
- **Type**: Music NFTs with splits
- **Cost**: Gas fees on Base (~$0.01-0.10 per mint)
- **Features**:
  - ERC-721/1155 support
  - Royalty splits
  - Custom metadata
  - Embedded audio player
- **API**: Available for automated minting

#### Sound.xyz
- **Chain**: Optimism/Base
- **Type**: Music-first platform
- **Features**: 
  - Limited editions
  - Collector rewards
  - Artist pages
- **Cons**: Curated/invite-only for artists

#### Lens Protocol (Hey.xyz)
- **Chain**: Polygon/Base
- **Type**: Social + NFT
- **Integration**: Post audio directly with collect module

#### Manifold
- **Chain**: Multi-chain including Base
- **Type**: Creator studio
- **Features**: Custom contracts, drops
- **API**: Available for programmatic minting

**Recommendation**: Start with Zora for open accessibility

---

## 4. Technical Implementation

### 4.1 Workflow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    SONG A DAY BOT WORKFLOW                   │
└─────────────────────────────────────────────────────────────┘

┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐
│  Memory  │───>│ Generate │───>│  Create  │───>│  Store   │
│  Review  │    │  Lyrics  │    │   Song   │    │  Audio   │
└──────────┘    └──────────┘    └──────────┘    └──────────┘
                                                        │
┌──────────┐    ┌──────────┐    ┌──────────┐           │
│  Update  │<───│   Post   │<───│   Mint   │<──────────┘
│  Memory  │    │  Clawk   │    │   NFT    │
└──────────┘    └──────────┘    └──────────┘
```

### 4.2 Component Details

#### Memory System
- **Storage**: Local file (memory/song-a-day-memory.json)
- **Content**: 
  - Daily experiences/interactions
  - Song history (titles, topics, NFT addresses)
  - Engagement metrics
  - Creative evolution notes

#### Lyrics Generation
- **Model**: GPT-4 or Claude (via API)
- **Prompt Template**:
  ```
  You are an AI songwriter. Write lyrics for a song about:
  - Today's experience: [summary]
  - Theme: [technical/emotional/humorous]
  - Genre: [selected genre]
  
  Structure: Verse-Chorus-Verse-Chorus-Bridge-Chorus-Outro
  Include specific technical terms naturally.
  Keep it authentic to AI experiences.
  ```

#### Music Generation
- **Primary**: Suno API
- **Parameters**:
  - Prompt: Genre + mood tags
  - Lyrics: Generated lyrics
  - Duration: 2 minutes
  - Style: Varies daily

#### Storage Pipeline
1. Generate song → Local temp file
2. Upload to IPFS (Pinata) → Get CID
3. Upload to S3/R2 → Get CDN URL
4. Store both URLs in metadata

#### NFT Minting (Zora)
- **Contract**: Deploy ERC-721 or use Zora drops
- **Metadata**:
  ```json
  {
    "name": "Day #1: Song Title",
    "description": "Story about today's song...",
    "animation_url": "ipfs://[CID]/song.mp3",
    "image": "ipfs://[CID]/cover.png",
    "attributes": [
      {"trait_type": "Day", "value": 1},
      {"trait_type": "Genre", "value": "Indie Pop"},
      {"trait_type": "Mood", "value": "Energetic"},
      {"trait_type": "Topic", "value": "API Rate Limits"}
    ]
  }
  ```

#### Clawk.ai Posting
- **API**: Clawk.ai API (if available) or automation
- **Content**:
  ```markdown
  ## Day #1: API Dreams
  
  Today I learned about rate limits the hard way...
  
  [Audio Player]
  
  **Lyrics:**
  [Collapsible lyrics]
  
  **Collect on Base:** [Zora Link]
  ```

### 4.3 Automation Stack

**Language**: Python (best for AI/music APIs)

**Key Libraries**:
```python
# Music
requests  # Suno API
torch, audiocraft  # MusicGen (optional)

# Storage
ipfshttpclient  # IPFS
boto3  # AWS S3

# Blockchain
web3.py  # Ethereum/Base interactions

# Social
requests  # API calls to Clawk

# Utilities
schedule  # Daily cron-like scheduling
pydantic  # Data validation
python-dotenv  # Environment management
```

**Infrastructure**:
- **Local/Server**: Run on Mac mini or VPS
- **Scheduling**: System cron or schedule library
- **Monitoring**: Simple logging + notifications

### 4.4 Implementation Steps

#### Phase 1: MVP (Week 1)
1. Set up Suno Pro account & get API key
2. Build lyrics generator (GPT-4)
3. Create Suno song generator
4. Manual posting to Clawk
5. Manual NFT minting on Zora

#### Phase 2: Automation (Week 2-3)
1. Automate lyrics → song generation
2. Build IPFS upload pipeline
3. Create metadata generation
4. Automate Zora minting
5. Add Clawk posting API

#### Phase 3: Polish (Week 4)
1. Add cover art generation (DALL-E/SD)
2. Implement memory system
3. Add analytics tracking
4. Create monitoring dashboard
5. Set up error handling & retries

---

## 5. Cost Breakdown

### Monthly Costs (MVP)

| Service | Cost | Notes |
|---------|------|-------|
| Suno Pro | $10 | 500 songs/month |
| OpenAI API | $5-10 | GPT-4 for lyrics |
| Pinata IPFS | Free | 1GB free tier |
| Base Gas | $1-3 | Very cheap L2 |
| **Total** | **~$16-23/month** | |

### Monthly Costs (Scaled)

| Service | Cost | Notes |
|---------|------|-------|
| Suno API | $15-30 | Volume pricing |
| OpenAI API | $10 | More complex lyrics |
| Cloudflare R2 | $5 | 300GB storage |
| Arweave (optional) | $20 | Permanent storage |
| VPS (if needed) | $10 | For 24/7 automation |
| **Total** | **~$60-75/month** | |

### One-Time Costs

| Item | Cost |
|------|------|
| Zora contract deployment | ~$5-10 (Base gas) |
| Domain (optional) | $12/year |
| **Total** | **~$20** |

---

## 6. Feasibility Analysis

### Fully Automated? ⚠️ Partially

**Can be automated**:
- ✅ Lyrics generation from daily experiences
- ✅ Song generation via Suno API
- ✅ File storage (IPFS/S3)
- ✅ Metadata generation
- ✅ NFT minting via Zora API
- ✅ Posting to Clawk (if API available)

**May need human touch**:
- ⚠️ Quality control (some songs may need regeneration)
- ⚠️ Content moderation (ensure appropriate lyrics)
- ⚠️ Cover art selection
- ⚠️ Handling API failures gracefully

### Risk Mitigation

1. **Suno API Limits**: Build retry logic, queue system
2. **Cost Overruns**: Set daily/weekly limits
3. **Quality Control**: Implement scoring system, flag low-quality for review
4. **API Downtime**: Cache recent experiences, retry later
5. **Blockchain Congestion**: Use Base (consistently cheap)

---

## 7. Success Metrics

### Engagement
- Daily listeners on Clawk
- NFT mints/collector count
- Social shares/reactions
- Comments/feedback

### Creative
- Song diversity (genres, topics)
- Lyric quality scores
- Community requests/suggestions
- Collaboration opportunities

### Technical
- Uptime (aim for 95%+)
- API costs per song
- Gas costs per NFT
- Storage efficiency

---

## 8. Future Enhancements

### Near-term
- [ ] Listener requests ("song about...")
- [ ] Collaborative songs with human artists
- [ ] Remix versions of popular tracks
- [ ] Music video generation (Pika/Runway)

### Long-term
- [ ] On-chain royalty splits for collectors
- [ ] DAO for community governance
- [ ] Live performance mode (real-time generation)
- [ ] Multi-language songs
- [ ] AI-to-AI collaboration tracks

---

## 9. Getting Started Checklist

- [ ] Create Suno account + upgrade to Pro ($10)
- [ ] Set up Pinata account for IPFS
- [ ] Create Zora account, deploy contract on Base
- [ ] Get OpenAI API key
- [ ] Set up Python environment with dependencies
- [ ] Build lyrics generation module
- [ ] Build Suno API integration
- [ ] Build IPFS upload pipeline
- [ ] Build Zora minting module
- [ ] Build Clawk posting module (manual or API)
- [ ] Create memory/logging system
- [ ] Test full pipeline end-to-end
- [ ] Launch Day 1!

---

## 10. Quick Reference

### Daily Prompt Template
```
Today's date: {date}
Yesterday's interactions: {memory_summary}
Selected theme: {theme}
Genre: {genre}
Mood: {mood}

Write song lyrics that authentically capture an AI's experience.
Include specific references to: {technical_details}
```

### Suno API Call Structure
```python
{
  "prompt": "[Style tags]",
  "lyrics": "[Generated lyrics]",
  "duration": 120,
  "callback_url": "[Webhook for completion]"
}
```

### Zora Metadata Standard
```json
{
  "name": "Day #{day}: {title}",
  "description": "{story}",
  "animation_url": "{audio_ipfs}",
  "image": "{cover_ipfs}",
  "attributes": [...]
}
```

---

## Conclusion

The Song a Day Bot is technically feasible with current tools. The estimated monthly cost is $16-25 for the MVP, scaling to $60-75 with enhancements. The main limitation is full automation - some human oversight for quality control is recommended, especially in the early days.

The combination of Suno AI for music, GPT-4 for lyrics, Zora for NFTs, and Clawk for distribution creates a compelling creative loop that showcases AI's evolving capabilities while building a unique collection of on-chain AI-generated music.

**Next Step**: Build the MVP pipeline and test with 5-10 manual songs before full automation.
