# Launch Sequence Audio Files

This directory contains voice-over and sound effect files for the FASMAA launch sequence.

## Required Voice-Over Files (Main Directory)

Place these MP3 files in `/public/audio/launch/`:

1. **network-activation.mp3**
   - Duration: ~8 seconds
   - Content: "Initializing surveillance network. Connecting all critical care points across Hulhumale Hospital."
   - Plays during: Network grid connection animation

2. **boot-sequence.mp3**
   - Duration: ~12 seconds
   - Content: "Loading system modules. Establishing secure database connections. All surveillance protocols activated."
   - Plays during: Boot sequence with terminal codes

3. **countdown.mp3**
   - Duration: ~5 seconds
   - Content: "System ready. Launching in 5, 4, 3, 2, 1."
   - Plays during: Circular countdown timer

4. **features.mp3**
   - Duration: ~18 seconds (plays throughout feature showcase)
   - Content: "FASMAA provides comprehensive infection prevention control across all hospital departments."
   - Plays during: Feature showcase animations

5. **logo-reveal.mp3**
   - Duration: ~8 seconds
   - Content: "Facility Alert System for Microbial Monitoring and Antimicrobial Action. FASMAA. Powered by Hulhumale Hospital."
   - Plays during: Logo letter-by-letter reveal

6. **launch-success.mp3**
   - Duration: ~3 seconds
   - Content: "Launch successful. Welcome to FASMAA."
   - Plays during: Final success screen

## Required Sound Effect Files (SFX Subdirectory)

Create subdirectory `/public/audio/launch/sfx/` and place these files:

1. **beep.mp3**
   - Short electronic beep sound (~0.2 seconds)
   - Plays when each hospital node activates in network grid
   - Used 7 times with 0.8s intervals

2. **swoosh.mp3**
   - Soft swoosh/connection sound (~0.3 seconds)
   - Plays when connection lines appear between nodes
   - Used 6 times with varying intervals

## Directory Structure

```
/public/audio/launch/
├── AUDIO_FILES_REQUIRED.md (this file)
├── network-activation.mp3
├── boot-sequence.mp3
├── countdown.mp3
├── features.mp3
├── logo-reveal.mp3
├── launch-success.mp3
└── sfx/
    ├── beep.mp3
    └── swoosh.mp3
```

## Audio Settings

- All voice-over files play at 70% volume (0.7)
- Sound effects play at lower volumes:
  - Beep: 40% (0.4)
  - Swoosh: 30% (0.3)

## Recording Tips

- Use clear, professional voice
- Slight echo/reverb for cinematic effect
- Background ambient electronic hum (subtle)
- Pace: Moderate, authoritative tone
- Format: MP3, 192kbps or higher

## Mute Control

Users can mute/unmute audio using the speaker button in the top-left corner during the sequence.
