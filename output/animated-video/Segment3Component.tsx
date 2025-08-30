import React from 'react';
import { CalloutBox } from '../.././remotion/ui-components/components/CalloutBox.tsx';
import { useVideoConfig } from 'remotion';

export const Scene3Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "children": "Sample callout content",
  "width": 600,
  "height": 200,
  "borderWidth": 2,
  "borderRadius": "15px",
  "padding": "20px",
  "animationType": "fade",
  "direction": "up",
  "startAt": 0,
  "durationInFrames": 45,
  "titleColor": "#1f2937",
  "titleSize": 18,
  "shadow": true,
  "shadowColor": "rgba(0, 0, 0, 0.1)",
  "variant": "default",
  "title": "Limitations of Flexibility",
  "icon": "⏳",
  " // hourglass icon representing time and limitations": "But just because it's flexible doesn't mean it's effective.",
  "backgroundColor": "#ffcccc",
  "textColor": "#333333",
  "duration": 10,
  "animation": "fade-in",
  "size": "medium",
  "position": {
    "top": "40%",
    "left": "10%",
    "right": "10%"
  }
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

export default Scene3Component;