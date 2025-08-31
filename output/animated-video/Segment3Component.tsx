import React from 'react';
import { CalloutBox } from '../.././remotion/ui-components/components/CalloutBox.tsx';
import { AnimatedText } from '../.././remotion/ui-components/components/AnimatedText.tsx';
import { useVideoConfig } from 'remotion';

export const Scene3Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "width": 600,
  "height": 200,
  "backgroundColor": "#ffcc00",
  "borderWidth": 2,
  "borderRadius": 15,
  "padding": 20,
  "animationType": "fade",
  "direction": "up",
  "startAt": 0,
  "durationInFrames": 45,
  "titleColor": "#1f2937",
  "titleSize": 18,
  "shadow": true,
  "shadowColor": "rgba(0, 0, 0, 0.1)",
  "variant": "default"
};
  const headline = "Challenges arise: misunderstandings, delays, and team disconnection.";
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
        <CalloutBox {...props} />
      </div>
    </div>
  );
};

export default Scene3Component;