#!/usr/bin/env tsx

/**
 * Generic Segment Renderer
 * Renders any SegmentXComponent.tsx to MP4 without composition registration
 * Usage: tsx renderSegment.ts <segment-component-path> <output-mp4-path>
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { webpackOverride } from './remotion-webpack-override';
import path from 'node:path';
import fs from 'node:fs/promises';

type RenderOptions = {
  frames?: number;
  fps?: number;
  width?: number;
  height?: number;
};

async function renderSegment(
  componentPath: string,
  outputPath: string,
  options?: RenderOptions
): Promise<void> {
  
  console.log(`🎬 Rendering segment: ${path.basename(componentPath)}`);
  
  // Create temporary entry point for this specific segment
  const tempDir = path.join(process.cwd(), '.tmp-render');
  await fs.mkdir(tempDir, { recursive: true });
  
  const componentName = path.basename(componentPath, '.tsx');
  const compositionId = componentName.replace(/[^a-zA-Z0-9\-\u4e00-\u9fa5]/g, '-');
  const tempEntryPath = path.join(tempDir, `${componentName}-entry.tsx`);
  
  const fps = options?.fps ?? 30;
  const width = options?.width ?? 1080;
  const height = options?.height ?? 1920;
  const frames = options?.frames ?? 300; // default 10s

  // Create dynamic entry point that registers just this segment
  const entryContent = `
import React from 'react';
import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import ${componentName} from '${path.resolve(componentPath)}';
import { ThemeProvider } from '@contentfork/remotion-runtime';

const SegmentComposition: React.FC = () => (
  <ThemeProvider>
    <${componentName} />
  </ThemeProvider>
);

export const RemotionRoot: React.FC = () => {
  return (
    <Composition
      id="${compositionId}"
      component={SegmentComposition}
      durationInFrames={${frames}}
      fps={${fps}}
      width={${width}}
      height={${height}}
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
      id: compositionId,
    });

    // Render to MP4
    console.log(`🎥 Rendering ${componentName} to MP4...`);
    await renderMedia({
      composition: comps,
      serveUrl: bundleLocation,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps: {},
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
    console.error('Usage: tsx renderSegment.ts <component-path> <output-path>');
    console.error('Example: tsx renderSegment.ts ./segments/Segment1Component.tsx ./output/segment-1.mp4');
    process.exit(1);
  }
  
  renderSegment(componentPath, outputPath, audioPath)
    .then(() => console.log('🎉 Segment rendering complete!'))
    .catch(console.error);
}

export { renderSegment };
