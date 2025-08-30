import React from 'react';
import { CalloutBox } from '../.././remotion/ui-components/components/CalloutBox.tsx';
import { useVideoConfig } from 'remotion';

export const Scene4Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "width": 600,
  "height": 200,
  "borderWidth": 2,
  "borderRadius": 12,
  "padding": 24,
  "animationType": "fade",
  "direction": "up",
  "startAt": 0,
  "durationInFrames": 45,
  "style": {
    "backgroundColor": "#f0f0f0",
    "borderColor": "#4CAF50",
    "textColor": "#333",
    "fontSize": "24px",
    "padding": "20px",
    "borderRadius": "8px"
  },
  "icon": "lightbulb",
  "title": "Boosting Productivity",
  "titleColor": "#1f2937",
  "titleSize": 18,
  "shadow": true,
  "shadowColor": "rgba(0, 0, 0, 0.1)",
  "variant": "default"
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

export default Scene4Component;