#!/usr/bin/env tsx

/**
 * Render a segment and mux external audio using ffmpeg.
 * Usage: tsx scripts/renderWithAudio.ts <component-path> <output-mp4> <audio-path>
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { renderSegment as renderSegmentFn } from '../renderSegment';

async function ffmpegMux(videoIn: string, audioIn: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', videoIn,
      '-i', audioIn,
      '-c:v', 'copy',
      '-c:a', 'aac',
      '-shortest',
      output,
    ];
    const proc = spawn('ffmpeg', args, { stdio: 'inherit' });
    proc.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
  });
}

async function main() {
  const componentPath = process.argv[2];
  const outputPath = process.argv[3];
  const audioPath = process.argv[4];

  if (!componentPath || !outputPath || !audioPath) {
    console.error('Usage: tsx scripts/renderWithAudio.ts <component-path> <output-path> <audio-path>');
    process.exit(1);
  }

  const tempDir = path.join(process.cwd(), '.tmp-render-audio');
  await fs.mkdir(tempDir, { recursive: true });
  const tempVideo = path.join(tempDir, `${path.basename(outputPath, path.extname(outputPath))}-silent.mp4`);

  try {
    console.log('Rendering silent video...');
    await renderSegmentFn(componentPath, tempVideo);
    console.log('Muxing audio with ffmpeg...');
    await ffmpegMux(tempVideo, audioPath, outputPath);
    console.log(`Done: ${outputPath}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

main();

