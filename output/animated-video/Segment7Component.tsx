import React from 'react';
import { TitleSubhead } from '../.././remotion/patterns/TitleSubhead.tsx';
import { useVideoConfig } from 'remotion';

export const Scene7Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "format": "vertical",
  "title": "Empower Your Remote Team",
  "subhead": "Embrace a balanced approach to foster collaboration and productivity"
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
      <TitleSubhead {...props} />
    </div>
  );
};

export default Scene7Component;