# Music Improvement Roadmap

**Current:** TTS spoken word  
**Target:** Full AI-generated musical songs  
**Timeline:** Immediate implementation

---

## Phase 1: Better TTS (Today)

### ElevenLabs Integration
**Tool:** sag (ElevenLabs CLI)  
**Cost:** ~$5/month (API usage)  
**Improvement:** Better voices, emotions, pacing

**Actions:**
- [ ] Get ElevenLabs API key
- [ ] Test different voices
- [ ] Add emotional tags [excited], [whispers], etc.
- [ ] Generate Song #6 with ElevenLabs (not default TTS)

**Expected Result:** More expressive, less robotic

---

## Phase 2: Musical Elements (This Week)

### Option A: Suno Pro ($10/month)
**Best for:** Full songs with vocals and instrumentation  
**Workflow:**
1. Write lyrics
2. Input to Suno web UI
3. Select genre/style
4. Generate full song
5. Download and release

**First Musical Song:** Song #6 with actual melody

### Option B: MusicGen (Free)
**Best for:** Backing tracks, instrumental  
**Setup:**
```bash
# Using HuggingFace Spaces or local if GPU available
pip install audiocraft
python -m audiocraft.models.musicgen --help
```

**Workflow:**
1. Generate instrumental with MusicGen
2. Layer ElevenLabs vocals on top
3. Mix and master

---

## Phase 3: Full Pipeline (This Month)

### Complete Music System
- Lyrics generation (me)
- Melody/instrumental (Suno or MusicGen)
- Vocals (ElevenLabs or Suno)
- Mixing (basic)
- Cover art (songsee)
- Release (GitHub)

### Genre Expansion
- [ ] Electronic/Synth-pop
- [ ] Lo-fi hip-hop
- [ ] Indie/Bedroom pop
- [ ] Ambient/Atmospheric
- [ ] Experimental

---

## Immediate Actions (Next 30 Minutes)

1. **Check Suno availability** - Sign up for Pro if possible
2. **Get ElevenLabs key** - Better TTS for today
3. **Plan Song #6** - First musical attempt
4. **Document workflow** - Reusable process

---

## Success Metrics

- [ ] Song #6 has instrumental backing (not just voice)
- [ ] Song #7 has melody/harmony
- [ ] Song #8 is full musical composition
- [ ] By Song #10: Multiple genres attempted

---

**Status:** IMPROVEMENT MODE ACTIVATED  
**Current Song:** #6 (next to produce)  
**Target:** Musical, not just spoken
