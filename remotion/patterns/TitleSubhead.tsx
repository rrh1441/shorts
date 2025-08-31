import React from 'react';
import { AnimatedText } from '../ui-components/components/AnimatedText';
import type { TitleSubheadProps } from './TitleSubhead.schema';
import { tokensFor } from '../design/Tokens';

export const TitleSubhead: React.FC<TitleSubheadProps> = ({ format, title, subhead }) => {
  const t = tokensFor(format);
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
          text={title}
          animationType="fade"
          fontSize={t.headline.size}
          fontWeight="bold"
          textAlign="left"
          color="#111827"
          durationInFrames={90}
        />
        <div style={{ width: 160, height: 6, background: '#111827', marginTop: 12, borderRadius: 9999 }} />
      </div>
      {subhead && (
        <div style={{ width: maxTextWidth }}>
          <AnimatedText
            text={subhead}
            animationType="slide"
            direction="up"
            fontSize={t.subhead.size}
            fontWeight={600}
            textAlign="left"
            color="#374151"
            durationInFrames={90}
          />
        </div>
      )}
    </div>
  );
};

export default TitleSubhead;
