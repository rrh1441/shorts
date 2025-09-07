import React from 'react';
import { CalloutPattern } from '../.././remotion/patterns/CalloutPattern.tsx';
import { useVideoConfig } from 'remotion';

export const Scene3Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "format": "horizontal",
  "title": "Commoditize the Complement",
  "body": "In economic terms, energy, intelligence, and action are strong complements. America is betting that winning intelligence wins the future. China's bet is different: by making intelligence abundant thr…",
  "variant": "default"
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
      <CalloutPattern {...props} />
    </div>
  );
};

export default Scene3Component;