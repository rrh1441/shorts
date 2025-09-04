#!/usr/bin/env tsx

/**
 * Apply timing overrides to a storyboard.
 * Usage:
 *  - npm run timings:apply -- ./output/animated-video/storyboard.json ./timings.json
 *  - npm run timings:apply -- ./output/animated-video/storyboard.json --set 1 1 17
 *    (scene 1, beat 1 => 17s)
 * After applying, it re-aligns overhead and rewrites STORYBOARD.md.
 */

import fs from 'node:fs/promises';
import path from 'node:path';

type TimingSet = { scene: number; beat: number; durationSec: number };

async function align(storyboardPath: string) {
  const raw = await fs.readFile(storyboardPath, 'utf-8');
  const j = JSON.parse(raw);
  const scenes = j.scenes || [];
  const acts = Array.isArray(j.acts) ? j.acts : [];
  const beatDurations = scenes.flatMap((s: any) => (s.beats || []).map((b: any) => Number(b.durationSec || 0)));
  const beatsDur = beatDurations.reduce((a: number, b: number) => a + b, 0);
  const beatGaps = scenes.map((s: any) => Math.max(0, (s.beats?.length || 0) - 1)).reduce((a: number, b: number) => a + b, 0);
  const sceneGaps = Math.max(0, scenes.length - 1);
  const actGaps = Math.max(0, acts.length - 1);
  const beatGapSec = Number(process.env.BEAT_GAP_SEC || 1.5);
  const sceneGapSec = Number(process.env.SCENE_GAP_SEC || 2.0);
  const actGapSec = Number(process.env.ACT_GAP_SEC || 3.0);
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
  j.meta = j.meta || {};
  j.meta.overhead = overhead;
  j.estimatedTotalDurationSec = alignedTotal;
  await fs.writeFile(storyboardPath, JSON.stringify(j, null, 2));
  const lines: string[] = [];
  const beatsCount = beatDurations.length;
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
  scenes.forEach((s: any) => {
    const bs = s.beats || [];
    lines.push(`\n### Scene ${s.sceneNumber} — ${s.label || ''} (${bs.length} beats)`);
    if (s.purpose) lines.push(`- Purpose: ${s.purpose}`);
    bs.forEach((b: any, idx: number) => {
      lines.push(`\n- Beat ${idx + 1}: ${b.beat}`);
      lines.push(`  - Visual: ${b.visualType} / ${b.recommendedComponent}`);
      lines.push(`  - Duration: ${b.durationSec || 0}s`);
      const vo = String(b.voiceover || '').replace(/\n/g, ' ');
      lines.push(`  - VO: ${vo}`);
    });
  });
  const mdPath = path.join(path.dirname(storyboardPath), 'STORYBOARD.md');
  await fs.writeFile(mdPath, lines.join('\n'));
}

async function main() {
  const sbPath = process.argv[2] || './output/animated-video/storyboard.json';
  const maybeFlag = process.argv[3];
  if (!maybeFlag) {
    await align(sbPath);
    console.log('Aligned without changes.');
    return;
  }
  if (maybeFlag === '--set') {
    const scene = Number(process.argv[4]);
    const beat = Number(process.argv[5]);
    const durationSec = Number(process.argv[6]);
    if (!scene || !beat || !durationSec) {
      console.error('Usage: timings:apply <storyboard.json> --set <scene> <beat> <durationSec>');
      process.exit(1);
    }
    const raw = await fs.readFile(sbPath, 'utf-8');
    const j = JSON.parse(raw);
    const s = (j.scenes || []).find((x: any) => Number(x.sceneNumber) === scene);
    if (!s || !s.beats || !s.beats[beat - 1]) {
      console.error('Scene/beat not found');
      process.exit(1);
    }
    s.beats[beat - 1].durationSec = durationSec;
    await fs.writeFile(sbPath, JSON.stringify(j, null, 2));
    await align(sbPath);
    console.log(`Set scene ${scene} beat ${beat} = ${durationSec}s and aligned.`);
    return;
  }
  // Assume JSON mapping path
  const mapPath = maybeFlag;
  const mapping = JSON.parse(await fs.readFile(mapPath, 'utf-8')) as { beats: TimingSet[] };
  const raw = await fs.readFile(sbPath, 'utf-8');
  const j = JSON.parse(raw);
  for (const t of mapping.beats || []) {
    const s = (j.scenes || []).find((x: any) => Number(x.sceneNumber) === Number(t.scene));
    if (s && s.beats && s.beats[Number(t.beat) - 1]) {
      s.beats[Number(t.beat) - 1].durationSec = Number(t.durationSec);
    }
  }
  await fs.writeFile(sbPath, JSON.stringify(j, null, 2));
  await align(sbPath);
  console.log(`Applied ${mapping.beats?.length || 0} timing overrides and aligned.`);
}

main().catch((err) => {
  console.error('timings:apply failed:', err?.message || err);
  process.exit(1);
});

