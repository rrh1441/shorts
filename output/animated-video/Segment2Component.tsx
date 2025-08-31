import React from 'react';
import { ChartReveal } from '../../remotion/patterns/ChartReveal.tsx';

const Component: React.FC = () => {
  const props = {
  "format": "vertical",
  "headline": "OpenAI vs DeepSeek: challenge window",
  "data": [
    {
      "label": "OpenAI",
      "value": 10
    },
    {
      "label": "DeepSeek",
      "value": 9
    }
  ],
  "showValues": true
};
  return (
    <div style={{ width: 1080, height: 1920, background: props.format==='vertical' ? '#ffffff' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <ChartReveal {...props} />
    </div>
  );
}

export default Component;
