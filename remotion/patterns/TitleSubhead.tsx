import React from 'react';
import { AnimatedText } from '../ui-components/components/AnimatedText';
import { TitleCard } from '@contentfork/remotion-runtime/components';
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
        <TitleCard title={title} subtitle={subhead} align="left" />
      </div>
    </div>
  );
};

export default TitleSubhead;
