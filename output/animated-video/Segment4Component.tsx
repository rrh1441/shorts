import React from 'react';
import { QuotePull } from '../.././remotion/patterns/QuotePull.tsx';
import { useVideoConfig } from 'remotion';

export const Scene4Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "format": "horizontal",
  "quote": "Control energy and action; commoditize intelligence."
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
      <QuotePull {...props} />
    </div>
  );
};

export default Scene4Component;