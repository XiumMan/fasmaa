# Launch Sequence Audio Guide (Updated)

This guide provides detailed timing specifications for creating voice-over and sound effect audio files for the FASMAA Launch Sequence.

## Audio File Locations

- **Voice-overs**: `/public/audio/launch/`
- **Sound Effects**: `/public/audio/launch/sfx/`

## Quick Reference: Updated Durations
```
Boot Sequence:      ~8 seconds  (faster now - 250ms intervals)
Network Grid:       12 seconds  (unchanged)
Countdown:           6 seconds  (unchanged)
Name Reveal:         3.5 seconds (reduced from 5 seconds)
Features:           18 seconds  (unchanged - 6 features × 3 seconds)
Logo/Launch:         8 seconds  (unchanged)
```

---

## 1. Boot Sequence Stage (~8 seconds - FASTER)
**File**: `boot-sequence.mp3`

**Duration**: ~8 seconds (UPDATED - sequence now runs faster)
**Suggested Content**:
- Opening narration about system initialization
- Example: "Initializing FASMAA surveillance system. Loading infection prevention protocols. Establishing secure connections across healthcare units."

**Timing Notes**:
- Starts immediately when boot screen appears
- Background for the terminal code animation (now 250ms per line instead of 400ms)
- Should be calm and technical in tone
- Can overlap with terminal beep sounds
- **FASTER PACE** - narration should be more concise

---

## 2. Network Grid Stage (12 seconds)
**File**: `network-activation.mp3`

**Duration**: ~12 seconds
**Suggested Content**:
- Narration about network connections being established
- Example: "Connecting to hospital network nodes. Hulhumale Hospital Emergency Room, ICU, Surgical Ward, Pediatric Ward, Gynecology, Laboratory, Pharmacy. All facilities now online and secured."

**Timing Notes**:
- Starts when network grid appears
- Nodes appear at: 0s, 1.2s, 2.4s, 3.6s, 4.8s, 6.0s, 7.2s, 8.4s
- List facilities in sync with their visual appearance
- Background sound effects (beeps and swooshes) will play automatically

**Sound Effects** (Auto-played):
- `beep.mp3` - Short beep sound (plays at each node activation)
- `swoosh.mp3` - Connection line sound (plays when lines draw between nodes)

---

## 3. Countdown Stage (6 seconds)
**File**: `countdown.mp3`

**Duration**: ~6 seconds
**Suggested Content**:
- Build-up narration or simple countdown
- Example: "System ready. Launching FASMAA platform in 5... 4... 3... 2... 1..."
- Alternative: "All systems operational. Initiating official launch sequence."

**Timing Notes**:
- Countdown shows boot-style loading messages
- Countdown timer counts from 5 to 0 over 6 seconds
- Can either narrate the countdown or build anticipation
- Should transition energy from technical to celebratory

---

## 4. Features Showcase Stage (18 seconds)
**File**: `features.mp3`

**Duration**: ~18 seconds total (6 features × 3 seconds each)

**Features in Order**:
1. **Real-time IPC Surveillance** (0-3 sec)
2. **Outbreak Detection** (3-6 sec)
3. **Antimicrobial Stewardship** (6-9 sec)
4. **Automated Reporting** (9-12 sec)
5. **Clinical Decision Support** (12-15 sec)
6. **Advanced Analytics** (15-18 sec)

**Suggested Content**:
Each feature gets approximately **3 seconds** of narration:

- **0-3s**: "Real-time surveillance across the Maldives healthcare system."
- **3-6s**: "Instant outbreak detection with automated cluster analysis."
- **6-9s**: "Antimicrobial stewardship for optimized treatment protocols."
- **9-12s**: "Automated compliance reporting to the Ministry of Health."
- **12-15s**: "Clinical decision support for infection prevention."
- **15-18s**: "Advanced analytics with predictive modeling capabilities."

**Timing Notes**:
- Each feature displays for exactly 3 seconds
- Narration should be concise and match visual transitions
- Tone should be confident and showcase capabilities

---

## 5. Logo/Launch Stage (6+ seconds)
**File**: `logo-reveal.mp3`

**Duration**: ~6 seconds (before loading bar appears) + ~2.5 seconds (loading bar)
**Total**: ~8.5 seconds

**Suggested Content**:
- Grand reveal and celebration
- Example: "Ladies and gentlemen, we are proud to officially launch FASMAA - the Facility Alert System for Microbial Monitoring and Antimicrobial Action. Securing healthcare, together."

**Timing Notes**:
- Logo appears at 0s
- "SYSTEM ONLINE" message at 2s
- "OFFICIALLY LAUNCHED" at 2.5s
- Loading bar starts at 3.5s and takes 2.5 seconds to reach 100%
- Total stage duration before redirect: ~6 seconds
- This is the climax - should be the most impactful narration
- Can include applause or celebratory sounds

---

## Recording Specifications

### Technical Requirements
- **Format**: MP3
- **Bit Rate**: 192 kbps or higher
- **Sample Rate**: 44.1 kHz or 48 kHz
- **Channels**: Stereo
- **Volume**: Normalized to -3dB to prevent clipping

### Voice-Over Guidelines
- **Tone**: Professional, confident, slightly formal
- **Pace**: Moderate - clear enunciation
- **Accent**: Neutral English (or Maldivian English if preferred)
- **Gender**: Your choice based on ceremony preference

### Sound Effects (Optional - if creating custom ones)
- `beep.mp3`:
  - Duration: 100-200ms
  - Sound: Short, high-pitched beep (like radar ping)
  - Volume: Moderate (will be played at 40% in code)

- `swoosh.mp3`:
  - Duration: 300-500ms
  - Sound: Whoosh/swoosh (like data transmission)
  - Volume: Moderate (will be played at 30% in code)

---

## Complete Launch Sequence Timeline (UPDATED)

| Time | Stage | Duration | Audio File |
|------|-------|----------|------------|
| 0:00 | Standby Screen | Variable (until user clicks) | - |
| 0:00 | TV Turn On | 1 sec | - |
| 0:01 | Boot Sequence | ~8 sec | `boot-sequence.mp3` (FASTER) |
| 0:09 | TV Turn Off | 1.2 sec | - |
| 0:10 | Video 1 (with audio) | 8 sec | Video embedded audio |
| 0:18 | Network Grid | 12 sec | `network-activation.mp3` + SFX |
| 0:30 | Video 2 (with audio) | 8 sec | Video embedded audio |
| 0:38 | Countdown | 6 sec | `countdown.mp3` |
| 0:44 | Name Reveal | 3.5 sec | Optional narration |
| 0:47 | Features | 18 sec | `features.mp3` |
| 1:05 | Logo/Launch | 8.5 sec | `logo-reveal.mp3` |
| 1:13 | Redirect to Dashboard | - | - |

**Total Duration**: ~73 seconds from activation to dashboard (includes videos)

---

## Testing Your Audio

1. Place your audio files in the correct directories
2. Access the launch page at: `http://localhost:3000/launch`
3. Click "LAUNCH PLATFORM" to start the sequence
4. Listen for timing alignment with visuals
5. Adjust narration pacing if needed

---

## Notes

- All audio playback happens at 70% volume (adjustable in code)
- Audio is optional - the sequence works without audio
- **Videos have their own embedded audio tracks** - MP3 files are for additional narration only
- Consider background music underneath narration for production version
- May want to record multiple takes and choose the best timing

---

## Quick Reference: Narration Time Windows (UPDATED)

```
Boot Sequence:      ~8 seconds  - Technical initialization narration (FASTER)
Network Grid:       12 seconds  - Facility connection narration
Countdown:           6 seconds  - Build-up or countdown
Name Reveal:         3.5 seconds - Optional brief narration (SHORTER)
Features:           18 seconds  - 6 features × 3 seconds each
Logo/Launch:        8 seconds  - Grand finale celebration
```

---

## AI Voice Generation Prompt

Use this prompt with AI voice generation tools (ElevenLabs, Google Cloud TTS, etc.):

### Boot Sequence (~8 seconds)
```
Create a calm, technical narration with a professional male/female voice. Pace should be moderate and clear:

"Initializing FASMAA surveillance system. Loading infection prevention protocols. Establishing secure connections."

Duration: 8 seconds
Style: Professional, technical, calm
Pace: Moderate (must fit in 8 seconds)
```

### Network Activation (12 seconds)
```
Create a confident narration listing hospital facilities:

"Connecting to hospital network nodes. Hulhumale Hospital: Emergency Room, ICU, Surgical Ward, Pediatric Ward, Gynecology, Laboratory, Pharmacy. All facilities now online and secured."

Duration: 12 seconds
Style: Confident, reassuring
Pace: Steady, synchronized with visual node appearances
```

### Countdown (6 seconds)
```
Create a build-up narration with increasing energy:

"All systems operational. Initiating official launch sequence. Five... Four... Three... Two... One..."

Duration: 6 seconds
Style: Building anticipation, celebratory
Pace: Countdown matches visual timer
```

### Features Showcase (18 seconds - 6 parts)
```
Create concise narration for each feature, 3 seconds each:

Part 1 (0-3s): "Real-time surveillance across the Maldives healthcare system."
Part 2 (3-6s): "Instant outbreak detection with automated cluster analysis."
Part 3 (6-9s): "Antimicrobial stewardship for optimized treatment protocols."
Part 4 (9-12s): "Automated compliance reporting to the Ministry of Health."
Part 5 (12-15s): "Clinical decision support for infection prevention teams."
Part 6 (15-18s): "Advanced analytics with predictive modeling capabilities."

Duration: 18 seconds total
Style: Confident, showcase each feature
Pace: 3 seconds per feature exactly
```

### Logo Reveal (8 seconds)
```
Create a grand, celebratory narration:

"Ladies and gentlemen, we proudly launch FASMAA - the Facility Alert System for Microbial Monitoring and Antimicrobial Action. Securing healthcare, together."

Duration: 8 seconds
Style: Grand, celebratory, proud
Pace: Slower, impactful delivery
```

---

## Background Music Suggestions

Adding background music can enhance the professional feel of the launch sequence. Here are suggested music tracks for each stage:

### 1. Boot Sequence & Network Grid (~20 seconds combined)
**Style**: Minimal, techy, ambient
**Mood**: Professional, focused, building anticipation
**Suggested Tracks**:
- "Technology Background" by AudioJungle
- "Corporate Tech" by PremiumBeat
- "Digital Innovation" royalty-free track
- "Minimal Tech Ambient"

**Keywords for searching**:
- "tech ambient background"
- "corporate technology loop"
- "minimal electronic background"
- "digital innovation music"

### 2. Countdown & Name Reveal (~10 seconds)
**Style**: Building, cinematic, inspirational
**Mood**: Rising energy, anticipation, momentous
**Suggested Tracks**:
- "Epic Countdown" style tracks
- "Inspirational Corporate Uplifting"
- "Cinematic Build Up"

**Keywords**:
- "countdown music background"
- "cinematic build up"
- "inspirational corporate"
- "epic reveal music"

### 3. Features Showcase (18 seconds)
**Style**: Upbeat, corporate, professional
**Mood**: Confident, modern, innovative
**Suggested Tracks**:
- "Modern Corporate Technology"
- "Innovation Presentation"
- "Success Corporate"

**Keywords**:
- "corporate presentation music"
- "modern technology background"
- "innovation showcase music"
- "professional business track"

### 4. Logo Reveal & Launch (8 seconds)
**Style**: Triumphant, celebratory, grand
**Mood**: Achievement, success, pride
**Suggested Tracks**:
- "Corporate Success"
- "Achievement Fanfare"
- "Grand Reveal"

**Keywords**:
- "success achievement music"
- "triumphant corporate"
- "celebration fanfare"
- "grand reveal music"

---

## Recommended Audio Creation Tools

### Voice Generation (AI)
1. **ElevenLabs** (https://elevenlabs.io)
   - Best quality AI voices
   - Multiple voice styles
   - Precise timing control
   - Pricing: Free tier available, Pro from $5/month

2. **Google Cloud Text-to-Speech**
   - Professional quality
   - Multiple languages
   - Good for technical narration
   - Pricing: Pay per character

3. **Amazon Polly**
   - Natural sounding voices
   - SSML support for emphasis
   - Good for longer narration
   - Pricing: Pay per character

4. **Microsoft Azure Speech**
   - Neural voices available
   - Customizable
   - Enterprise quality
   - Pricing: Pay per character

### Background Music Sources

1. **Epidemic Sound** (https://epidemicsound.com)
   - Professional quality
   - Royalty-free
   - Huge library
   - Pricing: ~$15/month

2. **Artlist** (https://artlist.io)
   - High-quality cinematic music
   - Unlimited downloads
   - Commercial license
   - Pricing: ~$15/month

3. **AudioJungle** (https://audiojungle.net)
   - Pay per track
   - Wide variety
   - Good for one-time use
   - Pricing: $1-50 per track

4. **PremiumBeat** (https://premiumbeat.com)
   - Curated quality music
   - Adobe Stock integration
   - Professional grade
   - Pricing: $50-200 per track

5. **Free Alternatives**:
   - **YouTube Audio Library** - Free, royalty-free
   - **Free Music Archive** - Creative Commons
   - **Incompetech** - Free with attribution
   - **Pixabay Music** - Free, no attribution

### Audio Editing Tools

1. **Audacity** (Free)
   - Open source
   - Perfect for basic editing
   - Timing adjustments
   - Export to MP3

2. **Adobe Audition** (Professional)
   - Industry standard
   - Advanced editing
   - Multi-track mixing
   - Pricing: $23/month

3. **GarageBand** (Mac - Free)
   - Easy to use
   - Good quality
   - Perfect for beginners
   - Built into macOS

4. **Reaper** (Affordable)
   - Professional DAW
   - Unlimited tracks
   - Powerful features
   - Pricing: $60 license

### Sound Effects

1. **Freesound.org** - Community uploaded, free
2. **Zapsplat.com** - Free sound effects library
3. **BBC Sound Effects** - Free archive
4. **Sound Bible** - Free with attribution

---

## Quick Workflow Suggestion

1. **Generate Voice-Over** (ElevenLabs or Google TTS)
   - Use AI prompts provided above
   - Export as high-quality MP3 (192kbps+)
   - Match exact durations specified

2. **Find Background Music** (Epidemic Sound or Artlist)
   - Search using keywords provided
   - Download matching tracks
   - Preview with your narration

3. **Edit & Mix** (Audacity or Adobe Audition)
   - Import narration and music
   - Lower music volume (-15dB to -20dB below voice)
   - Add fade in/out to music
   - Export final mix as MP3

4. **Place Files**
   - Voice-overs → `/public/audio/launch/`
   - Sound effects → `/public/audio/launch/sfx/`
   - Test on launch page

---

Good luck with your audio production! 🎙️
