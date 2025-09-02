import React from 'react';
import type { TimelineProps } from './Timeline.schema';
import { tokensFor } from '../design/Tokens';

export const Timeline: React.FC<TimelineProps> = ({ format, headline, steps }) => {
  const t = tokensFor(format);
  const maxTextWidth = Math.min(980, t.canvas.width - t.layout.side * 2);
  return (
    <div style={{ width: t.canvas.width, height: t.canvas.height, background: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'flex-start', paddingTop: t.layout.top, paddingLeft: t.layout.side, paddingRight: t.layout.side, paddingBottom: t.layout.bottom, boxSizing: 'border-box', gap: t.layout.gap }}>
      {headline && (
        <div style={{ width: maxTextWidth }}>
          <div style={{ fontSize: t.headline.size, fontWeight: 800, color: '#111827', lineHeight: 1.05 }}>{headline}</div>
          <div style={{ width: 160, height: 6, background: '#111827', marginTop: 12, borderRadius: 9999 }} />
        </div>
      )}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, width: maxTextWidth }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 16, alignItems: 'start' }}>
            <div style={{ width: 24, height: 24, borderRadius: 9999, background: '#111827', marginTop: 8 }} />
            <div>
              <div style={{ fontSize: t.subhead.size, fontWeight: 700, color: '#111827', lineHeight: 1.1 }}>{s.title}</div>
              {s.body && <div style={{ fontSize: 48, color: '#374151', lineHeight: 1.35 }}>{s.body}</div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Timeline;

