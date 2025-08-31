import React from 'react';
import { TitleSubhead } from '../../remotion/patterns/TitleSubhead.tsx';

const Component: React.FC = () => {
  const props = {
  "format": "vertical",
  "title": "Speed is the only defense for the modern organization"
};
  return (
    <div style={{ width: 1080, height: 1920, background: props.format==='vertical' ? '#ffffff' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <TitleSubhead {...props} />
    </div>
  );
}

export default Component;
