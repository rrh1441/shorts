import React from 'react';
import { StatBlock } from '../.././remotion/ui-components/components/StatBlock.tsx';
import { useVideoConfig } from 'remotion';

export const Scene1Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "stats": [
    {
      "label": "Sample Metric",
      "value": 42,
      "format": "number"
    }
  ],
  "columns": 2,
  "width": 800,
  "height": 400,
  "backgroundColor": "#ffffff",
  "borderColor": "#0084ff",
  "showBorder": true,
  "animationType": "fadeIn",
  "staggerDelay": 5,
  "startAt": 0,
  "titleColor": "#1f2937",
  "statistic": "70%",
  "description": "of remote teams report confusion and delay due to poor communication.",
  "animationDuration": 2,
  "counterAnimation": true,
  "fontSizeStatistic": 72,
  "fontSizeDescription": 36,
  "textColor": "#333333",
  "borderWidth": 3,
  "padding": 20,
  "showIcon": false,
  "displayDuration": 8
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
      <StatBlock {...props} />
    </div>
  );
};

export default Scene1Component;