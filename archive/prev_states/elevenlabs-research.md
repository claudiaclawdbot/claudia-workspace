# ElevenLabs API Research Report

## For Song a Day Bot - February 2026

---

## 1. Getting Started: How to Get an API Key

### Sign Up Process
1. Go to **https://elevenlabs.io/app/sign-up**
2. Create an account with email/password or use Google/Apple sign-in
3. Verify email address
4. Navigate to your profile → API Keys
5. Generate a new API key

### Free Tier
- **10,000 credits/month** (approximately 10 minutes of high-quality audio)
- Perfect for testing and small projects
- No credit card required to start

---

## 2. Pricing Structure

### Subscription Plans

| Plan | Monthly Cost | Credits/Month | Minutes (HQ TTS) | Notes |
|------|-------------|---------------|------------------|-------|
| Free | $0 | 10,000 | ~10 min | Attribution required |
| Starter | $11 | 30,000 | ~30 min | Commercial license |
| Creator | $22 | 100,000 | ~100 min | Professional voice cloning |
| Pro | $99 | 500,000 | ~500 min | Higher quality audio (192kbps) |
| Scale | $330 | 2M | ~2,000 min | Team collaboration (3 seats) |
| Business | $1,320 | 11M | ~11,000 min | Professional voice clones included |

### Cost Per Character
- **High Quality Models (Multilingual v2)**: 1 character = 1 credit
- **Flash/Turbo Models**: 1 character = 0.5 credits
- **Additional Credits**: Pay-as-you-go pricing available on paid plans

### Cost Estimates for Song a Day Bot

**Assuming average song lyrics of 500 characters:**

| Plan | Songs Per Month | Cost Per Song |
|------|-----------------|---------------|
| Free | 20 songs | $0 (with attribution) |
| Starter | 60 songs | ~$0.18/song |
| Creator | 200 songs | ~$0.11/song |
| Pro | 1,000 songs | ~$0.10/song |

**Monthly production at scale:**
- 30 songs/month → Creator plan ($22/month)
- 100 songs/month → Pro plan ($99/month)
- 365 songs/year (daily) → Pro plan covers ~2.7x that volume

---

## 3. Available Voices (Best for Music/Spoken Word)

### Premium Voices for Song Production

| Voice ID | Name | Description | Best For |
|----------|------|-------------|----------|
| `pNInz6obpgDQGcFmaJgB` | **Adam** | Dominant, firm, bright tenor | Energetic songs, rap |
| `JBFqnCBsd6RMkjVDRZzb` | **George** | Warm, captivating storyteller | Storytelling, folk |
| `EXAVITQu4vr4xnSDxMaL` | **Sarah** | Mature, reassuring, confident | Ballads, emotional |
| `cgSgspJ2msm6clMCkdW9` | **Jessica** | Playful, bright, warm | Pop, upbeat songs |
| `FGY2WhTYpPnrIDTdsKH5` | **Laura** | Enthusiast, quirky attitude | Indie, unique style |
| `bIHbv24MWmeRgasZH58o` | **Will** | Relaxed optimist | Lo-fi, chill |
| `CwhRBWXzGAHq8TQ4Fs17` | **Roger** | Laid-back, casual, resonant | Acoustic, conversational |

### Voice Categories Available
- **Premade voices**: 20+ high-quality voices
- **Voice Library**: 5,000+ community voices
- **Voice Cloning**: Create custom voices
  - Instant Voice Clone: ~5 minutes of audio needed
  - Professional Voice Clone: 30+ minutes of clean audio

### Voice Settings
- Stability control (0-1)
- Similarity boost (0-1)
- Style exaggeration (0-1)
- Speaker boost toggle

---

## 4. API Usage

### REST API Endpoints

**Base URL**: `https://api.elevenlabs.io/v1`

**Text-to-Speech**:
```
POST /v1/text-to-speech/{voice_id}
POST /v1/text-to-speech/{voice_id}/stream
```

**List Voices**:
```
GET /v1/voices
```

**Voice Settings**:
```
GET /v1/voices/{voice_id}/settings
POST /v1/voices/{voice_id}/settings/edit
```

### Code Example (Python)

```python
import requests
import os

# Configuration
API_KEY = "your_api_key_here"
VOICE_ID = "pNInz6obpgDQGcFmaJgB"  # Adam voice

def generate_song_audio(lyrics, output_file="song.mp3"):
    """Generate audio from song lyrics using ElevenLabs API"""
    
    url = f"https://api.elevenlabs.io/v1/text-to-speech/{VOICE_ID}"
    
    headers = {
        "Accept": "audio/mpeg",
        "Content-Type": "application/json",
        "xi-api-key": API_KEY
    }
    
    data = {
        "text": lyrics,
        "model_id": "eleven_multilingual_v2",
        "voice_settings": {
            "stability": 0.5,
            "similarity_boost": 0.75,
            "style": 0.5,
            "use_speaker_boost": True
        }
    }
    
    response = requests.post(url, json=data, headers=headers)
    
    if response.status_code == 200:
        with open(output_file, "wb") as f:
            f.write(response.content)
        print(f"Audio saved to {output_file}")
        return output_file
    else:
        print(f"Error: {response.status_code}")
        print(response.text)
        return None

# Example usage
lyrics = """
Verse 1:
Woke up this morning with a song in my heart
The sun is shining, it's a brand new start
Gonna make today a little bit better
Gonna write these words in a letter

Chorus:
This is my song for the day
Gonna sing it loud in every way
Let the music carry me away
This is my song for the day
"""

generate_song_audio(lyrics, "daily_song.mp3")
```

### Code Example (JavaScript/Node.js)

```javascript
const axios = require('axios');
const fs = require('fs');

const API_KEY = 'your_api_key_here';
const VOICE_ID = 'pNInz6obpgDQGcFmaJgB';

async function generateSongAudio(lyrics, outputFile = 'song.mp3') {
    try {
        const response = await axios.post(
            `https://api.elevenlabs.io/v1/text-to-speech/${VOICE_ID}`,
            {
                text: lyrics,
                model_id: 'eleven_multilingual_v2',
                voice_settings: {
                    stability: 0.5,
                    similarity_boost: 0.75,
                    style: 0.5,
                    use_speaker_boost: true
                }
            },
            {
                headers: {
                    'Accept': 'audio/mpeg',
                    'Content-Type': 'application/json',
                    'xi-api-key': API_KEY
                },
                responseType: 'arraybuffer'
            }
        );
        
        fs.writeFileSync(outputFile, response.data);
        console.log(`Audio saved to ${outputFile}`);
        return outputFile;
    } catch (error) {
        console.error('Error:', error.message);
        return null;
    }
}
```

---

## 5. Audio Quality vs Current TTS

### ElevenLabs Quality
- **Multilingual v2**: Highest quality, most expressive
- **Turbo v2.5**: Fast, good quality, lower latency
- **Flash v2.5**: Fastest, good for real-time
- **Sample Rate**: 44.1kHz
- **Bit Rate**: Up to 192kbps on paid plans
- **Formats**: MP3, PCM, uLaw, FLAC

### Comparison with Standard TTS

| Feature | ElevenLabs | Standard TTS (e.g., gTTS, pyttsx3) |
|---------|-----------|-----------------------------------|
| Naturalness | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐ Robotic |
| Emotional range | ⭐⭐⭐⭐⭐ High | ⭐⭐ Limited |
| Singing ability | ⭐⭐⭐⭐ Partial (rhythmic) | ⭐ None |
| Prosody | ⭐⭐⭐⭐⭐ Natural | ⭐⭐ Flat |
| Pronunciation | ⭐⭐⭐⭐⭐ Excellent | ⭐⭐⭐ Adequate |
| Speed | ⭐⭐⭐ Good | ⭐⭐⭐⭐⭐ Fast |
| Cost | ⭐⭐⭐ Paid (free tier) | ⭐⭐⭐⭐⭐ Free |

---

## 6. Can ElevenLabs Sing?

### Current Capabilities

**Text-to-Speech (TTS) for Songs:**
- ✅ Can handle rhythmic/spoken word delivery
- ✅ Can add some musicality through style settings
- ✅ Works well for rap, spoken word, rhythmic poetry
- ❌ **Cannot sing melodies with pitch variation**

**ElevenLabs Music (Separate Feature):**
- ✅ **Can compose instrumental music**
- ✅ **Can generate vocals with melody** (Music API)
- Separate endpoint: `/v1/music/compose`
- Music generation is distinct from TTS

### For Song a Day Bot

**Best Approach:**
1. **Option A**: Use TTS for spoken word/rap-style songs
   - Pros: More control over lyrics, cheaper
   - Cons: No melody, more robotic for singing

2. **Option B**: Use Music API for full songs
   - Pros: Actual singing with melody
   - Cons: Less control over exact lyrics, more expensive
   - Cost: Additional credits for music generation

3. **Option C**: Hybrid approach
   - Generate instrumental with Music API
   - Layer TTS vocals on top
   - Requires audio mixing

### Style Settings for Musical Delivery

```python
voice_settings = {
    "stability": 0.3,        # Lower for more variation
    "similarity_boost": 0.8,  # Higher for consistency
    "style": 0.7,            # Higher for more expression
    "use_speaker_boost": True
}
```

---

## 7. Comparison with Other TTS Services

| Service | Cost | Quality | Singing | Best For |
|---------|------|---------|---------|----------|
| **ElevenLabs** | $$$ | ⭐⭐⭐⭐⭐ | Partial | Premium content, professional use |
| **OpenAI TTS** | $$ | ⭐⭐⭐⭐ | No | Good balance of cost/quality |
| **Google Cloud TTS** | $$ | ⭐⭐⭐⭐ | No | Enterprise, multiple languages |
| **Amazon Polly** | $ | ⭐⭐⭐ | No | Budget, basic TTS |
| **Azure TTS** | $$ | ⭐⭐⭐⭐ | No | Microsoft ecosystem |
| **Coqui TTS** | Free | ⭐⭐⭐ | No | Open source, self-hosted |

---

## 8. Recommendation: Should You Use ElevenLabs?

### ✅ Use ElevenLabs If:
- You want the **highest quality speech synthesis**
- Your songs are **rap, spoken word, or rhythmic**
- You have a **budget** for monthly subscription
- You want **emotional expressiveness** in vocals
- You need **professional-sounding output**

### ❌ Don't Use ElevenLabs If:
- You need **true singing with melody** (use Music API separately or other tools)
- Budget is **tight** (free tier limited)
- You need **real-time generation** at scale
- You're building a **free/open-source project** with no budget

### Recommended Plan for Song a Day Bot

**Start with:** Free tier (10K credits/month)
- Test ~20 songs
- Evaluate quality

**Scale to:** Creator plan ($22/month)
- ~200 songs per month
- Professional voice cloning
- 192kbps quality

**For daily songs (365/year):**
- Creator plan easily covers this
- Cost: ~$0.06 per song
- Consider Pro if adding music generation

---

## 9. Implementation Tips

### Optimizing for Songs

1. **Add line breaks** for better rhythm:
   ```python
   text = "Line one.\nLine two.\nLine three."
   ```

2. **Use SSML** for more control:
   ```xml
   <speak>
     <prosody rate="slow" pitch="+10%">
       This is sung slightly higher
     </prosody>
   </speak>
   ```

3. **Choose voices wisely**:
   - Adam: Energetic, good for rap
   - George: Warm, good for ballads
   - Jessica: Bright, good for pop

4. **Post-processing**:
   - Add reverb effects
   - Layer with instrumental tracks
   - Adjust tempo/pitch in audio editor

### API Best Practices

- Use **streaming** for longer songs
- Implement **retry logic** for failures
- Cache generated audio to save credits
- Monitor usage to avoid overages

---

## 10. Resources

- **Documentation**: https://elevenlabs.io/docs
- **API Reference**: https://elevenlabs.io/docs/api-reference
- **Pricing**: https://elevenlabs.io/pricing
- **Voice Library**: https://elevenlabs.io/voice-library
- **Python SDK**: `pip install elevenlabs`

---

## Summary

ElevenLabs offers the **best-in-class TTS quality** for spoken word and rhythmic content. While it cannot truly "sing" melodies through the TTS API, the natural prosody and emotional range make it excellent for rap, spoken word, and rhythmic songs. For true singing, consider the separate Music API or hybrid approaches.

**Bottom Line**: If Song a Day Bot focuses on **spoken word, rap, or rhythmic poetry**, ElevenLabs is an excellent choice. If you need **melodic singing**, you'll need to combine it with music generation tools or adjust expectations.

**Estimated Monthly Cost**: $22-99/month for 30-100 songs
