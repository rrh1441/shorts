import React from 'react';
import { StatRow } from '../.././remotion/patterns/StatRow.tsx';
import { useVideoConfig } from 'remotion';

export const Scene2Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "format": "horizontal",
  "headline": "Three Pillars of Products: Energy - potential, Intelligence - decide, Action - do",
  "stats": [
    {
      "label": "Pillar 1",
      "value": "Energy - potent…"
    },
    {
      "label": "Pillar 2",
      "value": "Intelligence - …"
    },
    {
      "label": "Pillar 3",
      "value": "Action - do"
    }
  ]
};
  return (
    <div style={{
      width: 1920,
      height: 1080,
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <StatRow {...props} />
    </div>
  );
};

export default Scene2Component;