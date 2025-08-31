import React from 'react';
import { StatHero } from '../.././remotion/patterns/StatHero.tsx';
import { useVideoConfig } from 'remotion';

export const Scene1Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "format": "vertical",
  "headline": "Communication Challenges in Remote Teams",
  "statLabel": "Percentage of Teams",
  "statValue": 70,
  "valueFormat": "percentage"
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
      <StatHero {...props} />
    </div>
  );
};

export default Scene1Component;