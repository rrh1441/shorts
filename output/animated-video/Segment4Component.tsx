import React from 'react';
import { CalloutPattern } from '../../remotion/patterns/CalloutPattern.tsx';

const Component: React.FC = () => {
  const props = {
  "format": "vertical",
  "title": "DeepSeek example",
  "body": "DeepSeek example",
  "variant": "default"
};
  return (
    <div style={{ width: 1080, height: 1920, background: props.format==='vertical' ? '#ffffff' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CalloutPattern {...props} />
    </div>
  );
}

export default Component;
