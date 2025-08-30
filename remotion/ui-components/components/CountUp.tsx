import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface CountUpProps {
  from?: number;
  to: number;
  duration?: number;
  delay?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  separator?: string;
  fontSize?: number;
  fontWeight?: string | number;
  color?: string;
  fontFamily?: string;
  animationType?: 'linear' | 'easeOut' | 'spring' | 'bounce';
  startAt?: number;
  className?: string;
  style?: React.CSSProperties;
  format?: 'number' | 'currency' | 'percentage';
  locale?: string;
  onComplete?: () => void;
}

const formatNumber = (
  value: number,
  format: string,
  decimals: number,
  separator: string,
  locale: string
) => {
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
    useGrouping: separator === ',',
  };

  switch (format) {
    case 'currency':
      options.style = 'currency';
      options.currency = 'USD';
      break;
    case 'percentage':
      options.style = 'percent';
      options.minimumFractionDigits = decimals;
      options.maximumFractionDigits = decimals;
      // For percentage, we need to divide by 100 since Intl.NumberFormat multiplies by 100
      value = value / 100;
      break;
    default:
      options.style = 'decimal';
  }

  try {
    return new Intl.NumberFormat(locale, options).format(value);
  } catch {
    // Fallback for unsupported locales
    return value.toFixed(decimals);
  }
};

export const CountUp: React.FC<CountUpProps> = ({
  from = 0,
  to,
  duration = 60,
  delay = 0,
  prefix = '',
  suffix = '',
  decimals = 0,
  separator = ',',
  fontSize = 48,
  fontWeight = 'bold',
  color = '#000000',
  fontFamily = 'Inter, sans-serif',
  animationType = 'easeOut',
  startAt = 0,
  className,
  style,
  format = 'number',
  locale = 'en-US',
  onComplete,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentFrame = Math.max(0, frame - startAt - delay);
  const isActive = currentFrame >= 0;
  const hasCompleted = currentFrame >= duration;

  React.useEffect(() => {
    if (hasCompleted && onComplete) {
      onComplete();
    }
  }, [hasCompleted, onComplete]);

  let progress = 0;

  if (isActive) {
    switch (animationType) {
      case 'linear':
        progress = Math.min(1, currentFrame / duration);
        break;

      case 'easeOut':
        progress = interpolate(
          currentFrame,
          [0, duration],
          [0, 1],
          {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
            easing: (t) => 1 - Math.pow(1 - t, 3), // cubic-bezier ease-out
          }
        );
        break;

      case 'spring':
        progress = spring({
          frame: currentFrame,
          fps,
          from: 0,
          to: 1,
          durationInFrames: duration,
          config: {
            damping: 15,
            stiffness: 100,
            mass: 1,
          },
        });
        break;

      case 'bounce':
        progress = spring({
          frame: currentFrame,
          fps,
          from: 0,
          to: 1,
          durationInFrames: duration,
          config: {
            damping: 12,
            stiffness: 200,
            mass: 1,
          },
        });
        break;
    }
  }

  const currentValue = from + (to - from) * progress;
  const formattedValue = formatNumber(currentValue, format, decimals, separator, locale);

  // Add entry animation for the component itself
  const entryProgress = interpolate(
    currentFrame,
    [0, 20],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const componentOpacity = isActive ? entryProgress : 0;
  const componentScale = isActive ? interpolate(entryProgress, [0, 1], [0.8, 1]) : 0.8;

  const containerStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    color,
    fontFamily,
    opacity: componentOpacity,
    transform: `scale(${componentScale})`,
    transformOrigin: 'center',
    display: 'inline-block',
    ...style,
  };

  return (
    <span className={className} style={containerStyle}>
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
};