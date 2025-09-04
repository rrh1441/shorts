#!/usr/bin/env tsx

/**
 * Auto-time storyboard beats from text length calibrated by a given beat.
 * Default calibration: Scene 1, Beat 1, using its current duration (or an override).
 * Uses characters per second (CPS) by default to match tight pacing from V0.
 *
 * Usage examples:
 *   npm run storyboard:autotime -- ./output/animated-video/storyboard.json --cal 1 1 17 --unit chars --field voiceover
 *   npm run storyboard:autotime -- ./output/animated-video/storyboard.json --cal 1 1 17
 */

import fs from 'node:fs/promises';
import path from 'node:path';

type Beat = { beat?: string; voiceover?: string; durationSec?: number } & Record<string, any>;
type Scene = { sceneNumber: number; beats?: Beat[] } & Record<string, any>;

function getText(b: Beat, field: 'voiceover' | 'beat'): string {
  const t = field === 'voiceover' ? (b.voiceover ?? b.beat ?? '') : (b.beat ?? b.voiceover ?? '');
  return String(t);
}

async function main() {
  const sbPath = process.argv[2] || './output/animated-video/storyboard.json';
  let unit: 'chars' | 'words' = 'chars';
  let field: 'voiceover' | 'beat' = 'voiceover';
  let calScene = 1, calBeat = 1, calSecondsOverride: number | undefined;

  // Parse flags
  const args = process.argv.slice(3);
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--unit') { unit = (args[++i] as any) || unit; }
    else if (a === '--field') { field = (args[++i] as any) || field; }
    else if (a === '--cal') {
      calScene = Number(args[++i] || '1');
      calBeat = Number(args[++i] || '1');
      const maybe = args[++i];
      if (maybe && !maybe.startsWith('--')) calSecondsOverride = Number(maybe);
      else i--; // step back if next is a flag
    }
  }

  const raw = await fs.readFile(path.resolve(sbPath), 'utf-8');
  const j = JSON.parse(raw);
  const scenes: Scene[] = j.scenes || [];
  const targetScene = scenes.find((s) => Number(s.sceneNumber) === calScene);
  if (!targetScene || !targetScene.beats || !targetScene.beats[calBeat - 1]) {
    throw new Error(`Calibration beat not found: scene ${calScene}, beat ${calBeat}`);
  }

  const calBeatObj = targetScene.beats[calBeat - 1];
  const calText = getText(calBeatObj, field);
  const calChars = calText.length;
  const calWords = calText.trim().split(/\s+/).filter(Boolean).length || 1;
  const baseSec = Number.isFinite(calSecondsOverride!) ? (calSecondsOverride as number) : Number(calBeatObj.durationSec || 10);
  const cps = calChars > 0 ? calChars / baseSec : 1; // characters per second
  const wps = calWords > 0 ? calWords / baseSec : 2.5; // words per second

  // Apply to all beats
  let beatsCount = 0;
  for (const s of scenes) {
    const bs = s.beats || [];
    for (const b of bs) {
      beatsCount++;
      const t = getText(b, field);
      const duration = unit === 'chars'
        ? Math.max(1, Math.ceil((t.length || 0) / cps))
        : Math.max(1, Math.ceil((t.trim().split(/\s+/).filter(Boolean).length || 0) / wps));
      b.durationSec = duration;
    }
  }

  // Save storyboard and align overhead
  await fs.writeFile(path.resolve(sbPath), JSON.stringify(j, null, 2));

  // Reuse a lightweight align to keep output consistent
  const acts = Array.isArray(j.acts) ? j.acts : [];
  const beatGapSec = Number(process.env.BEAT_GAP_SEC || 1.5);
  const sceneGapSec = Number(process.env.SCENE_GAP_SEC || 2.0);
  const actGapSec = Number(process.env.ACT_GAP_SEC || 3.0);
  const beatDurations = scenes.flatMap((s) => (s.beats || []).map((b) => Number(b.durationSec || 0)));
  const beatsDur = beatDurations.reduce((a, b) => a + b, 0);
  const beatGaps = scenes.map((s) => Math.max(0, (s.beats?.length || 0) - 1)).reduce((a, b) => a + b, 0);
  const sceneGaps = Math.max(0, scenes.length - 1);
  const actGaps = Math.max(0, acts.length - 1);
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
  await fs.writeFile(path.resolve(sbPath), JSON.stringify(j, null, 2));

  // Regenerate MD summary
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
    if ((s as any).purpose) lines.push(`- Purpose: ${(s as any).purpose}`);
    bs.forEach((b, idx) => {
      lines.push(`\n- Beat ${idx + 1}: ${b.beat}`);
      lines.push(`  - Visual: ${b.visualType} / ${b.recommendedComponent}`);
      lines.push(`  - Duration: ${b.durationSec || 0}s`);
      const vo = String(b.voiceover || '').replace(/\n/g, ' ');
      lines.push(`  - VO: ${vo}`);
    });
  });
  const mdPath = path.join(path.dirname(path.resolve(sbPath)), 'STORYBOARD.md');
  await fs.writeFile(mdPath, lines.join('\n'));

  console.log(`Auto-timed ${beatsCount} beats using ${unit} and field=${field}.`);
  console.log(`Calibration: scene ${calScene}, beat ${calBeat}, duration ${baseSec}s → ${unit === 'chars' ? cps.toFixed(2)+' cps' : wps.toFixed(2)+' wps'}`);
  console.log(`Aligned total: ${alignedTotal}s`);
}

main().catch((err) => {
  console.error('autotime failed:', err?.message || err);
  process.exit(1);
});

