#!/usr/bin/env tsx

/**
 * Generic Segment Renderer
 * Renders any SegmentXComponent.tsx to MP4 without composition registration
 * Usage: tsx scripts/renderSegment.ts <segment-component-path> <output-mp4-path> [audio-path]
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { webpackOverride } from './remotion-webpack-override';
import path from 'node:path';
import fs from 'node:fs/promises';

async function renderSegment(
  componentPath: string,
  outputPath: string,
  audioPath?: string
): Promise<void> {
  
  console.log(`🎬 Rendering segment: ${path.basename(componentPath)}`);
  
  // Create temporary entry point for this specific segment
  const tempDir = path.join(process.cwd(), '.tmp-render');
  await fs.mkdir(tempDir, { recursive: true });
  
  const componentName = path.basename(componentPath, '.tsx');
  const tempEntryPath = path.join(tempDir, `${componentName}-entry.tsx`);
  
  // Create dynamic entry point that registers just this segment
  const entryContent = `
import React from 'react';
import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import ${componentName} from '${path.resolve(componentPath)}';

const SegmentComposition: React.FC = () => {
  return <${componentName} />;
};

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="${componentName}"
      component={SegmentComposition}
      durationInFrames={300} // 10 seconds at 30fps, adjust as needed
      fps={30}
      width={1080}
      height={1920}
      defaultProps={{}}
    />
  );
};

registerRoot(RemotionRoot);
`;

  await fs.writeFile(tempEntryPath, entryContent);
  
  try {
    // Bundle the temporary entry point
    console.log('📦 Bundling component...');
    const bundleLocation = await bundle({
      entryPoint: tempEntryPath,
      webpackOverride,
    });

    // Get composition info
    const comps = await selectComposition({
      serveUrl: bundleLocation,
      id: componentName,
    });

    // Render to MP4
    console.log(`🎥 Rendering ${componentName} to MP4...`);
    await renderMedia({
      composition: comps,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {},
      // Add audio if provided
      ...(audioPath && { audioCodec: 'aac' }),
    });

    console.log(`✅ Rendered: ${outputPath}`);
    
  } finally {
    // Cleanup temporary files
    await fs.rm(tempDir, { recursive: true, force: true });
  }
}

// CLI usage
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const componentPath = process.argv[2];
  const outputPath = process.argv[3];
  const audioPath = process.argv[4];
  
  if (!componentPath || !outputPath) {
    console.error('Usage: tsx scripts/renderSegment.ts <component-path> <output-path> [audio-path]');
    console.error('Example: tsx scripts/renderSegment.ts ./segments/Segment1Component.tsx ./output/segment-1.mp4 ./audio/segment-1.mp3');
    process.exit(1);
  }
  
  renderSegment(componentPath, outputPath, audioPath)
    .then(() => console.log('🎉 Segment rendering complete!'))
    .catch(console.error);
}

export { renderSegment };