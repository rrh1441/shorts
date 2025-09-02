import React from 'react';
import type { StatRowProps } from './StatRow.schema';
import { tokensFor } from '../design/Tokens';

export const StatRow: React.FC<StatRowProps> = ({ format, headline, stats }) => {
  const t = tokensFor(format);
  const maxTextWidth = Math.min(980, t.canvas.width - t.layout.side * 2);
  const cols = stats.length;
  return (
    <div style={{ width: t.canvas.width, height: t.canvas.height, background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: t.layout.top, paddingLeft: t.layout.side, paddingRight: t.layout.side, paddingBottom: t.layout.bottom, boxSizing: 'border-box', gap: t.layout.gap }}>
      {headline && (
        <div style={{ width: maxTextWidth }}>
          <div style={{ fontSize: t.headline.size, fontWeight: 800, color: '#111827', lineHeight: 1.05 }}>{headline}</div>
          <div style={{ width: 160, height: 6, background: '#111827', marginTop: 12, borderRadius: 9999 }} />
        </div>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, width: maxTextWidth, gap: 24 }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center', padding: 8 }}>
            <div style={{ fontSize: t.stat.valueSize, fontWeight: 800, color: '#111827', lineHeight: 1 }}>{String(s.value)}</div>
            <div style={{ fontSize: 20, fontWeight: 600, letterSpacing: 1, color: '#374151', textTransform: 'uppercase' }}>{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StatRow;

