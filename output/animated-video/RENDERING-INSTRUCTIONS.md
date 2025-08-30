# Animated Video Segments - Rendering Guide

## Project Structure
```
output/
├── animated-video/
│   ├── Segment1Component.tsx
│   ├── segment-1-script.txt
│   ├── segment-1-audio.mp3
│   ├── Segment2Component.tsx
│   ├── segment-2-script.txt
│   ├── segment-2-audio.mp3
│   ├── Segment3Component.tsx
│   ├── segment-3-script.txt
│   ├── segment-3-audio.mp3
│   ├── Segment4Component.tsx
│   ├── segment-4-script.txt
│   ├── segment-4-audio.mp3
│   ├── Segment5Component.tsx
│   ├── segment-5-script.txt
│   ├── segment-5-audio.mp3
│   ├── Segment6Component.tsx
│   ├── segment-6-script.txt
│   ├── segment-6-audio.mp3
│   ├── Segment7Component.tsx
│   ├── segment-7-script.txt
│   ├── segment-7-audio.mp3
│   └── (rendered MP4s will be saved here)
```

## Generated Segments
- **Segment 1**: Hook viewer with statistic (10s)
- **Segment 2**: Introduce the misconception (10s)
- **Segment 3**: Highlight the limitation (10s)
- **Segment 4**: Introduce the solution (10s)
- **Segment 5**: Provide actionable insights (10s)
- **Segment 6**: Call to action (10s)
- **Segment 7**: Wrap up with a reminder (10s)

## Individual Render Commands
### Render each segment to MP4 (one at a time for compute monitoring):

```bash
# Segment 1: Hook viewer with statistic
tsx scripts/renderSegment.ts \
  "output/animated-video/Segment1Component.tsx" \
  "output/animated-video/segment-1.mp4" \
  "output/animated-video/segment-1-audio.mp3"
```

```bash
# Segment 2: Introduce the misconception
tsx scripts/renderSegment.ts \
  "output/animated-video/Segment2Component.tsx" \
  "output/animated-video/segment-2.mp4" \
  "output/animated-video/segment-2-audio.mp3"
```

```bash
# Segment 3: Highlight the limitation
tsx scripts/renderSegment.ts \
  "output/animated-video/Segment3Component.tsx" \
  "output/animated-video/segment-3.mp4" \
  "output/animated-video/segment-3-audio.mp3"
```

```bash
# Segment 4: Introduce the solution
tsx scripts/renderSegment.ts \
  "output/animated-video/Segment4Component.tsx" \
  "output/animated-video/segment-4.mp4" \
  "output/animated-video/segment-4-audio.mp3"
```

```bash
# Segment 5: Provide actionable insights
tsx scripts/renderSegment.ts \
  "output/animated-video/Segment5Component.tsx" \
  "output/animated-video/segment-5.mp4" \
  "output/animated-video/segment-5-audio.mp3"
```

```bash
# Segment 6: Call to action
tsx scripts/renderSegment.ts \
  "output/animated-video/Segment6Component.tsx" \
  "output/animated-video/segment-6.mp4" \
  "output/animated-video/segment-6-audio.mp3"
```

```bash
# Segment 7: Wrap up with a reminder
tsx scripts/renderSegment.ts \
  "output/animated-video/Segment7Component.tsx" \
  "output/animated-video/segment-7.mp4" \
  "output/animated-video/segment-7-audio.mp3"
```


## Batch Render All Segments
```bash
tsx scripts/renderSegment.ts "output/animated-video/Segment1Component.tsx" "output/animated-video/segment-1.mp4" "output/animated-video/segment-1-audio.mp3" && \
tsx scripts/renderSegment.ts "output/animated-video/Segment2Component.tsx" "output/animated-video/segment-2.mp4" "output/animated-video/segment-2-audio.mp3" && \
tsx scripts/renderSegment.ts "output/animated-video/Segment3Component.tsx" "output/animated-video/segment-3.mp4" "output/animated-video/segment-3-audio.mp3" && \
tsx scripts/renderSegment.ts "output/animated-video/Segment4Component.tsx" "output/animated-video/segment-4.mp4" "output/animated-video/segment-4-audio.mp3" && \
tsx scripts/renderSegment.ts "output/animated-video/Segment5Component.tsx" "output/animated-video/segment-5.mp4" "output/animated-video/segment-5-audio.mp3" && \
tsx scripts/renderSegment.ts "output/animated-video/Segment6Component.tsx" "output/animated-video/segment-6.mp4" "output/animated-video/segment-6-audio.mp3" && \
tsx scripts/renderSegment.ts "output/animated-video/Segment7Component.tsx" "output/animated-video/segment-7.mp4" "output/animated-video/segment-7-audio.mp3"
```

## Loom Compilation Workflow
1. **Render all segments** using commands above
2. **Import into Loom**: segment-1.mp4, segment-2.mp4, segment-3.mp4, segment-4.mp4, segment-5.mp4, segment-6.mp4, segment-7.mp4
3. **Arrange in sequence** for final video
4. **Export** completed animated short

## Editing Individual Segments
- **Component**: Edit `SegmentXComponent.tsx` for visual changes
- **Script**: Edit `segment-X-script.txt` for narrative changes  
- **Audio**: Regenerate TTS or replace `segment-X-audio.mp3`
- **Re-render**: Run specific segment render command

**Total Duration**: 60 seconds
**Segments**: 7

---
*Generated for individual segment workflow*
