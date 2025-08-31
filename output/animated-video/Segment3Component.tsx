import React from 'react';
import { CalloutPattern } from '../.././remotion/patterns/CalloutPattern.tsx';
import { useVideoConfig } from 'remotion';

export const Scene3Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "format": "vertical",
  "headline": "Key Point",
  "title": "Callout",
  "body": "Studies show that asynchronous communication alone doesn't guarantee higher productivity.",
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

export default Scene3Component;