import React from 'react';
import { AnimatedText } from '../ui-components/components/AnimatedText';
import { CalloutBox } from '../ui-components/components/CalloutBox';
import type { CalloutPatternProps } from './CalloutPattern.schema';
import { tokensFor } from '../design/Tokens';

export const CalloutPattern: React.FC<CalloutPatternProps> = ({ format, headline, title, body, variant }) => {
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
      {headline && (
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
      )}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'flex-start', width: '100%' }}>
        <div style={{ display: 'flex', alignItems: 'stretch', gap: 20, width: Math.min(maxTextWidth + 8 + 20, t.canvas.width - t.layout.side * 2) }}>
          <div style={{ width: 8, borderRadius: 9999, background: '#111827', flex: '0 0 auto' }} />
          <CalloutBox
            title={title}
            children={body}
            variant={'default'}
            width={Math.min(t.callout.width, maxTextWidth)}
            height={t.callout.height}
            padding={32}
            borderRadius={12}
            titleSize={t.callout.titleSize}
            animationType="fade"
            direction="up"
            borderWidth={0}
            borderColor={'#111827'}
            shadow={false}
            backgroundColor={'#ffffff'}
            bodyFontSize={t.subhead.size}
          />
        </div>
      </div>
    </div>
  );
};

export default CalloutPattern;
