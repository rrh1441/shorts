import React from 'react';
import { CalloutBox } from '../.././remotion/ui-components/components/CalloutBox.tsx';
import { useVideoConfig } from 'remotion';

export const Scene2Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "children": "Sample callout content",
  "width": 600,
  "height": 200,
  "borderWidth": 2,
  "borderRadius": 12,
  "padding": 20,
  "animationType": "fadeIn",
  "direction": "up",
  "startAt": 0,
  "durationInFrames": 45,
  "titleColor": "#1f2937",
  "titleSize": 18,
  "shadow": true,
  "shadowColor": "rgba(0, 0, 0, 0.1)",
  "variant": "default",
  "backgroundColor": "#f9f9f9",
  "borderColor": "#ffcc00",
  "icon": "🔍",
  "content": {
    "title": "Misconception Alert!",
    "text": "Many believe asynchronous communication is the ultimate solution for productivity.",
    "textAnimation": "slideUp"
  },
  "duration": 10,
  "margin": 10,
  "textColor": "#333333",
  "titleFontSize": 24,
  "textFontSize": 18,
  "titleFontWeight": "bold",
  "textAlign": "center"
};
  
  return (
    <div style={{
      width: 1080,
      height: 1920,
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <CalloutBox {...props} />
    </div>
  );
};

export default Scene2Component;