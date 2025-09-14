#!/usr/bin/env tsx

/**
 * Wrap an external, non-interactive React component into a format-aware container.
 * Usage:
 *   npm run wrap:external -- <source.tsx> <SegmentXComponent.tsx> [format] [gutters]
 * Example:
 *   npm run wrap:external -- ./output/animated-video/Segment1Component.tsx ./output/animated-video/Segment1Wrapped.tsx horizontal true
 */

import fs from 'node:fs/promises';
import path from 'node:path';

const sizes = {
  horizontal: { width: 1920, height: 1080 },
  vertical: { width: 1080, height: 1920 },
  square: { width: 1080, height: 1080 },
} as const;

async function main() {
  const source = process.argv[2];
  const target = process.argv[3];
  const format = (process.argv[4] as keyof typeof sizes) || 'horizontal';
  const gutters = String(process.argv[5] || 'true').toLowerCase() !== 'false';
  if (!source || !target) {
    console.error('Usage: wrap:external <source.tsx> <SegmentXComponent.tsx> [format] [gutters=true|false]');
    process.exit(1);
  }
  const absSource = path.resolve(source);
  const absTarget = path.resolve(target);
  const relImportRaw = path.relative(path.dirname(absTarget), absSource).replace(/\\/g, '/');
  const relImport = relImportRaw.startsWith('.') ? relImportRaw : `./${relImportRaw}`;
  const box = sizes[format] || sizes.horizontal;
  const pad = gutters ? Math.floor(Math.min(box.width, box.height) * 0.03) : 0;
  const code = `import React from 'react';
import External from '${relImport}';

export const SceneComponent: React.FC = () => {
  return (
    <div style={{
      width: ${box.width},
      height: ${box.height},
      backgroundColor: '#0f172a',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}>
      <div style={{ width: '100%', height: '100%', padding: ${pad}, boxSizing: 'border-box' }}>
        <External />
      </div>
    </div>
  );
};

export default SceneComponent;
`;
  await fs.mkdir(path.dirname(absTarget), { recursive: true });
  await fs.writeFile(absTarget, code);
  console.log(`Wrote wrapper: ${absTarget}`);
}

main().catch((e) => {
  console.error('wrap-external failed:', e?.message || e);
  process.exit(1);
});
