import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { StatBlockPropsSchema, getStatBlockDefaults } from './StatBlock.schema';
import type { StatBlockProps, StatItem } from './StatBlock.schema';

// Export schema and defaults for AI consumption
export { StatBlockPropsSchema, getStatBlockDefaults };

const formatValue = (value: string | number, format?: string, prefix?: string, suffix?: string): string => {
  let formatted = value.toString();
  
  if (typeof value === 'number') {
    switch (format) {
      case 'percentage':
        formatted = `${value}%`;
        break;
      case 'currency':
        formatted = `$${value.toLocaleString()}`;
        break;
      case 'number':
        formatted = value.toLocaleString();
        break;
      default:
        formatted = value.toString();
    }
  }
  
  return `${prefix || ''}${formatted}${suffix || ''}`;
};

export const StatBlock: React.FC<StatBlockProps> = ({
  stats,
  columns = 2,
  width = 800,
  height = 400,
  backgroundColor = '#ffffff',
  borderColor = '#e5e7eb',
  showBorder = true,
  animationType = 'fade',
  staggerDelay = 5,
  startAt = 0,
  className,
  title,
  titleColor = '#1f2937',
  titleSize = 42,
  valueFontSize = 64,
  labelFontSize = 24,
  tileBackgroundColor = 'transparent',
  tileBorderRadius = 8,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const titleHeight = title ? 60 : 0;
  const contentHeight = height - titleHeight;
  const rows = Math.ceil(stats.length / columns);
  const cellWidth = width / columns;
  const cellHeight = contentHeight / rows;

  return (
    <div 
      className={className}
      style={{
        width,
        height,
        backgroundColor,
        border: showBorder ? `2px solid ${borderColor}` : 'none',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        position: 'relative',
      }}
    >
      {/* Title */}
      {title && (
        <div
          style={{
            height: titleHeight,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '20px',
            opacity: interpolate(frame, [startAt, startAt + 15], [0, 1], {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }),
          }}
        >
          <h2
            style={{
              fontSize: `${titleSize}px`,
              fontWeight: 'bold',
              color: titleColor,
              margin: 0,
              textAlign: 'center',
            }}
          >
            {title}
          </h2>
        </div>
      )}

      {/* Stats Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gridTemplateRows: `repeat(${rows}, 1fr)`,
          gap: '20px',
          height: contentHeight - (title ? 20 : 0),
        }}
      >
        {stats.map((stat, index) => {
          const animationFrame = frame - startAt - index * staggerDelay;
          
          const progress = spring({
            frame: animationFrame,
            fps,
            from: 0,
            to: 1,
            durationInFrames: 30,
          });

          let transform = 'none';
          let opacity = 1;

          switch (animationType) {
            case 'fade':
              opacity = progress;
              break;
            case 'slide':
              transform = `translateY(${interpolate(progress, [0, 1], [30, 0])}px)`;
              opacity = progress;
              break;
            case 'scale':
              transform = `scale(${progress})`;
              opacity = progress;
              break;
            case 'counter':
              opacity = interpolate(progress, [0, 0.3], [0, 1], {
                extrapolateRight: 'clamp',
              });
              break;
          }

          // For counter animation, animate the number value
          let displayValue = stat.value;
          if (animationType === 'counter' && typeof stat.value === 'number') {
            displayValue = Math.round(stat.value * progress);
          }

          return (
            <div
              key={index}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '16px',
                backgroundColor: tileBackgroundColor,
                borderRadius: `${tileBorderRadius}px`,
                transform,
                opacity,
                transition: 'all 0.3s ease',
              }}
            >
              {/* Icon */}
              {stat.icon && (
                <div
                  style={{
                    marginBottom: '8px',
                    color: stat.color || '#3b82f6',
                    fontSize: '24px',
                  }}
                >
                  {stat.icon}
                </div>
              )}

              {/* Value */}
              <div
                style={{
                  fontSize: `${valueFontSize}px`,
                  fontWeight: 'bold',
                  color: stat.color || '#1f2937',
                  marginBottom: '4px',
                  textAlign: 'center',
                  lineHeight: 1,
                }}
              >
                {formatValue(displayValue, stat.format, stat.prefix, stat.suffix)}
              </div>

              {/* Label */}
              <div
                style={{
                  fontSize: `${labelFontSize}px`,
                  color: '#6b7280',
                  textAlign: 'center',
                  fontWeight: '500',
                }}
              >
                {stat.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
