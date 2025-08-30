# CLAUDE.md

## Shorts - Component-Driven Video Automation Platform

A **Remotion-powered video generation ecosystem** that combines AI flexibility with component reliability. This system leverages your existing `remotion-ui` library to create professional animated videos through intelligent component orchestration rather than raw code generation.

## Strategic Overview

This isn't just a "video generation project" - it's a **Component-Driven Video Automation Platform**. The key innovation is shifting the AI's role from "code writer" to "component orchestrator," preserving creative flexibility while ensuring absolute reliability.

### The Hybrid Approach

**AI Generates Props → Your Components Render**

Instead of asking LLMs to write unpredictable TSX code, the AI selects appropriate components from your `@remotion-ui` library and generates JSON props that conform to Zod schemas. This approach delivers:

- **Creative Flexibility**: AI decides visual structure and content
- **Absolute Reliability**: Output always uses your well-tested components
- **Simplified AI Task**: JSON generation vs. complex animation code
- **Leverages Your Masterpiece**: Makes `remotion-ui` the central engine

## Architecture

### Current State
- **Shorts Pipeline**: Content analysis → Scene generation → Component creation
- **Remotion-UI Library**: Comprehensive component library with 70+ assets
- **Rendering System**: 10-GPU Mac mini for high-performance video generation

### Target State (Hybrid Architecture)
```
Content Analysis → AI Component Selection → Props Generation → Component Rendering → MP4 Output
       ↓                    ↓                     ↓                    ↓              ↓
  Business Data    Choose from Library    Generate JSON Props    Remotion Components    Video
```

### Pipeline Process

1. **Content Analysis** → Adapts insights for video narrative structure
2. **Component Selection** → AI chooses optimal components from `@remotion-ui` library
3. **Props Generation** → AI generates JSON props conforming to Zod schemas
4. **Component Rendering** → Dynamic import and render with AI-generated props
5. **Audio Integration** → TTS + background music with proper mixing
6. **MP4 Output** → Professional video ready for social platforms

## Generated Output Structure

```
output/
├── video-spec.json              # Normalized specification
├── plan.json                    # Scene graph + timeline + lint results
├── components/
│   ├── scene-1-props.json      # AI-generated props per scene
│   ├── scene-2-props.json
├── audio/
│   ├── voiceover.wav           # TTS-generated narration
│   ├── speech-marks.json       # Word/phoneme timing data
│   ├── background.mp3          # Optional background music
├── renders/
│   ├── final-video.mp4         # Complete rendered video
│   └── thumbnails/             # Frame previews for debugging
└── artifacts/
    ├── lint-report.json        # Quality assurance results
    └── render-log.json         # Detailed rendering metadata
```

## Quick Start

### Prerequisites
```bash
cd /Users/ryanheger/shorts
npm install
```

### Basic Usage
```bash
# Generate video from analysis
npm run generate /path/to/analysis.json ./output vertical

# Preview in Remotion Studio
npm run preview

# Render final MP4
npm run render ./output/video-spec.json ./output/final-video.mp4

# Render with audio mixing
npm run render:with-audio ./output/video-spec.json ./output/final-video.mp4
```

### Testing the Pipeline
```bash
# Plan and validate without rendering
npm run plan ./spec.example.json

# Render sample to verify setup
npm run render ./spec.example.json ./output/test.mp4
```

## Key Features

### Production-Ready Components
- **Monorepo Structure**: Clean separation (core, components, dataviz, text, audio, themes, assets)
- **Zod Schema Validation**: Type-safe props with runtime validation
- **shadcn-style CLI**: Easy component installation and updates
- **Comprehensive Asset System**: 70+ assets with manifest-driven loading
- **Advanced Audio**: Sequence management, caption sync, TTS integration

### Intelligent Automation
- **Deterministic Rendering**: Same input = same output, every time
- **Quality Lints**: Automatic validation of text legibility, timing, safe margins
- **Performance Optimized**: Leverages 10-GPU Mac mini architecture
- **Multi-Format Support**: Vertical (TikTok/Stories), Square (Instagram), Horizontal (YouTube)

### Developer Experience
- **Visual Regression Testing**: Ensure component changes don't break renders
- **Storybook Integration**: Visual component dictionary for AI prompting
- **Hot Reload**: Instant preview of changes during development
- **Asset Management**: Cached, versioned, and optimized media handling

## Technical Stack

- **Remotion 4.x**: Core video generation and rendering engine
- **@remotion-ui**: Your comprehensive component library
- **TypeScript + Zod**: Type-safe schemas and validation
- **OpenAI TTS**: High-quality voice synthesis with timing data
- **FFmpeg**: Professional audio mixing and encoding
- **React**: Component-based UI with Framer Motion animations

## Implementation Roadmap

### Phase 1: Foundation (Critical Priority) ✅ COMPLETE
1. **✅ Zod Schema Implementation** - COMPLETE
   - ✅ Added schemas to 3 core components (StatBlock, AnimatedText, CalloutBox)
   - ✅ Created `getDefaultProps()` functions for each component
   - ✅ Enabled AI→props contract validation with runtime checks
   - ✅ Validated schema functionality with comprehensive tests

2. **✅ Component Orchestration** - COMPLETE
   - ✅ Modified `generateSceneComponent` to output props JSON instead of TSX code
   - ✅ Implemented dynamic component import and validation system
   - ✅ Added schema-driven prop validation with fallback handling
   - ✅ Created end-to-end AI→Props→Component pipeline

3. **✅ Basic Pipeline Integration** - COMPLETE
   - ✅ Connected shorts pipeline to remotion-ui library via component orchestration
   - ✅ Tested with realistic analysis files - generated 7 video segments successfully
   - ✅ Verified end-to-end AI→Props→Component→TSX→Audio pipeline
   - ✅ Confirmed fallback handling works when AI props fail validation
   - 🚧 Production rendering verification on 10-GPU setup (ready for testing)

### Phase 2: Format-Aware Design System (Critical Priority) 🚨 IN PROGRESS

**CORE INSIGHT**: Knowing exact target formats (Portrait 1080x1920, Square 1080x1080, Landscape 1920x1080) allows us to define precise design constraints that guarantee professional output.

**STRATEGY**: Replace generic web-style props with format-specific design presets that constrain AI choices to guaranteed-readable layouts.

1. **Format-Constrained Component System** - ACTIVE IMPLEMENTATION
   - **PROBLEM SOLVED**: No more tiny floating components from arbitrary width/height props
   - **SOLUTION**: AI selects semantic choices (`size: "large"`, `position: "top"`) that map to format-optimized dimensions
   - **IMPLEMENTATION**: 
     ```typescript
     // Before: AI generates arbitrary dimensions
     { width: 800, height: 400 } // Creates tiny card in 1080x1920 space
     
     // After: AI generates semantic constraints  
     { format: "portrait", size: "large", position: "center" }
     // Maps to: { width: 980, height: 600, x: 50, y: 660 }
     ```

2. **Typography Hierarchy Rules**
   - **Portrait (1080x1920)**:
     - H1: Max 35 chars, min 56px font, y=140px, margins=50px
     - H2: Max 45 chars, min 40px font, y=H1+120px, margins=50px
     - Body: Max 50 chars, min 32px font, line-height=1.4
   - **Square (1080x1080)**:
     - H1: Max 40 chars, min 48px font, y=100px, margins=50px
     - H2: Max 50 chars, min 36px font, y=H1+100px, margins=50px
     - Body: Max 55 chars, min 28px font, line-height=1.4
   - **Landscape (1920x1080)**:
     - H1: Max 60 chars, min 42px font, y=80px, margins=60px
     - H2: Max 70 chars, min 32px font, y=H1+80px, margins=60px
     - Body: Max 80 chars, min 24px font, line-height=1.4

3. **High-Contrast Color System**
   - **Phase 1**: Pure black text on white backgrounds (WCAG AAA compliance)
   - **Phase 2**: Expand to high-contrast color pairs with validated contrast ratios
   - **Video Optimization**: Colors tested for video compression and mobile viewing
   - **Schema Enforcement**: AI limited to approved color combinations only

4. **Format-Specific Component Variants**
   - Components automatically adapt to format without AI dimension choices:
     ```typescript
     // AI prompt includes format context
     const componentProps = {
       format: "portrait", // Passed from video spec
       size: "large",     // AI semantic choice
       headline: "Q3 Revenue Up 40%", // AI content choice
       value: "$5.2M",    // AI data choice
     }
     
     // Component internally maps to format-optimized layout
     const dimensions = FORMAT_PRESETS.portrait.large;
     // { width: 980, height: 400, x: 50, y: 200, fontSize: 56 }
     ```

### Phase 2b: Pipeline Enhancement (After Design System)
1. **Storybook Completion**
   - Visual dictionary for AI component selection
   - Interactive prop exploration  
   - Better AI prompting with visual examples

2. **Timeline Management**
   - Add `<Sequence>` wrappers for proper scene timing
   - Implement `useTimeline(nodeId)` helper
   - Speech-mark alignment for narration sync

### Phase 3: Scale & Optimize
1. **Batch Processing**
   - Multi-video rendering pipeline
   - Asset optimization and caching
   - Distributed rendering support

2. **Advanced Features**
   - Chart animations with data binding
   - Brand customization system
   - A/B testing framework

3. **Platform Integration**
   - Direct export to social platforms
   - Format-specific optimizations
   - Analytics and performance tracking

## Future Enhancements

### Advanced AI Orchestration
- **Timeline Intelligence**: AI suggests optimal timing for animations and scene transitions
- **Sequence Orchestration**: Intelligent component ordering based on narrative flow
- **Dynamic Pacing**: Adaptive timing based on content complexity and audience engagement data
- **Multi-Scene Coordination**: Cross-scene continuity and thematic consistency

### User Experience Evolution
- **Natural Language Interface**: "Create a video about Q3 sales performance with upbeat tone"
- **Form-Based UI**: Guided video creation with smart defaults and previews
- **Template Marketplace**: AI-curated templates based on industry and use case
- **Real-time Preview**: Live editing with instant visual feedback

### Advanced Content Integration
- **Live Data Feeds**: 
  - Stock market data visualization
  - Sports scores and statistics
  - Social media metrics
  - Weather and news updates
- **Personalization at Scale**: 
  - Thousands of unique videos with individual user data
  - Dynamic name/company insertion
  - Localized content and language adaptation
  - A/B testing with personalized variants

### Cloud-Scale Architecture
- **Distributed Rendering**: Beyond 10-GPU Mac Mini to cloud infrastructure
  - AWS Fargate for containerized rendering
  - Lambda functions for lightweight processing
  - EC2 GPU instances for heavy computation
- **Horizontal Scaling**: Parallel video generation across multiple instances
- **Global CDN**: Fast video delivery worldwide
- **Enterprise Features**: Multi-tenant architecture, usage analytics, billing integration

## Example: Component Orchestration

### Before (Unreliable Code Generation)
```typescript
const prompt = `Generate a Remotion React component...
CRITICAL REQUIREMENTS:
1. Use remotion-ui library components
...
Generate complete React component...`;
```

### After (Reliable Props Generation)
```typescript
// AI selects component and generates props
import { MetricBlockSchema } from '@remotion-ui/dataviz';

const propsSchema = z.object({
  componentName: z.literal('MetricBlock'),
  props: MetricBlockSchema,
});

const prompt = `Generate JSON props for MetricBlock component.
Schema: ${JSON.stringify(propsSchema.jsonSchema, null, 2)}
Scene: ${JSON.stringify(scene, null, 2)}`;

// AI Response:
{
  "componentName": "MetricBlock",
  "props": {
    "metrics": [
      { "label": "Revenue", "value": 5130000, "format": "currency" }
    ],
    "layout": "horizontal",
    "animationStyle": "countUp"
  }
}

// Pipeline dynamically renders
const Component = await import(`@remotion-ui/${componentName}`);
return <Component {...props} />;
```

## Quality Guardrails

### Automatic Validation
- **Even Dimensions**: Encoder compatibility
- **FPS Range**: 24-60 for platform compatibility  
- **Text Dwell Time**: ≥2.8s or 0.18s/word for readability
- **Safe Margins**: ≥3% minimum gutter for mobile viewing
- **No Runtime Randomness**: Deterministic output guaranteed

### Error Handling
- **Schema Validation**: Props must conform to component contracts
- **Lint Failures**: Render exits early with clear error messages
- **Asset Verification**: All referenced media files validated pre-render
- **Performance Monitoring**: Frame drop detection and optimization suggestions

## Troubleshooting

### Common Issues
1. **"Component not found"**: Verify component exists in `@remotion-ui` library
2. **Props validation failed**: Check generated JSON against Zod schema
3. **Audio sync issues**: Validate speech-marks timing data
4. **Render performance**: Check GPU utilization on Mac mini

### Debugging Tools
- **Preview Mode**: `npm run preview` for interactive development
- **Plan Validation**: `npm run plan` to check spec without rendering
- **Verbose Logging**: Set `LOG_LEVEL=debug` for detailed output
- **Frame Export**: Generate thumbnails for visual debugging

## Performance Optimization

### 10-GPU Mac Mini Setup
- **Concurrent Rendering**: Leverage multiple GPUs for scene parallelization
- **Asset Caching**: Pre-load and cache frequently used components/assets
- **Memory Management**: Optimize for large video file handling
- **Thermal Management**: Monitor GPU temperatures during long renders

## Usage Notes

### ✅ Advantages
- **Predictable Output**: Same spec always produces identical video
- **Component Reusability**: Leverage existing `@remotion-ui` investment
- **Simplified Debugging**: Test components independently of AI generation
- **Production Ready**: Built-in quality controls and performance optimization

### ⚠️ Important Considerations
- **Component Dependency**: System requires well-designed `@remotion-ui` components
- **Schema Maintenance**: Keep Zod schemas synchronized with component props
- **Asset Management**: Large video files require proper storage/cleanup
- **GPU Resources**: Monitor resource usage during batch operations

---

*Updated 2025-08-30: Unified strategic analysis with production-ready implementation guide*