import React from 'react';

interface StaticAssetProps {
  Component: React.ComponentType<any>;
  dimensions?: { width: number; height: number };
}

export const StaticAsset: React.FC<StaticAssetProps> = ({ Component }) => {
  // simply render generated component
  return <Component />;
};

export default StaticAsset;











