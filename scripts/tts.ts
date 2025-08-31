#!/usr/bin/env tsx
import fs from 'node:fs/promises';
import { OpenAI } from 'openai';
import dotenv from 'dotenv';
dotenv.config();

async function main() {
  const inputPath = process.argv[2];
  const outputPath = process.argv[3];
  if (!inputPath || !outputPath) {
    console.error('Usage: tsx scripts/tts.ts <script.txt> <output.mp3>');
    process.exit(1);
  }
  const text = await fs.readFile(inputPath, 'utf-8');
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY || (process.env as any).openai_api_key });
  const audioResponse = await openai.audio.speech.create({
    model: 'tts-1-hd',
    voice: 'alloy',
    input: text,
    speed: 1.0,
  });
  const audioBuffer = Buffer.from(await audioResponse.arrayBuffer());
  await fs.writeFile(outputPath, audioBuffer);
  console.log(`Wrote ${outputPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });
