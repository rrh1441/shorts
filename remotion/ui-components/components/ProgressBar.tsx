import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';

export interface ProgressBarProps {
  progress: number; // 0 to 1
  width?: number;
  height?: number;
  backgroundColor?: string;
  fillColor?: string;
  borderRadius?: number;
  showPercentage?: boolean;
  percentageColor?: string;
  percentageSize?: number;
  animationType?: 'smooth' | 'spring' | 'stepped';
  startAt?: number;
  durationInFrames?: number;
  className?: string;
  style?: React.CSSProperties;
  label?: string;
  labelColor?: string;
  direction?: 'horizontal' | 'vertical';
  showGlow?: boolean;
  glowColor?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  progress,
  width = 400,
  height = 20,
  backgroundColor = '#e5e7eb',
  fillColor = '#3b82f6',
  borderRadius = 10,
  showPercentage = true,
  percentageColor = '#374151',
  percentageSize = 14,
  animationType = 'smooth',
  startAt = 0,
  durationInFrames = 60,
  className,
  style,
  label,
  labelColor = '#374151',
  direction = 'horizontal',
  showGlow = false,
  glowColor = '#3b82f6',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentFrame = frame - startAt;

  let animatedProgress = progress;

  switch (animationType) {
    case 'smooth':
      animatedProgress = interpolate(
        currentFrame,
        [0, durationInFrames],
        [0, progress],
        {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        }
      );
      break;

    case 'spring':
      const springProgress = spring({
        frame: currentFrame,
        fps,
        from: 0,
        to: progress,
        durationInFrames: durationInFrames,
      });
      animatedProgress = springProgress;
      break;

    case 'stepped':
      const stepProgress = Math.floor((currentFrame / durationInFrames) * progress * 20) / 20;
      animatedProgress = Math.min(stepProgress, progress);
      break;
  }

  const percentage = Math.round(animatedProgress * 100);
  const isVertical = direction === 'vertical';

  const containerStyle: React.CSSProperties = {
    width: isVertical ? height : width,
    height: isVertical ? width : height,
    backgroundColor,
    borderRadius,
    position: 'relative',
    overflow: 'hidden',
    boxShadow: showGlow ? `0 0 20px ${glowColor}40` : 'none',
    ...style,
  };

  const fillStyle: React.CSSProperties = {
    position: 'absolute',
    backgroundColor: fillColor,
    borderRadius,
    transition: 'none',
    boxShadow: showGlow ? `inset 0 0 10px ${glowColor}80` : 'none',
  };

  if (isVertical) {
    fillStyle.bottom = 0;
    fillStyle.left = 0;
    fillStyle.width = '100%';
    fillStyle.height = `${animatedProgress * 100}%`;
  } else {
    fillStyle.top = 0;
    fillStyle.left = 0;
    fillStyle.height = '100%';
    fillStyle.width = `${animatedProgress * 100}%`;
  }

  const textOpacity = interpolate(
    currentFrame,
    [durationInFrames * 0.5, durationInFrames],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div className={className}>
      {/* Label */}
      {label && (
        <div
          style={{
            fontSize: percentageSize,
            color: labelColor,
            marginBottom: 8,
            fontWeight: '500',
            opacity: textOpacity,
          }}
        >
          {label}
        </div>
      )}

      {/* Progress Bar Container */}
      <div style={containerStyle}>
        {/* Fill */}
        <div style={fillStyle} />

        {/* Percentage Text */}
        {showPercentage && (
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              fontSize: percentageSize,
              fontWeight: 'bold',
              color: percentage > 50 ? 'white' : percentageColor,
              opacity: textOpacity,
              textShadow: percentage > 50 ? '1px 1px 2px rgba(0,0,0,0.5)' : 'none',
              zIndex: 10,
            }}
          >
            {percentage}%
          </div>
        )}

        {/* Shine Effect */}
        {showGlow && animatedProgress > 0 && (
          <div
            style={{
              position: 'absolute',
              top: 0,
              left: isVertical ? 0 : `${Math.max(0, (animatedProgress * 100) - 20)}%`,
              bottom: isVertical ? `${Math.max(0, 100 - (animatedProgress * 100) - 20)}%` : 0,
              width: isVertical ? '100%' : '20%',
              height: isVertical ? '20%' : '100%',
              background: `linear-gradient(${isVertical ? '0deg' : '90deg'}, transparent, rgba(255,255,255,0.4), transparent)`,
              borderRadius,
            }}
          />
        )}
      </div>
    </div>
  );
};