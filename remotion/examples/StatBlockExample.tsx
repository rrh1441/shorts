import React from 'react';
import { Composition } from 'remotion';
import { StatBlock } from '../ui-components';

const StatBlockDemo: React.FC = () => {
  const sampleStats = [
    {
      label: 'Total Revenue',
      value: 1250000,
      format: 'currency' as const,
      color: '#10b981',
    },
    {
      label: 'Growth Rate',
      value: 23.5,
      format: 'percentage' as const,
      color: '#3b82f6',
    },
    {
      label: 'Active Users',
      value: 45678,
      format: 'number' as const,
      color: '#8b5cf6',
    },
    {
      label: 'Customer Satisfaction',
      value: 4.8,
      suffix: '/5',
      color: '#f59e0b',
    },
    {
      label: 'Market Share',
      value: 12.3,
      format: 'percentage' as const,
      color: '#ef4444',
    },
    {
      label: 'Team Members',
      value: 127,
      format: 'number' as const,
      color: '#06b6d4',
    }
  ];

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#f3f4f6'
    }}>
      <StatBlock
        stats={sampleStats}
        columns={3}
        width={900}
        height={400}
        title="Q3 2024 Performance Metrics"
        animationType="counter"
        staggerDelay={8}
        startAt={30}
      />
    </div>
  );
};

export const StatBlockExampleComposition = () => {
  return (
    <Composition
      id="StatBlockExample"
      component={StatBlockDemo}
      durationInFrames={300}
      fps={30}
      width={1920}
      height={1080}
    />
  );
};