# Shorts - Standalone Animated Video Generator

Standalone Remotion-powered animated video generator extracted from presenter-local.

## Setup

```bash
cd /Users/ryanheger/shorts
npm install
```

## Usage

### Generate Animated Video from Analysis

```bash
# Using analysis.json from presenter-local project
npm run generate /Users/ryanheger/presenter-local/projects/your-project/analysis.json ./output

# Or using universal insights JSON
npm run generate universal-insights.json ./output vertical
```

### Render Individual Segments to MP4

```bash
# After generation, render each segment
npm run render ./output/animated-video/Segment1Component.tsx ./output/segment-1.mp4 ./output/animated-video/segment-1-audio.mp3
```

## Pipeline Output

The generator creates:
- `animated-video/` directory with:
  - `SegmentXComponent.tsx` - Remotion components for each scene
  - `segment-X-script.txt` - TTS scripts
  - `segment-X-audio.mp3` - Generated audio files
  - `RENDERING-INSTRUCTIONS.md` - Complete rendering guide

## Project Structure

```
shorts/
├── animated-video/          # Main pipeline
├── shared/                  # Universal insights system
├── remotion/               # UI components & utils
├── renderSegment.ts        # MP4 rendering script
└── remotion-webpack-override.ts
```

## Video Formats

- `vertical` - 1080x1920 (Instagram Stories, TikTok)
- `square` - 1080x1080 (Instagram Posts)  
- `horizontal` - 1920x1080 (YouTube, LinkedIn)

## Examples

```bash
# Generate vertical TikTok-style video
npm run generate analysis.json ./tiktok-output vertical

# Generate square Instagram video  
npm run generate analysis.json ./instagram-output square

# Generate horizontal YouTube video
npm run generate analysis.json ./youtube-output horizontal
```