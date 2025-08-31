import React from 'react';
import { AnimatedText } from '../ui-components/components/AnimatedText';
import { CalloutBox } from '../ui-components/components/CalloutBox';
import type { CalloutPatternProps } from './CalloutPattern.schema';
import { tokensFor } from '../design/Tokens';

export const CalloutPattern: React.FC<CalloutPatternProps> = ({ format, headline, title, body, variant }) => {
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
      {headline && (
        <AnimatedText
          text={headline}
          animationType="fade"
          fontSize={t.headline.size}
          fontWeight="bold"
          textAlign="center"
          color="#111827"
          durationInFrames={90}
        />
      )}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <CalloutBox
          title={title}
          children={body}
          variant={variant}
          width={t.callout.width}
          height={t.callout.height}
          padding={32}
          borderRadius={16}
          titleSize={t.callout.titleSize}
          animationType="slide"
          direction="up"
          showBorder
        />
      </div>
    </div>
  );
};

export default CalloutPattern;

