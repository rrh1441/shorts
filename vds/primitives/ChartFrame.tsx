import React from 'react';
import { COLORS, SPACING, SpacingToken } from '../tokens';
import { MotionVariant, getRemotionAnimation } from '../motion';
import { Text } from './Text';
import { Stack } from './Stack';

export interface ChartFrameProps {
  chart: 'bar' | 'line' | 'pie' | 'metric';
  data: any;
  
  // Layout
  emphasize?: number[]; // Indices to emphasize
  padding?: SpacingToken;
  
  // Animation
  motion?: MotionVariant;
  delay?: number; // frames
  
  // Remotion context
  frame?: number;
  totalFrames?: number;
  
  // Override styles
  style?: React.CSSProperties;
}

export const ChartFrame: React.FC<ChartFrameProps> = ({
  chart,
  data,
  emphasize = [],
  padding = 4,
  motion,
  delay = 0,
  frame = 0,
  totalFrames = 100,
  style = {}
}) => {
  // Apply motion if specified (with delay)
  const effectiveFrame = Math.max(0, frame - delay);
  const motionProps = motion 
    ? getRemotionAnimation(motion, 'entrance', effectiveFrame, totalFrames)
    : { opacity: 1, transform: 'none' };
  
  const containerStyle: React.CSSProperties = {
    padding: SPACING[padding],
    opacity: motionProps.opacity,
    transform: motionProps.transform,
    ...style
  };
  
  switch (chart) {
    case 'metric':
      return (
        <MetricChart 
          data={data} 
          style={containerStyle}
          emphasize={emphasize}
        />
      );
      
    case 'bar':
      return (
        <BarChart 
          data={data} 
          style={containerStyle}
          emphasize={emphasize}
        />
      );
      
    case 'line':
      return (
        <LineChart 
          data={data} 
          style={containerStyle}
          emphasize={emphasize}
        />
      );
      
    case 'pie':
      return (
        <PieChart 
          data={data} 
          style={containerStyle}
          emphasize={emphasize}
        />
      );
      
    default:
      return (
        <div style={containerStyle}>
          <Text color="neutrals.600">Chart: {chart}</Text>
        </div>
      );
  }
};

interface ChartComponentProps {
  data: any;
  style: React.CSSProperties;
  emphasize: number[];
}

const MetricChart: React.FC<ChartComponentProps> = ({ data, style, emphasize }) => {
  if (!data?.value || !data?.label) {
    return <div style={style}>Invalid metric data</div>;
  }
  
  return (
    <Stack direction="vertical" align="center" gap={2} style={style}>
      <Text 
        size="hero" 
        weight="bold" 
        color="brand.primary"
        align="center"
      >
        {data.value}
      </Text>
      <Text 
        size="subtitle" 
        color="neutrals.600"
        align="center"
      >
        {data.label}
      </Text>
    </Stack>
  );
};

const BarChart: React.FC<ChartComponentProps> = ({ data, style, emphasize }) => {
  if (!data?.labels || !data?.values) {
    return <div style={style}>Invalid bar chart data</div>;
  }
  
  const maxValue = Math.max(...data.values);
  const barHeight = 160; // px
  
  return (
    <div style={style}>
      <div style={{
        display: 'flex',
        alignItems: 'end',
        justifyContent: 'center',
        gap: SPACING[3],
        height: barHeight + 40,
        marginBottom: SPACING[2]
      }}>
        {data.labels.map((label: string, index: number) => {
          const value = data.values[index] || 0;
          const height = (value / maxValue) * barHeight;
          const isEmphasized = emphasize.includes(index);
          
          return (
            <div key={label} style={{ 
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: SPACING[1]
            }}>
              <div
                style={{
                  width: '48px',
                  height: `${height}px`,
                  backgroundColor: isEmphasized ? COLORS.brand.primary : COLORS.neutrals[300],
                  borderRadius: '4px',
                  transition: 'all 0.3s ease'
                }}
              />
              <Text size="caption" color="neutrals.600" align="center">
                {label}
              </Text>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const LineChart: React.FC<ChartComponentProps> = ({ data, style, emphasize }) => {
  if (!data?.labels || !data?.values) {
    return <div style={style}>Invalid line chart data</div>;
  }
  
  const maxValue = Math.max(...data.values);
  const minValue = Math.min(...data.values);
  const range = maxValue - minValue;
  const chartWidth = 300;
  const chartHeight = 160;
  
  // Generate SVG path
  const points = data.values.map((value: number, index: number) => {
    const x = (index / (data.values.length - 1)) * chartWidth;
    const y = chartHeight - ((value - minValue) / range) * chartHeight;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <div style={style}>
      <svg width={chartWidth} height={chartHeight + 40} style={{ display: 'block', margin: '0 auto' }}>
        <polyline
          points={points}
          fill="none"
          stroke={COLORS.brand.primary}
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {data.values.map((value: number, index: number) => {
          const x = (index / (data.values.length - 1)) * chartWidth;
          const y = chartHeight - ((value - minValue) / range) * chartHeight;
          const isEmphasized = emphasize.includes(index);
          
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r={isEmphasized ? 6 : 4}
              fill={isEmphasized ? COLORS.brand.accent : COLORS.brand.primary}
            />
          );
        })}
      </svg>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: SPACING[2],
        width: chartWidth,
        margin: '0 auto'
      }}>
        {data.labels.map((label: string, index: number) => (
          <Text key={index} size="caption" color="neutrals.600" align="center">
            {label}
          </Text>
        ))}
      </div>
    </div>
  );
};

const PieChart: React.FC<ChartComponentProps> = ({ data, style, emphasize }) => {
  if (!data?.labels || !data?.values) {
    return <div style={style}>Invalid pie chart data</div>;
  }
  
  const total = data.values.reduce((sum: number, value: number) => sum + value, 0);
  const radius = 60;
  const centerX = 80;
  const centerY = 80;
  
  let cumulativeAngle = 0;
  const colors = [COLORS.brand.primary, COLORS.brand.accent, COLORS.neutrals[400], COLORS.neutrals[600]];
  
  return (
    <div style={style}>
      <svg width={160} height={160} style={{ display: 'block', margin: '0 auto' }}>
        {data.values.map((value: number, index: number) => {
          const angle = (value / total) * 360;
          const startAngle = cumulativeAngle;
          const endAngle = cumulativeAngle + angle;
          
          const x1 = centerX + radius * Math.cos((startAngle - 90) * Math.PI / 180);
          const y1 = centerY + radius * Math.sin((startAngle - 90) * Math.PI / 180);
          const x2 = centerX + radius * Math.cos((endAngle - 90) * Math.PI / 180);
          const y2 = centerY + radius * Math.sin((endAngle - 90) * Math.PI / 180);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          const isEmphasized = emphasize.includes(index);
          
          const pathData = [
            `M ${centerX} ${centerY}`,
            `L ${x1} ${y1}`,
            `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
            'Z'
          ].join(' ');
          
          cumulativeAngle += angle;
          
          return (
            <path
              key={index}
              d={pathData}
              fill={colors[index % colors.length]}
              stroke={isEmphasized ? COLORS.neutrals[900] : 'none'}
              strokeWidth={isEmphasized ? 2 : 0}
            />
          );
        })}
      </svg>
    </div>
  );
};