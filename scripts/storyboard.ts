#!/usr/bin/env tsx

/**
 * Storyboard generator
 * Produces a reviewable plan: scene beats, voiceover drafts, and recommended components
 * No components, audio, or renders are produced.
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { animatedVideoPipeline } from '../animated-video/index.ts';
import type { UniversalInsights } from '../shared/insights.ts';

async function main() {
  const insightsPath = process.argv[2];
  const outputDir = process.argv[3] || './output';
  const format = (process.argv[4] as 'vertical' | 'square' | 'horizontal') || 'vertical';

  if (!insightsPath) {
    console.error('Usage: npm run storyboard -- <universal-insights.json> [output-dir] [format]');
    console.error('Formats: vertical (default), square, horizontal');
    process.exit(1);
  }

  const raw = await fs.readFile(path.resolve(insightsPath), 'utf-8');
  const insights = JSON.parse(raw) as UniversalInsights;

  const outPath = await animatedVideoPipeline.createStoryboard(insights, outputDir, format);
  const mdPath = outPath.replace(/storyboard\.json$/, 'STORYBOARD.md');
  console.log('\n📝 Storyboard ready for review:');
  console.log(`   JSON: ${outPath}`);
  console.log(`   MD:   ${mdPath}`);
}

main().catch((err) => {
  console.error('Storyboard generation failed:', err?.message || err);
  process.exit(1);
});
