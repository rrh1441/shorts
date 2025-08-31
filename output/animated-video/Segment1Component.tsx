import React from 'react';
import { TitleSubhead } from '../.././remotion/patterns/TitleSubhead.tsx';
import { useVideoConfig } from 'remotion';

export const Scene1Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
    format: 'vertical' as const,
    title: 'Speed Is the Only Moat',
    subhead: 'Moats are draining. Winners outpace, out‑innovate, and out‑scale.',
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

export default Scene1Component;
