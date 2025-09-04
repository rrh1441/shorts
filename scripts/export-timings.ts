#!/usr/bin/env tsx

/**
 * Export a timings template from storyboard.json so you can edit durations.
 * Usage: npm run timings:export -- [storyboard.json] [output.json]
 */

import fs from 'node:fs/promises';
import path from 'node:path';

async function main() {
  const sbPath = process.argv[2] || './output/animated-video/storyboard.json';
  const outPath = process.argv[3] || './output/animated-video/timings.json';
  const raw = await fs.readFile(sbPath, 'utf-8');
  const j = JSON.parse(raw);
  const beats: any[] = [];
  for (const s of j.scenes || []) {
    const arr = s.beats || [];
    arr.forEach((b: any, idx: number) => {
      beats.push({
        scene: Number(s.sceneNumber),
        beat: idx + 1,
        label: (s.label || '').slice(0, 80),
        text: (b.beat || '').slice(0, 120),
        durationSec: Number(b.durationSec || 0),
      });
    });
  }
  const out = { beats };
  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, JSON.stringify(out, null, 2));
  console.log(`Wrote timings template: ${outPath}`);
}

main().catch((err) => {
  console.error('timings:export failed:', err?.message || err);
  process.exit(1);
});

