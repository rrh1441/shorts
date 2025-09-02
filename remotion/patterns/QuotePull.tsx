import React from 'react';
import type { QuotePullProps } from './QuotePull.schema';
import { tokensFor } from '../design/Tokens';

export const QuotePull: React.FC<QuotePullProps> = ({ format, quote, attribution }) => {
  const t = tokensFor(format);
  const maxTextWidth = Math.min(980, t.canvas.width - t.layout.side * 2);
  return (
    <div style={{ width: t.canvas.width, height: t.canvas.height, background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: t.layout.top, paddingLeft: t.layout.side, paddingRight: t.layout.side, paddingBottom: t.layout.bottom, boxSizing: 'border-box', gap: t.layout.gap }}>
      <div style={{ width: maxTextWidth }}>
        <div style={{ fontSize: t.headline.size, fontWeight: 800, color: '#111827', lineHeight: 1.05 }}>“{quote}”</div>
        <div style={{ width: 160, height: 6, background: '#111827', marginTop: 12, borderRadius: 9999 }} />
      </div>
      {attribution && <div style={{ fontSize: 48, color: '#374151' }}>— {attribution}</div>}
    </div>
  );
};

export default QuotePull;

