import React from 'react';
import { CalloutBox } from '../.././remotion/ui-components/components/CalloutBox.tsx';
import { AnimatedText } from '../.././remotion/ui-components/components/AnimatedText.tsx';
import { useVideoConfig } from 'remotion';

export const Scene5Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "children": "Meet Team Zen: They embraced a blended approach and saw a 25% increase in produc",
  "width": 980,
  "height": 300,
  "borderWidth": 2,
  "borderRadius": 15,
  "padding": 20,
  "animationType": "slide",
  "direction": "up",
  "startAt": 0,
  "durationInFrames": 45,
  "titleColor": "#111827",
  "titleSize": 24,
  "shadow": true,
  "shadowColor": "rgba(0, 0, 0, 0.1)",
  "variant": "default",
  "title": "Illustrate success story",
  "backgroundColor": "#F0F8FF",
  "borderColor": "#e5e7eb",
  "showBorder": true,
  "textColor": "#333333",
  "icon": "success",
  "content": [
    {
      "type": "header",
      "text": "Meet Team Zen",
      "fontSize": 30,
      "fontWeight": "bold"
    },
    {
      "type": "body",
      "text": "They embraced a blended approach and saw a 25% increase in productivity!",
      "fontSize": 24
    }
  ],
  "duration": 10,
  "position": "center"
};
  const headline = "Meet Team Zen: They embraced a blended approach and saw a 25% increase in produc";
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

export default Scene5Component;