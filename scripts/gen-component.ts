#!/usr/bin/env tsx

/**
 * Generate a non-interactive animated React component from a brief and write it to a TSX file.
 * Usage:
 *   npm run gen:component -- "<concept>" <width> <height> <output-path>
 * Example:
 *   npm run gen:component -- "Two divergent bets..." 1920 1080 ./output/animated-video/Segment1Component.tsx
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import OpenAI from 'openai';

dotenv.config();

async function main() {
  const concept = process.argv[2];
  const width = Number(process.argv[3] || 1920);
  const height = Number(process.argv[4] || 1080);
  const outPath = path.resolve(process.argv[5] || './output/animated-video/SegmentComponent.tsx');

  if (!concept) {
    console.error('Usage: npm run gen:component -- "<concept>" <width> <height> <output-path>');
    process.exit(1);
  }

  const apiKey = process.env.OPENAI_API_KEY || (process.env as any).openai_api_key || process.env.OPENAI_OPENAPI_KEY;
  if (!apiKey) {
    console.error('OPENAI_API_KEY not set in environment/.env');
    process.exit(1);
  }

  const openai = new OpenAI({ apiKey });

  // Minimal brief (per user): concept + window only; let the model decide visuals.
  const input = `Create a single, animated, non-interactive React component that visually expresses this concept.\n\nCONCEPT:\n${concept}\n\nCANVAS:\n- Size: ${width}x${height} pixels (render fully within this window)\n\nGUARDRAILS (non-prescriptive, hard):\n- Choose one clear visual metaphor; do NOT mirror narration as long on-screen text\n- Simplicity: max 3 focal elements; max 2 simultaneous animations\n- Negative space: at least ~50% empty canvas; no dense backgrounds\n- Palette: 1 background, 1 accent, 1 neutral; avoid heavy gradients/particle fields\n- Text (optional): up to 2 strong sentences if essential; no paragraphs; ensure legibility\n- Motion: reveal within 0.5s; 1–2 distinct moves; then a stable hold\n- Layout: respect safe margins; no edge clipping; keep any text clear of shapes\n- Deterministic, self-contained: no randomness, no interactivity, no external assets\n\nDELIVERABLE:\n- A single default-export React component\n- Output only TSX code (no fences, no prose)`;

  const model = process.env.GEN_COMPONENT_MODEL || 'gpt-5-2025-08-07';

  const result = await openai.responses.create({
    model,
    input,
    reasoning: { effort: 'high' },
    text: { verbosity: 'low' },
  });

  const code = (result as any).output_text as string;
  if (!code || code.trim().length < 20) {
    console.error('Model did not return component code.');
    process.exit(1);
  }

  await fs.mkdir(path.dirname(outPath), { recursive: true });
  await fs.writeFile(outPath, code);
  console.log(`Wrote component to ${outPath}`);
}

main().catch((err) => {
  console.error('gen:component failed:', err?.message || err);
  process.exit(1);
});
