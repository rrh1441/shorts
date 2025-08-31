import React from 'react';
import { CalloutPattern } from '../.././remotion/patterns/CalloutPattern.tsx';
import { useVideoConfig } from 'remotion';

export const Scene5Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "format": "vertical",
  "headline": "Key Point",
  "title": "Callout",
  "body": "Effective teams combine sync and async methods to enhance clarity and collaboration.",
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

export default Scene5Component;