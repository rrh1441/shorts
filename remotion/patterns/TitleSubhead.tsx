import React from 'react';
import { AnimatedText } from '../ui-components/components/AnimatedText';
import type { TitleSubheadProps } from './TitleSubhead.schema';
import { tokensFor } from '../design/Tokens';

export const TitleSubhead: React.FC<TitleSubheadProps> = ({ format, title, subhead }) => {
  const t = tokensFor(format);
  return (
    <div style={{
      width: t.canvas.width,
      height: t.canvas.height,
      background: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      paddingTop: t.layout.top,
      paddingLeft: t.layout.side,
      paddingRight: t.layout.side,
      paddingBottom: t.layout.bottom,
      boxSizing: 'border-box',
      gap: t.layout.gap,
    }}>
      <AnimatedText
        text={title}
        animationType="fade"
        fontSize={t.headline.size}
        fontWeight="bold"
        textAlign="center"
        color="#111827"
        durationInFrames={90}
      />
      {subhead && (
        <AnimatedText
          text={subhead}
          animationType="slide"
          direction="up"
          fontSize={t.subhead.size}
          fontWeight={600}
          textAlign="center"
          color="#374151"
          durationInFrames={90}
        />
      )}
    </div>
  );
};

export default TitleSubhead;

