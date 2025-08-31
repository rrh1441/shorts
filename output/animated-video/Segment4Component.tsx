import React from 'react';
import { CalloutPattern } from '../.././remotion/patterns/CalloutPattern.tsx';
import { useVideoConfig } from 'remotion';

export const Scene4Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "format": "vertical",
  "headline": "Key Point",
  "title": "Callout",
  "body": "Over-reliance on messages can lead to ambiguity and miscommunication.",
  "variant": "info"
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
      <CalloutPattern {...props} />
    </div>
  );
};

export default Scene4Component;