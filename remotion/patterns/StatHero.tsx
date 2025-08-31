import React from 'react';
import { AnimatedText } from '../ui-components/components/AnimatedText';
import { StatBlock } from '../ui-components/components/StatBlock';
import type { StatHeroProps } from './StatHero.schema';
import { tokensFor } from '../design/Tokens';

export const StatHero: React.FC<StatHeroProps> = ({ format, headline, statLabel, statValue, valueFormat }) => {
  const t = tokensFor(format);

  const numericValue = typeof statValue === 'string' ? Number(String(statValue).replace(/%/g, '')) : statValue;
  const isPercent = typeof statValue === 'string' && String(statValue).includes('%');
  const finalFormat = valueFormat || (isPercent ? 'percentage' : 'number');

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
        text={headline}
        animationType="fade"
        fontSize={t.headline.size}
        fontWeight="bold"
        textAlign="center"
        color="#111827"
        durationInFrames={90}
      />
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <StatBlock
          stats={[{ label: statLabel, value: numericValue as any, format: finalFormat as any }]}
          columns={1}
          width={t.stat.width}
          height={t.stat.height}
          animationType="counter"
          valueFontSize={t.stat.valueSize}
          labelFontSize={t.stat.labelSize}
          titleSize={t.stat.titleSize}
        />
      </div>
    </div>
  );
};

export default StatHero;

