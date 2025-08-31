#!/usr/bin/env tsx

/**
 * Regenerate SegmentXComponent.tsx files from saved specs and segment metadata
 * without calling OpenAI. Useful after improving the TSX generator.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { componentOrchestrator } from '../component-orchestrator';

async function main() {
  const outDir = path.join(process.cwd(), 'output', 'animated-video');
  const segmentsPath = path.join(outDir, 'video-segments.json');

  const raw = await fs.readFile(segmentsPath, 'utf-8');
  const data = JSON.parse(raw);
  const segments = data.segments || [];

  await componentOrchestrator.init();

  for (const seg of segments) {
    const n = seg.segmentNumber || seg.sceneNumber;
    if (!n) continue;
    const spec = seg.componentSpec || (await readSpec(outDir, n));
    const scene = {
      sceneNumber: n,
      purpose: seg.purpose,
      content: seg.content,
      duration: seg.duration,
    };
    const videoSpecs = seg.videoSpecs || data.videoSpecs || {
      format: 'vertical',
      dimensions: { width: 1080, height: 1920 },
      fps: 30,
    };

    const code = componentOrchestrator.generateComponentTSX(spec, scene, videoSpecs);
    const componentPath = path.join(outDir, `Segment${n}Component.tsx`);
    await fs.writeFile(componentPath, code);
    console.log(`Regenerated Segment${n}Component.tsx`);
  }

  console.log('Done. Re-render segments to see changes.');
}

async function readSpec(outDir: string, n: number) {
  const p = path.join(outDir, `segment-${n}-spec.json`);
  const raw = await fs.readFile(p, 'utf-8');
  return JSON.parse(raw);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

