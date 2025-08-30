import React from 'react';
import { CalloutBox } from '../.././remotion/ui-components/components/CalloutBox.tsx';
import { useVideoConfig } from 'remotion';

export const Scene7Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "children": "Sample callout content",
  "width": 600,
  "height": 200,
  "borderWidth": 2,
  "borderRadius": 12,
  "padding": {
    "top": 20,
    "right": 20,
    "bottom": 20,
    "left": 20
  },
  "animationType": "fade",
  "direction": "up",
  "startAt": 0,
  "durationInFrames": 45,
  "titleColor": "#1f2937",
  "titleSize": 18,
  "shadow": true,
  "shadowColor": "rgba(0, 0, 0, 0.1)",
  "variant": "default",
  "title": "Final Reminder",
  "content": "Remember, asynchronous communication is just a tool—use it wisely for maximum impact.",
  "backgroundColor": "#F0F8FF",
  "textColor": "#333333",
  "borderColor": "#007BFF",
  "icon": "info",
  "animation": {
    "type": "fadeIn",
    "duration": 1,
    "delay": 0
  },
  "duration": 10,
  "fontSize": "24px",
  "textAlign": "center",
  "maxWidth": "80%"
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

export default Scene7Component;