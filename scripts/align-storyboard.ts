#!/usr/bin/env tsx

/**
 * Align a storyboard's estimated runtime with beat durations plus tight overheads.
 * - Adds small inter-beat and inter-scene gaps for V0 pacing
 * - Updates estimatedTotalDurationSec
 * - Writes back storyboard.json and STORYBOARD.md
 */

import fs from 'node:fs/promises';
import path from 'node:path';

type Beat = { durationSec?: number } & Record<string, any>;
type Scene = { sceneNumber: number; beats?: Beat[] } & Record<string, any>;

function sum(arr: number[]) { return arr.reduce((a, b) => a + b, 0); }

function buildMD(j: any, beatsDur: number, overhead: any) {
  const scenes: Scene[] = j.scenes || [];
  const beatsCount = scenes.reduce((a, s) => a + (s.beats?.length || 0), 0);
  const lines: string[] = [];
  lines.push(`# Storyboard — ${j.title}`);
  if (j.logline) lines.push(`\n> ${j.logline}\n`);
  lines.push(`- Format: ${j.videoSpecs?.format || 'vertical'}`);
  lines.push(`- Estimated Total (aligned): ${j.estimatedTotalDurationSec}s`);
  lines.push(`- Beats Sum: ${beatsDur}s`);
  lines.push(`- Overhead: ${overhead.totalOverheadSec}s (beat gaps ${overhead.beatGapsTotalSec}s, scene gaps ${overhead.sceneGapsTotalSec}s, act gaps ${overhead.actGapsTotalSec}s)`);
  lines.push(`- Scenes: ${scenes.length}`);
  lines.push(`- Beats: ${beatsCount}`);
  if (Array.isArray(j.acts) && j.acts.length) {
    lines.push(`\n## Acts`);
    j.acts.forEach((a: any) => { lines.push(`- ${a.label}: ${a.summary}`); });
  }
  lines.push(`\n## Scenes`);
  scenes.forEach((s) => {
    const bs = s.beats || [];
    lines.push(`\n### Scene ${s.sceneNumber} — ${s.label || ''} (${bs.length} beats)`);
    if (s.purpose) lines.push(`- Purpose: ${s.purpose}`);
    bs.forEach((b, idx) => {
      lines.push(`\n- Beat ${idx + 1}: ${b.beat}`);
      lines.push(`  - Visual: ${b.visualType} / ${b.recommendedComponent}`);
      lines.push(`  - Duration: ${b.durationSec || 0}s`);
      const vo = String(b.voiceover || '').replace(/\n/g, ' ');
      lines.push(`  - VO: ${vo}`);
    });
  });
  return lines.join('\n');
}

async function main() {
  const storyboardPath = process.argv[2] || './output/animated-video/storyboard.json';
  const beatGapSec = Number(process.env.BEAT_GAP_SEC || process.argv[3] || 1.5);    // tight
  const sceneGapSec = Number(process.env.SCENE_GAP_SEC || process.argv[4] || 2.0);  // tight
  const actGapSec = Number(process.env.ACT_GAP_SEC || process.argv[5] || 3.0);      // brief

  const raw = await fs.readFile(path.resolve(storyboardPath), 'utf-8');
  const j = JSON.parse(raw);
  const scenes: Scene[] = j.scenes || [];

  // Sum beat durations
  const beatDurations = scenes.flatMap((s) => (s.beats || []).map((b) => Number(b.durationSec || 0)));
  const beatsDur = sum(beatDurations);

  // Overhead: inter-beat within scenes, inter-scene, inter-act (global)
  const beatGaps = scenes.map((s) => Math.max(0, (s.beats?.length || 0) - 1)).reduce((a, b) => a + b, 0);
  const sceneGaps = Math.max(0, scenes.length - 1);
  const actGaps = Math.max(0, (Array.isArray(j.acts) ? j.acts.length : 0) - 1);

  const overhead = {
    beatGapSec,
    sceneGapSec,
    actGapSec,
    beatGapsCount: beatGaps,
    sceneGapsCount: sceneGaps,
    actGapsCount: actGaps,
    beatGapsTotalSec: Math.round(beatGaps * beatGapSec * 100) / 100,
    sceneGapsTotalSec: Math.round(sceneGaps * sceneGapSec * 100) / 100,
    actGapsTotalSec: Math.round(actGaps * actGapSec * 100) / 100,
  } as any;
  overhead.totalOverheadSec = Math.round((overhead.beatGapsTotalSec + overhead.sceneGapsTotalSec + overhead.actGapsTotalSec) * 100) / 100;

  const alignedTotal = Math.round((beatsDur + overhead.totalOverheadSec) * 100) / 100;

  // Write back into storyboard under meta and sync estimated total
  j.meta = j.meta || {};
  j.meta.overhead = overhead;
  j.estimatedTotalDurationSec = alignedTotal;

  await fs.writeFile(path.resolve(storyboardPath), JSON.stringify(j, null, 2));

  // Regenerate MD summary next to JSON
  const md = buildMD(j, beatsDur, overhead);
  const mdPath = path.join(path.dirname(path.resolve(storyboardPath)), 'STORYBOARD.md');
  await fs.writeFile(mdPath, md);

  console.log('Aligned storyboard runtime.');
  console.log(`Beats sum: ${beatsDur}s, Overhead: ${overhead.totalOverheadSec}s, Aligned: ${alignedTotal}s`);
  console.log(`Updated: ${storyboardPath}`);
  console.log(`Summary: ${mdPath}`);
}

main().catch((err) => {
  console.error('Alignment failed:', err?.message || err);
  process.exit(1);
});

