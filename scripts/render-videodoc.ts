#!/usr/bin/env tsx

/**
 * Render VideoDoc to MP4 using Remotion
 * Input: videoDoc.json + audio file
 * Output: MP4 video
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { VideoDoc } from '../shared/scene-dsl';
import { generateCompositions } from '../shared/videodoc-to-remotion';

async function main() {
  const videoDocPath = process.argv[2] || './output/videoDoc.json';
  const outputPath = process.argv[3] || './output/video.mp4';
  const audioPath = process.argv[4]; // Optional audio file
  
  // Parse arguments
  const args = process.argv.slice(5);
  const aspectRaw = args.find(arg => arg.startsWith('--aspect='))?.split('=')[1] || '';
  const qualityArg = args.find(arg => arg.startsWith('--quality='))?.split('=')[1];
  const force = args.includes('--force');
  
  const aspectMap: Record<string, 'horizontal' | 'square' | 'vertical'> = {
    'horizontal': 'horizontal', '16:9': 'horizontal', 'landscape': 'horizontal',
    'square': 'square', '1:1': 'square',
    'vertical': 'vertical', '9:16': 'vertical', 'portrait': 'vertical'
  };
  const aspect = (aspectMap[aspectRaw] || 'horizontal') as 'horizontal' | 'square' | 'vertical';
  const quality = parseInt(qualityArg || '1'); // 1 = high quality
  
  try {
    console.log(`🎬 Rendering VideoDoc to MP4...`);
    console.log(`   Input: ${videoDocPath}`);
    console.log(`   Output: ${outputPath}`);
    console.log(`   Aspect: ${aspect}`);
    if (audioPath) console.log(`   Audio: ${audioPath}`);
    
    // Load VideoDoc
    const videoDoc: VideoDoc = JSON.parse(await fs.readFile(videoDocPath, 'utf-8'));

    // Lint gating: block render if lint-report exists and failed, unless --force
    try {
      const lintPath = path.join(path.dirname(videoDocPath), 'lint-report.json');
      const lintExists = await fs
        .access(lintPath)
        .then(() => true)
        .catch(() => false);
      if (lintExists) {
        const lintReport = JSON.parse(await fs.readFile(lintPath, 'utf-8'));
        if (!lintReport.passed && !force) {
          console.error('❌ Lint gates failed. Fix issues or re-run with --force to override.');
          console.error(lintReport.summary || 'See lint-report.json for details.');
          process.exit(1);
        }
      }
    } catch (e) {
      // Non-blocking
    }
    
    // Verify audio file exists if provided, else auto-detect saved narration (vo.mp3)
    let audioSrc: string | undefined;
    if (audioPath) {
      try {
        await fs.access(audioPath);
        audioSrc = path.resolve(audioPath);
        console.log(`✅ Audio file found: ${audioSrc}`);
      } catch {
        console.warn(`⚠️  Audio file not found: ${audioPath}, rendering without audio`);
      }
    } else {
      const candidate = path.join(path.dirname(videoDocPath), 'vo.mp3');
      const exists = await fs
        .access(candidate)
        .then(() => true)
        .catch(() => false);
      if (exists) {
        audioSrc = path.resolve(candidate);
        console.log(`🎧 Using detected narration audio: ${audioSrc}`);
      }
    }
    
    // Create temporary Remotion entry point
    const tempDir = path.join(process.cwd(), '.tmp');
    await fs.mkdir(tempDir, { recursive: true });
    
    const entryPoint = path.join(tempDir, 'remotion-entry.tsx');
    await createRemotionEntry(entryPoint, videoDoc, audioSrc, aspect);
    
    console.log(`📦 Bundling Remotion project...`);
    
    // Bundle the Remotion project
    const bundled = await bundle({
      entryPoint,
      onProgress: (progress) => {
        if (progress % 20 === 0) {
          console.log(`   Bundling: ${progress}%`);
        }
      },
      webpackOverride: (config) => {
        // Add any webpack overrides needed
        return config;
      }
    });
    
    console.log(`🎯 Selecting composition...`);
    
    // Get compositions
    const compositions = await selectComposition({
      serveUrl: bundled,
      id: videoDoc.story.controllingIdea.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30),
      inputProps: {
        videoDoc,
        audioSrc
      }
    });
    
    console.log(`🎬 Rendering video...`);
    console.log(`   Composition: ${compositions.id}`);
    console.log(`   Duration: ${compositions.durationInFrames} frames (${(compositions.durationInFrames / compositions.fps).toFixed(1)}s)`);
    console.log(`   Dimensions: ${compositions.width}x${compositions.height}`);
    
    // Ensure output directory exists
    await fs.mkdir(path.dirname(outputPath), { recursive: true });
    
    // Render the video
    await renderMedia({
      composition: compositions,
      serveUrl: bundled,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {
        videoDoc,
        audioSrc
      },
      onProgress: ({ renderedFrames, encodedFrames, totalFrames }) => {
        const progress = Math.round((renderedFrames / totalFrames) * 100);
        if (progress % 10 === 0) {
          console.log(`   Rendering: ${progress}% (${renderedFrames}/${totalFrames} frames)`);
        }
      },
      // Quality settings
      crf: quality === 1 ? 18 : quality === 2 ? 23 : 28,
      pixelFormat: 'yuv420p',
      // Audio settings
      ...(audioSrc ? {
        audioBitrate: '192000',
        audioCodec: 'aac'
      } : {})
    });
    
    // Clean up temp files
    await fs.rm(tempDir, { recursive: true, force: true });
    
    console.log(`✅ Video rendered successfully: ${outputPath}`);
    
    // Show file info
    const stats = await fs.stat(outputPath);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    console.log(`   File size: ${sizeMB} MB`);
    console.log(`   Duration: ${(compositions.durationInFrames / compositions.fps).toFixed(1)}s`);
    
  } catch (error: any) {
    console.error('❌ Rendering failed:', error.message);
    
    // Clean up on error
    const tempDir = path.join(process.cwd(), '.tmp');
    await fs.rm(tempDir, { recursive: true, force: true }).catch(() => {});
    
    process.exit(1);
  }
}

async function createRemotionEntry(
  entryPath: string,
  videoDoc: VideoDoc,
  audioSrc: string | undefined,
  aspect: 'horizontal' | 'square' | 'vertical'
) {
  // Calculate dimensions
  const dimensions = {
    horizontal: { width: 1920, height: 1080 },
    square: { width: 1080, height: 1080 },
    vertical: { width: 1080, height: 1920 }
  };
  
  const { width, height } = dimensions[aspect];
  
  // Calculate total duration
  const totalDurationMs = videoDoc.scenes.reduce((sum, scene) => sum + (scene.durationMs || 0), 0);
  const fps = 30;
  const durationInFrames = Math.round((totalDurationMs / 1000) * fps);
  
  const compositionId = videoDoc.story.controllingIdea.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30) || 'VideoDocComposition';
  
  // Create the entry point file
  const entryContent = `
import React from 'react';
import { Composition, registerRoot } from 'remotion';
import { VideoDocComposition } from '../shared/videodoc-to-remotion';

const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="${compositionId}"
        component={VideoDocComposition}
        durationInFrames={${durationInFrames}}
        fps={${fps}}
        width={${width}}
        height={${height}}
        defaultProps={{
          videoDoc: ${JSON.stringify(videoDoc, null, 2)},
          audioSrc: ${audioSrc ? `"${audioSrc}"` : 'undefined'}
        }}
      />
    </>
  );
};

registerRoot(RemotionRoot);
`;
  
  await fs.writeFile(entryPath, entryContent);
}

main();
