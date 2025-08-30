import React from 'react';
import { CalloutBox } from '../.././remotion/ui-components/components/CalloutBox.tsx';
import { useVideoConfig } from 'remotion';

export const Scene6Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "children": "Sample callout content",
  "width": 600,
  "height": 200,
  "borderWidth": 2,
  "borderRadius": "12px",
  "padding": "20px",
  "animationType": "fadeIn",
  "direction": "up",
  "startAt": 0,
  "durationInFrames": 45,
  "titleColor": "#1f2937",
  "titleSize": 18,
  "shadow": true,
  "shadowColor": "rgba(0, 0, 0, 0.1)",
  "variant": "default",
  "content": "Transform your remote communication strategy and see the productivity soar!",
  "backgroundColor": "#007BFF",
  "textColor": "#FFFFFF",
  "icon": "📈",
  "fontSize": "24px",
  "duration": 10,
  "position": {
    "x": 50,
    "y": 50
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

export default Scene6Component;