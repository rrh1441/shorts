import React from 'react';
import { CalloutBox } from '../.././remotion/ui-components/components/CalloutBox.tsx';
import { AnimatedText } from '../.././remotion/ui-components/components/AnimatedText.tsx';
import { useVideoConfig } from 'remotion';

export const Scene6Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "children": "Are you ready to elevate your team's productivity? Start blending your communica",
  "width": 980,
  "height": 300,
  "borderWidth": 2,
  "borderRadius": 10,
  "padding": {
    "top": 20,
    "bottom": 20,
    "left": 15,
    "right": 15
  },
  "animationType": "slide",
  "direction": "up",
  "startAt": 0,
  "durationInFrames": 45,
  "titleColor": "#111827",
  "titleSize": 24,
  "shadow": true,
  "shadowColor": "rgba(0, 0, 0, 0.1)",
  "variant": "success",
  "title": "Call to action",
  "backgroundColor": "#00bcd4",
  "borderColor": "#e5e7eb",
  "showBorder": true,
  "text": "Are you ready to elevate your team's productivity? Start blending your communication methods today!",
  "icon": "check_circle",
  "animation": {
    "type": "fadeInUp",
    "duration": 1,
    "delay": 0
  },
  "textColor": "#ffffff",
  "duration": 10,
  "position": {
    "vertical": "center",
    "horizontal": "center"
  }
};
  const headline = "Are you ready to elevate your team's productivity? Start blending your communica";
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

export default Scene6Component;