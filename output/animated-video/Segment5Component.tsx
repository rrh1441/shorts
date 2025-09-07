import React from 'react';
import { StatHero } from '../.././remotion/patterns/StatHero.tsx';
import { useVideoConfig } from 'remotion';

export const Scene5Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "format": "horizontal",
  "headline": "China has already made huge strides in controlling energy.",
  "statLabel": "China’s energy lead.  electricity vs US…",
  "statValue": "2.5x"
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
      <StatHero {...props} />
    </div>
  );
};

export default Scene5Component;