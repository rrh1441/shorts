#!/usr/bin/env tsx

/**
 * Animated Video Pipeline
 * Transforms universal insights into animated short videos with TTS
 * Generates Remotion components + TTS scripts + renders final video
 * Following single-source-of-truth architecture
 */

import { OpenAI } from 'openai';
import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { UniversalInsights } from '../shared/insights.js';
import { componentOrchestrator, SceneComponentSpec } from '../component-orchestrator.js';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface VideoScene {
  sceneNumber: number;
  duration: number; // seconds
  visualType: 'statistic' | 'chart' | 'text-animation' | 'icon-sequence' | 'transition';
  ttsScript: string;
  visualElements: {
    headline?: string;
    statistic?: string;
    chartData?: any;
    icons?: string[];
    animation?: string;
  };
  timing: {
    start: number;
    end: number;
  };
}

interface AnimatedVideoScript {
  title: string;
  hook: string;
  totalDuration: number; // seconds
  scenes: VideoScene[];
  ttsFullScript: string;
  audioTrack: {
    speed: 'normal' | 'slightly-fast' | 'fast';
    voice: 'male' | 'female' | 'neutral';
    tone: 'professional' | 'energetic' | 'conversational';
  };
  videoSpecs: {
    format: 'vertical' | 'square' | 'horizontal';
    dimensions: { width: number; height: number };
    fps: number;
  };
}

export class AnimatedVideoPipeline {
  
  /**
   * Main pipeline: universal insights → segmented video parts for Loom compilation
   * FIXED WORKFLOW: Generate segments individually, not full video
   */
  async generate(
    universalInsights: UniversalInsights, 
    outputDir: string,
    videoFormat: 'vertical' | 'square' | 'horizontal' = 'vertical'
  ): Promise<string[]> {
    console.log('🚀 Animated Video Pipeline Starting (Segmented for Loom)...');
    
    // Step 1: Transform universal insights for video format
    console.log('📊 Step 1: Adapting insights for video narrative...');
    const videoInsights = this.adaptInsightsForVideo(universalInsights);
    
    // Step 2: Generate narrative with dynamic number of segments
    console.log('🎬 Step 2: Generating narrative structure with segments...');
    const narrative = await this.generateVideoNarrative(videoInsights, videoFormat);
    
    // Step 3: Generate script + components for each segment
    console.log('🎭 Step 3: Creating individual segments...');
    const segmentAssets = await this.generateSegments(narrative, videoFormat, outputDir);
    
    // Step 4: Generate TTS audio for each segment separately
    console.log('🔊 Step 4: Generating TTS audio for segments...');
    const audioAssets = await this.generateSegmentAudio(segmentAssets, outputDir);
    
    // Step 5: Save segment instructions for Loom compilation
    console.log('💾 Step 5: Saving segment assets and compilation guide...');
    const compilationAssets = await this.saveSegmentAssets(narrative, segmentAssets, audioAssets, outputDir);
    
    console.log(`✅ Generated ${narrative.scenes.length} video segments for Loom compilation`);
    return [...segmentAssets.map(s => s.componentPath), ...audioAssets, ...compilationAssets];
  }
  
  /**
   * Step 1: Transform universal insights for video narrative
   */
  private adaptInsightsForVideo(universalInsights: UniversalInsights): any {
    // Select visual hooks that work in video
    const videoHooks = universalInsights.hooks
      .filter(hook => ['statistic', 'contrarian', 'problem'].includes(hook.type))
      .sort((a, b) => {
        const strengthOrder = { 'strong': 0, 'medium': 1, 'weak': 2 };
        return strengthOrder[a.strength] - strengthOrder[b.strength];
      });
    
    // Get insights suitable for visual storytelling (30-90 seconds)
    const visualInsights = universalInsights.keyInsights
      .filter(insight => insight.importance === 'high')
      .slice(0, 5); // Keep videos focused
    
    // Select compelling statistics for animated charts
    const animatableStats = universalInsights.supportingData
      .filter(data => data.visualPotential === 'chart' || data.visualPotential === 'infographic')
      .slice(0, 3);
    
    return {
      hooks: videoHooks,
      insights: visualInsights,
      stats: animatableStats,
      audience: universalInsights.targetAudience,
      themes: universalInsights.themes.map(t => t.theme),
      cta: universalInsights.callToActionOptions
        .filter(cta => cta.type === 'engagement')
        .slice(0, 1)
    };
  }
  
  /**
   * Step 2: Generate video narrative structure (like LinkedIn carousel story)
   */
  private async generateVideoNarrative(
    videoInsights: any,
    videoFormat: 'vertical' | 'square' | 'horizontal'
  ): Promise<any> {
    
    const prompt = `Generate a video narrative structure for ${videoFormat} animated video.

CONTENT SUMMARY:
- Main hook: ${videoInsights.hooks?.[0]?.content || 'Business insight'}
- Key insight: ${videoInsights.insights?.[0]?.insight || 'Strategic advantage'}
- Target: ${videoInsights.audience || 'Business professionals'}

REQUIREMENTS:
- 30-90 seconds total duration
- 5-7 scenes with clear narrative flow
- Each scene: 6-15 seconds
- Mobile-first design for ${videoFormat}

Return simple JSON structure:
{
  "title": "Video title",
  "totalDuration": 60,
  "narrative": "One sentence story arc",
  "scenes": [
    {
      "sceneNumber": 1,
      "duration": 10,
      "purpose": "Hook viewer with statistic",
      "visualType": "statistic",
      "content": "Main message for this scene"
    }
  ]
}`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // Use faster model for structure
      messages: [{ role: 'user', content: prompt }],
    });

    const result = response.choices[0]?.message?.content?.trim();
    if (!result) throw new Error('No narrative generated');

    try {
      const cleanResult = result.replace(/^```json\n?/, '').replace(/\n?```$/, '');
      return JSON.parse(cleanResult);
    } catch (error) {
      // Simple fallback structure
      return {
        title: "Business Insight Video",
        totalDuration: 60,
        narrative: "Hook → Problem → Insight → Solution → CTA",
        scenes: [
          { sceneNumber: 1, duration: 12, purpose: "Hook", visualType: "statistic", content: videoInsights.hooks?.[0]?.content || "Hook" },
          { sceneNumber: 2, duration: 12, purpose: "Problem", visualType: "text-animation", content: "Problem context" },
          { sceneNumber: 3, duration: 16, purpose: "Insight", visualType: "chart", content: videoInsights.insights?.[0]?.insight || "Key insight" },
          { sceneNumber: 4, duration: 12, purpose: "Solution", visualType: "text-animation", content: "Solution approach" },
          { sceneNumber: 5, duration: 8, purpose: "CTA", visualType: "text-animation", content: "Take action" }
        ]
      };
    }
  }
  
  /**
   * Step 3: Generate individual segments (script + Remotion component)
   * Each segment is self-contained and stored in project structure
   */
  private async generateSegments(narrative: any, videoFormat: string, outputDir: string): Promise<any[]> {
    const segments = [];
    const videoSpecs = {
      format: videoFormat,
      dimensions: videoFormat === 'vertical' ? { width: 1080, height: 1920 } : 
                  videoFormat === 'square' ? { width: 1080, height: 1080 } :
                  { width: 1920, height: 1080 },
      fps: 30
    };
    
    // Create animated-video directory in project structure
    const animatedVideoDir = path.join(outputDir, 'animated-video');
    await fs.mkdir(animatedVideoDir, { recursive: true });
    
    for (const scene of narrative.scenes) {
      console.log(`Creating segment ${scene.sceneNumber}...`);
      
      // Generate TTS script for this segment
      const ttsScript = await this.generateSegmentTTSScript(scene);
      
      // Plan component for this segment
      const componentPlan = await this.planSceneComponent(scene, videoSpecs);
      
      // Orchestrate component using AI→Props pipeline
      const componentSpec = await componentOrchestrator.orchestrateComponent(scene, videoSpecs, componentPlan);
      
      // Generate TSX code from validated component spec
      const componentCode = componentOrchestrator.generateComponentTSX(componentSpec, scene, videoSpecs);
      
      // Save component file in animated-video directory
      const componentPath = path.join(animatedVideoDir, `Segment${scene.sceneNumber}Component.tsx`);
      await fs.writeFile(componentPath, componentCode);
      
      // Save component specification (props + metadata) for debugging
      const specPath = path.join(animatedVideoDir, `segment-${scene.sceneNumber}-spec.json`);
      await fs.writeFile(specPath, JSON.stringify(componentSpec, null, 2));
      
      // Save individual TTS script file
      const scriptPath = path.join(animatedVideoDir, `segment-${scene.sceneNumber}-script.txt`);
      await fs.writeFile(scriptPath, ttsScript);
      
      segments.push({
        segmentNumber: scene.sceneNumber,
        duration: scene.duration,
        ttsScript,
        componentPath,
        scriptPath,
        componentCode,
        componentSpec, // Include the AI→Props specification
        timing: {
          start: 0, // Each segment starts at 0 (independent)
          end: scene.duration
        },
        purpose: scene.purpose,
        content: scene.content,
        videoSpecs
      });
    }
    
    return segments;
  }
  
  /**
   * Generate TTS script for individual segment
   */
  private async generateSegmentTTSScript(scene: any): Promise<string> {
    const prompt = `Write a ${scene.duration}-second TTS script for this video segment:

SEGMENT PURPOSE: ${scene.purpose}
CONTENT: ${scene.content}
DURATION: ${scene.duration} seconds (~${Math.round(scene.duration * 2.5)} words)

Write conversational TTS script. Natural pace, emphasis on key words.
This will be a standalone segment compiled with others in Loom.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
    });

    return response.choices[0]?.message?.content?.trim() || scene.content;
  }

  /**
   * Step 4: Generate TTS audio for each segment separately
   * Each audio file stored in animated-video directory
   */
  private async generateSegmentAudio(segments: any[], outputDir: string): Promise<string[]> {
    const audioFiles: string[] = [];
    const animatedVideoDir = path.join(outputDir, 'animated-video');
    
    for (const segment of segments) {
      console.log(`Generating audio for segment ${segment.segmentNumber}...`);
      
      const audioResponse = await openai.audio.speech.create({
        model: 'tts-1-hd',
        voice: 'alloy',
        input: segment.ttsScript,
        speed: 1.0,
      });
      
      const audioPath = path.join(animatedVideoDir, `segment-${segment.segmentNumber}-audio.mp3`);
      const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
      await fs.writeFile(audioPath, audioBuffer);
      audioFiles.push(audioPath);
      
      // Update segment with audio path
      segment.audioPath = audioPath;
    }
    
    return audioFiles;
  }
  
  /**
   * Plan scene component (applying LinkedIn carousel lessons)
   */
  private async planSceneComponent(scene: VideoScene, videoSpecs: any): Promise<any> {
    
    // Skip complex JSON planning and use simple fallback - GPT-5 JSON is too unreliable
    const fallbackPlan = {
      componentName: `Scene${scene.sceneNumber}Component`,
      visualStrategy: `${scene.visualType} display for scene ${scene.sceneNumber}`,
      layoutPlan: {
        grid: "12-column grid with centered content",
        elements: "Title at top, content in center, supporting elements below",
        spacing: "64px margins, 24px element gaps"
      },
      remotionUiComponents: scene.visualType === 'statistic' ? ["StatBlock", "AnimatedText"] :
                            scene.visualType === 'chart' ? ["BarChart", "AnimatedText"] :
                            ["AnimatedText", "CalloutBox"],
      typography: {
        headline: { size: "64px", weight: 700, position: "top-center" },
        subtitle: { size: "48px", weight: 600, position: "below-headline" },
        body: { size: "36px", weight: 400, position: "center-content" }
      },
      animations: {
        sequence: ["Fade in headline", "Animate main content", "Show supporting elements"],
        timing: "Sync with TTS natural pauses"
      },
      designGuidance: "Use mobile-optimized typography, avoid dead space, clear hierarchy"
    };
    
    console.log(`Using simplified plan for scene ${scene.sceneNumber}`);
    return fallbackPlan;
  }
  
  // NOTE: generateSceneComponent method removed - replaced by componentOrchestrator.orchestrateComponent()
  // The new system uses AI→Props→Component pipeline for better reliability
  
  
  
  /**
   * Step 5: Save segment assets and render instructions
   */
  private async saveSegmentAssets(
    narrative: any,
    segments: any[],
    audioFiles: string[],
    outputDir: string
  ): Promise<string[]> {
    
    const animatedVideoDir = path.join(outputDir, 'animated-video');
    await fs.mkdir(animatedVideoDir, { recursive: true });
    const savedPaths: string[] = [];
    
    // Save segment structure as JSON in animated-video directory
    const segmentsJsonPath = path.join(animatedVideoDir, 'video-segments.json');
    await fs.writeFile(segmentsJsonPath, JSON.stringify({ narrative, segments }, null, 2));
    savedPaths.push(segmentsJsonPath);
    
    // Save rendering instructions with individual commands
    const renderInstructions = `# Animated Video Segments - Rendering Guide

## Project Structure
\`\`\`
${path.basename(outputDir)}/
├── animated-video/
${segments.map(s => `│   ├── Segment${s.segmentNumber}Component.tsx
│   ├── segment-${s.segmentNumber}-script.txt
│   ├── segment-${s.segmentNumber}-audio.mp3`).join('\n')}
│   └── (rendered MP4s will be saved here)
\`\`\`

## Generated Segments
${segments.map(s => `- **Segment ${s.segmentNumber}**: ${s.purpose} (${s.duration}s)`).join('\n')}

## Individual Render Commands
### Render each segment to MP4 (one at a time for compute monitoring):

${segments.map(s => `\`\`\`bash
# Segment ${s.segmentNumber}: ${s.purpose}
tsx scripts/renderSegment.ts \\
  "${s.componentPath}" \\
  "${path.join(path.dirname(s.componentPath), `segment-${s.segmentNumber}.mp4`)}" \\
  "${s.audioPath}"
\`\`\`
`).join('\n')}

## Batch Render All Segments
\`\`\`bash
${segments.map(s => `tsx scripts/renderSegment.ts "${s.componentPath}" "${path.join(path.dirname(s.componentPath), `segment-${s.segmentNumber}.mp4`)}" "${s.audioPath}"`).join(' && \\\n')}
\`\`\`

## Loom Compilation Workflow
1. **Render all segments** using commands above
2. **Import into Loom**: ${segments.map(s => `segment-${s.segmentNumber}.mp4`).join(', ')}
3. **Arrange in sequence** for final video
4. **Export** completed animated short

## Editing Individual Segments
- **Component**: Edit \`SegmentXComponent.tsx\` for visual changes
- **Script**: Edit \`segment-X-script.txt\` for narrative changes  
- **Audio**: Regenerate TTS or replace \`segment-X-audio.mp3\`
- **Re-render**: Run specific segment render command

**Total Duration**: ${narrative.totalDuration} seconds
**Segments**: ${narrative.scenes.length}

---
*Generated for individual segment workflow*
`;
    
    const renderInstructionsPath = path.join(animatedVideoDir, 'RENDERING-INSTRUCTIONS.md');
    await fs.writeFile(renderInstructionsPath, renderInstructions);
    savedPaths.push(renderInstructionsPath);
    
    // Save segment metadata
    const metadata = {
      generatedAt: new Date().toISOString(),
      pipeline: 'animated-video-segments',
      title: narrative.title,
      totalDuration: narrative.totalDuration,
      segments: narrative.scenes.length,
      audioFiles: audioFiles.map(f => path.basename(f)),
      componentFiles: segments.map(s => path.basename(s.componentPath)),
      compilationWorkflow: 'loom',
      segmentDurations: segments.map(s => s.duration)
    };
    
    const metadataPath = path.join(outputDir, 'segment-metadata.json');
    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2));
    savedPaths.push(metadataPath);
    
    return savedPaths;
  }
}

// Export singleton
export const animatedVideoPipeline = new AnimatedVideoPipeline();

// CLI usage
export async function runAnimatedVideoPipeline(
  universalInsights: UniversalInsights,
  outputDir: string,
  videoFormat: 'vertical' | 'square' | 'horizontal' = 'vertical'
): Promise<string[]> {
  return await animatedVideoPipeline.generate(universalInsights, outputDir, videoFormat);
}

// CLI entry point
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const insightsPath = process.argv[2];
  const outputDir = process.argv[3] || './output';
  const format = (process.argv[4] as 'vertical' | 'square' | 'horizontal') || 'vertical';
  
  if (!insightsPath) {
    console.error('Usage: tsx animated-video/index.ts <universal-insights.json> [output-dir] [format]');
    console.error('Formats: vertical (default), square, horizontal');
    process.exit(1);
  }
  
  fs.readFile(insightsPath, 'utf-8')
    .then(content => {
      const insights = JSON.parse(content);
      return runAnimatedVideoPipeline(insights, outputDir, format);
    })
    .then((paths) => {
      console.log('\n🎉 Animated Video Pipeline Complete:');
      paths.forEach((path, i) => console.log(`   ${i + 1}. ${path}`));
    })
    .catch(console.error);
}