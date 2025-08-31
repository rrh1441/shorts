import React from 'react';
import { StatBlock } from '../.././remotion/ui-components/components/StatBlock.tsx';
import { AnimatedText } from '../.././remotion/ui-components/components/AnimatedText.tsx';
import { useVideoConfig } from 'remotion';

export const Scene1Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "stats": [
    {
      "label": "Productivity Change",
      "value": "80",
      "format": "percentage"
    }
  ],
  "columns": 1,
  "width": 980,
  "height": 600,
  "backgroundColor": "#FFFFFF",
  "borderColor": "#e5e7eb",
  "showBorder": true,
  "animationType": "counter",
  "staggerDelay": 5,
  "startAt": 0,
  "titleColor": "#111827",
  "title": "80% of remote managers believe asynchronous communication boosts productivity.",
  "statistic": "80%",
  "description": "of remote managers believe asynchronous communication boosts productivity.",
  "animationDuration": 10,
  "counterAnimation": true,
  "layout": "centered",
  "textColor": "#333333",
  "fontSize": "48px",
  "subTextFontSize": "24px",
  "textAlignment": "center",
  "padding": {
    "top": "20px",
    "bottom": "20px",
    "left": "15px",
    "right": "15px"
  }
};
  const headline = "80% of remote managers believe asynchronous communication boosts productivity.";
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
        <StatBlock {...props} />
      </div>
    </div>
  );
};

export default Scene1Component;