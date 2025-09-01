#!/usr/bin/env tsx
import path from 'node:path';
import fs from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { webpackOverride } from '../remotion-webpack-override';

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

async function main() {
  const outDir = process.argv[2] || './output';
  const format = (process.argv[3] as 'vertical' | 'square' | 'horizontal') || 'vertical';
  const animatedDir = path.join(outDir, 'animated-video');
  const decisionsPath = path.join(animatedDir, 'pattern-decisions.json');
  const raw = await fs.readFile(decisionsPath, 'utf-8');
  const decisions = JSON.parse(raw) as Array<{ scene: number }>;
  const scenes = decisions.map((d) => d.scene);
  const fps = 30;
  const dims = format === 'vertical' ? { width: 1080, height: 1920 } : format === 'square' ? { width: 1080, height: 1080 } : { width: 1920, height: 1080 };

  // Compute duration frames per scene from audio
  const timings: Array<{ scene: number; frames: number }> = [];
  for (const scene of scenes) {
    const audioPath = path.join(animatedDir, `segment-${scene}-audio.mp3`);
    let secs = 3.0;
    try { secs = await ffprobeDuration(audioPath); } catch {}
    const frames = Math.ceil(secs * fps) + 6; // pad ~0.2s
    timings.push({ scene, frames });
  }

  // Create temp entry with a root composition that sequences all segments
  const tempDir = path.join(process.cwd(), '.tmp-render-full');
  await fs.mkdir(tempDir, { recursive: true });
  const entryPath = path.join(tempDir, 'full-entry.tsx');

  const imports = scenes.map((s) => `import Segment${s} from '${path.resolve(path.join(animatedDir, `Segment${s}Component.tsx`))}';`).join('\n');
  const seqs = timings
    .map((t, idx) => {
      const from = timings.slice(0, idx).reduce((acc, v) => acc + v.frames, 0);
      return `      <Sequence from={${from}} durationInFrames={${t.frames}}><Segment${t.scene} /></Sequence>`;
    })
    .join('\n');

  const totalFrames = timings.reduce((acc, v) => acc + v.frames, 0);

  const entry = `
import React from 'react';
import { registerRoot } from 'remotion';
import { Composition, Sequence } from 'remotion';
${imports}

export const RemotionRoot: React.FC = () => {
  return (
    <Composition id="FullVideo" component={() => (
      <div style={{ width: ${dims.width}, height: ${dims.height}, background: '#ffffff' }}>
${seqs}
      </div>
    )} durationInFrames={${totalFrames}} fps={${fps}} width={${dims.width}} height={${dims.height}} />
  );
};

registerRoot(RemotionRoot);
`;

  await fs.writeFile(entryPath, entry);

  const silentOut = path.join(animatedDir, 'full-silent.mp4');
  const finalOut = path.join(animatedDir, 'full.mp4');

  try {
    const bundleLocation = await bundle({ entryPoint: entryPath, webpackOverride });
    const comp = await selectComposition({ serveUrl: bundleLocation, id: 'FullVideo' });
    await renderMedia({ composition: comp, serveUrl: bundleLocation, codec: 'h264', outputLocation: silentOut, inputProps: {} });

    // Concat per-segment audio into one track matching the video timeline
    const listPath = path.join(tempDir, 'audio.txt');
    let listContent = '';
    for (const t of timings) {
      const a = path.resolve(animatedDir, `segment-${t.scene}-audio.mp3`);
      try { await fs.access(a); listContent += `file '${a.replace(/'/g, "'\\''")}'\n`; } catch {}
    }
    const concatAudio = path.join(tempDir, 'audio-concat.mp3');
    await fs.writeFile(listPath, listContent);
    await new Promise<void>((resolve, reject) => {
      const args = ['-y', '-f', 'concat', '-safe', '0', '-i', listPath, '-c', 'copy', concatAudio];
      const p = spawn('ffmpeg', args, { stdio: 'inherit' });
      p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg concat failed'))));
    });

    // Mux audio onto the silent video
    await new Promise<void>((resolve, reject) => {
      const args = ['-y', '-i', silentOut, '-i', concatAudio, '-map', '0:v:0', '-map', '1:a:0', '-c:v', 'copy', '-c:a', 'aac', '-shortest', finalOut];
      const p = spawn('ffmpeg', args, { stdio: 'inherit' });
      p.on('exit', (code) => (code === 0 ? resolve() : reject(new Error('ffmpeg mux failed'))));
    });
    console.log(`Rendered full video: ${finalOut}`);
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
