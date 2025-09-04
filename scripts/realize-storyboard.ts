#!/usr/bin/env tsx

/**
 * Realize a storyboard into components and scripts without audio.
 * - Reads storyboard.json (beats, VO, recommended components)
 * - Orchestrates component props and emits SegmentXComponent.tsx + segment-X-script.txt
 * - Skips audio/render; use existing render scripts afterwards.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { componentOrchestrator } from '../component-orchestrator.ts';

async function main() {
  const storyboardPath = process.argv[2];
  const outputDir = process.argv[3] || './output';
  const fallbackFormat = (process.argv[4] as 'vertical' | 'square' | 'horizontal') || 'vertical';

  if (!storyboardPath) {
    console.error('Usage: npm run realize:storyboard -- <path/to/storyboard.json> [output-dir] [format]');
    process.exit(1);
  }

  const raw = await fs.readFile(path.resolve(storyboardPath), 'utf-8');
  const storyboard = JSON.parse(raw);

  const videoSpecs = storyboard.videoSpecs ?? {
    format: fallbackFormat,
    dimensions: fallbackFormat === 'vertical' ? { width: 1080, height: 1920 } :
                fallbackFormat === 'square' ? { width: 1080, height: 1080 } :
                { width: 1920, height: 1080 },
    fps: 30,
  };

  await componentOrchestrator.init();

  const animatedVideoDir = path.join(outputDir, 'animated-video');
  await fs.mkdir(animatedVideoDir, { recursive: true });

  const segments: any[] = [];
  let segmentCounter = 0;

  for (const s of storyboard.scenes || []) {
    const beats = Array.isArray(s.beats) && s.beats.length > 0
      ? s.beats
      : [{
          beat: s.beat || s.content || '',
          voiceover: s.voiceover || '',
          visualType: s.visualType,
          recommendedComponent: s.recommendedComponent,
          durationSec: s.duration,
          purpose: s.purpose,
        }];

    for (const b of beats) {
      segmentCounter += 1;
      const sceneLike = {
        sceneNumber: segmentCounter,
        duration: Number(b.durationSec || s.duration || 10),
        purpose: b.purpose || s.purpose,
        visualType: (b.visualType || s.visualType || 'text-animation') as string,
        content: String(b.beat || b.text || s.beat || s.content || ''),
      };

      const plan = b.componentPlan || s.componentPlan;
      const spec = await componentOrchestrator.orchestrateComponent(sceneLike, videoSpecs, plan);
      const code = componentOrchestrator.generateComponentTSX(spec, sceneLike, videoSpecs);

      const componentPath = path.join(animatedVideoDir, `Segment${sceneLike.sceneNumber}Component.tsx`);
      await fs.writeFile(componentPath, code);

      const scriptPath = path.join(animatedVideoDir, `segment-${sceneLike.sceneNumber}-script.txt`);
      await fs.writeFile(scriptPath, String(b.voiceover || s.voiceover || sceneLike.content || ''));

      segments.push({
        segmentNumber: sceneLike.sceneNumber,
        duration: sceneLike.duration,
        purpose: sceneLike.purpose,
        content: sceneLike.content,
        componentPath,
        scriptPath,
      });
    }
  }

  const segmentsJsonPath = path.join(animatedVideoDir, 'video-segments.json');
  await fs.writeFile(segmentsJsonPath, JSON.stringify({
    narrative: {
      title: storyboard.title,
      totalDuration: storyboard.totalDuration,
      scenes: (storyboard.scenes || []).map((s: any) => ({
        sceneNumber: s.sceneNumber,
        duration: s.duration,
        purpose: s.purpose,
        visualType: s.visualType,
        content: s.beat,
      }))
    },
    segments
  }, null, 2));

  console.log('✅ Realized storyboard into components and scripts');
  console.log(`   Output: ${animatedVideoDir}`);
}

main().catch((err) => {
  console.error('Realize storyboard failed:', err?.message || err);
  process.exit(1);
});
