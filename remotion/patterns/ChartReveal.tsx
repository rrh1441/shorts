import React from 'react';
import { AnimatedText } from '../ui-components/components/AnimatedText';
import { BarChart } from '../ui-components/components/BarChart';
import type { ChartRevealProps } from './ChartReveal.schema';
import { tokensFor } from '../design/Tokens';

export const ChartReveal: React.FC<ChartRevealProps> = ({ format, headline, data, showValues }) => {
  const t = tokensFor(format);
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
      <div style={{ width: Math.min(980, t.canvas.width - t.layout.side * 2) }}>
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
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
        <BarChart
          data={data}
          width={t.stat.width}
          height={t.stat.height}
          showValues={showValues}
          animationType="grow"
          labelFontSize={t.subhead.size - 8}
          valueFontSize={t.subhead.size - 4}
          axisFontSize={t.subhead.size - 12}
        />
      </div>
    </div>
  );
};

export default ChartReveal;
