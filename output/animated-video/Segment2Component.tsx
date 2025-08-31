import React from 'react';
import { CalloutPattern } from '../.././remotion/patterns/CalloutPattern.tsx';
import { useVideoConfig } from 'remotion';

export const Scene2Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = {
  "format": "vertical",
  "headline": "Key Point",
  "title": "Asynchronous Comm.",
  "body": "Asynchronous communication allows team members to work at their own pace, but is it enough?",
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

export default Scene2Component;