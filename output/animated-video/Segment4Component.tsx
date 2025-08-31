import React from 'react';
import { CalloutBox } from '../.././remotion/ui-components/components/CalloutBox.tsx';
import { AnimatedText } from '../.././remotion/ui-components/components/AnimatedText.tsx';
import { useVideoConfig } from 'remotion';

export const Scene4Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "children": "Integrate regular sync-up meetings and clear guidelines for effective communicat",
  "width": 980,
  "height": 300,
  "borderWidth": 2,
  "borderRadius": "10px",
  "padding": "20px",
  "animationType": "slide",
  "direction": "up",
  "startAt": 0,
  "durationInFrames": 45,
  "titleColor": "#111827",
  "titleSize": 24,
  "shadow": true,
  "shadowColor": "rgba(0, 0, 0, 0.1)",
  "variant": "default",
  "title": "Share solution",
  "backgroundColor": "#f0f8ff",
  "borderColor": "#e5e7eb",
  "showBorder": true,
  "text": "Integrate regular sync-up meetings\nand clear guidelines for effective communication.",
  "icon": "check-circle",
  "iconVariant": "success",
  "duration": 10,
  "textColor": "#333333",
  "fontSize": "24px"
};
  const headline = "Integrate regular sync-up meetings and clear guidelines for effective communicat";
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

export default Scene4Component;