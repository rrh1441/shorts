import React from 'react';
import { CalloutBox } from '../.././remotion/ui-components/components/CalloutBox.tsx';
import { useVideoConfig } from 'remotion';

export const Scene5Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "width": 600,
  "height": 200,
  "backgroundColor": "#ffffff",
  "borderColor": "#007bff",
  "borderWidth": 2,
  "borderRadius": 10,
  "padding": 20,
  "animationType": "fade",
  "direction": "up",
  "startAt": 0,
  "durationInFrames": 45,
  "icon": {
    "type": "info",
    "color": "#007bff",
    "size": 40
  },
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

export default Scene5Component;