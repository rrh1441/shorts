import React from 'react';
import { AnimatedText } from '../ui-components/components/AnimatedText';
import type { StatHeroProps } from './StatHero.schema';
import { tokensFor } from '../design/Tokens';

export const StatHero: React.FC<StatHeroProps> = ({ format, headline, statLabel, statValue }) => {
  const t = tokensFor(format);
  const valueText = String(statValue);

  const maxTextWidth = Math.min(920, t.canvas.width - t.layout.side * 2);
  return (
    <div style={{
      width: t.canvas.width,
      height: t.canvas.height,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      paddingTop: t.layout.top,
      paddingLeft: t.layout.side,
      paddingRight: t.layout.side,
      paddingBottom: t.layout.bottom,
      boxSizing: 'border-box',
      gap: t.layout.gap,
    }}>
      <div style={{ width: maxTextWidth }}>
        <AnimatedText
          text={headline}
          animationType="fade"
          fontSize={t.headline.size}
          fontWeight="bold"
          textAlign="left"
          color="#111827"
          durationInFrames={90}
        />
        <div style={{ width: 160, height: 6, background: '#111827', marginTop: 12, borderRadius: 9999 }} />
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: 16, marginTop: 10 }}>
        <div style={{ fontSize: t.stat.valueSize, fontWeight: 800, color: '#111827', lineHeight: 1 }}>
          {valueText}
        </div>
        <div style={{ fontSize: t.stat.labelSize, fontWeight: 600, letterSpacing: 1, color: '#374151', textTransform: 'uppercase' }}>
          {statLabel}
        </div>
      </div>
    </div>
  );
};

export default StatHero;
