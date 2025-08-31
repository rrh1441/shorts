#!/usr/bin/env tsx

/**
 * Render a segment and mux external audio using ffmpeg.
 * Usage: tsx scripts/renderWithAudio.ts <component-path> <output-mp4> <audio-path>
 */

import path from 'node:path';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { renderSegment as renderSegmentFn } from '../renderSegment';

async function ffprobeDuration(input: string): Promise<number> {
  return new Promise((resolve, reject) => {
    const args = ['-v', 'error', '-show_entries', 'format=duration', '-of', 'default=nw=1:nk=1', input];
    const proc = spawn('ffprobe', args);
    let out = '';
    let err = '';
    proc.stdout.on('data', (d) => (out += d.toString()));
    proc.stderr.on('data', (d) => (err += d.toString()));
    proc.on('exit', (code) => {
      if (code === 0) {
        const secs = parseFloat(out.trim());
        if (isNaN(secs)) return reject(new Error('ffprobe returned NaN'));
        resolve(secs);
      } else {
        reject(new Error(`ffprobe failed: ${err}`));
      }
    });
  });
}

async function ffmpegMux(videoIn: string, audioIn: string, output: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const args = [
      '-y',
      '-i', videoIn,
      '-i', audioIn,
      // Map explicit streams to avoid copying the silent AAC track
      '-map', '0:v:0',
      '-map', '1:a:0',
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
    // Determine audio duration and align composition frames to audio
    const audioSecs = await ffprobeDuration(audioPath);
    const fps = 30;
    const padEnd = 6; // ~0.2s padding
    const frames = Math.ceil(audioSecs * fps) + padEnd;
    console.log(`Rendering silent video (frames=${frames})...`);
    await renderSegmentFn(componentPath, tempVideo, { frames, fps, width: 1080, height: 1920 });
    console.log('Muxing audio with ffmpeg...');
    await ffmpegMux(tempVideo, audioPath, outputPath);
    console.log(`Done: ${outputPath}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

main();
