import React from 'react';
import { AnimatedText } from '../.././remotion/ui-components/components/AnimatedText.tsx';
import { AnimatedText } from '../.././remotion/ui-components/components/AnimatedText.tsx';
import { useVideoConfig } from 'remotion';

export const Scene7Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "text": "Subscribe for more insights on mastering remote team dynamics!",
  "fontSize": 40,
  "fontWeight": "normal",
  "color": "#000000",
  "fontFamily": "Inter, sans-serif",
  "animationType": "fade",
  "direction": "left",
  "startAt": 0,
  "durationInFrames": 60,
  "characterDelay": 2,
  "textAlign": "left",
  "lineHeight": 1.2
};
  const headline = "Subscribe for more insights on mastering remote team dynamics!";
  const isVertical = true;
  const headlineSize = isVertical ? 72 : 56;
  
  return (
    <div style={{
      width: 1080,
      height: 1920,
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 40,
      boxSizing: 'border-box',
      gap: 24,
    }}>
      {headline && (
        <AnimatedText
          text={headline}
          animationType="fade"
          fontSize={headlineSize}
          fontWeight="bold"
          textAlign="center"
          color="#111827"
          durationInFrames={90}
        />
      )}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <AnimatedText {...props} />
      </div>
    </div>
  );
};

export default Scene7Component;