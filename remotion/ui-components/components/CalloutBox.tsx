import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { CalloutBoxPropsSchema, getCalloutBoxDefaults } from './CalloutBox.schema';
import type { CalloutBoxProps } from './CalloutBox.schema';

// Export schema and defaults for AI consumption
export { CalloutBoxPropsSchema, getCalloutBoxDefaults };

const variantStyles = {
  default: {
    backgroundColor: '#ffffff',
    borderColor: '#e5e7eb',
    iconColor: '#6b7280',
  },
  success: {
    backgroundColor: '#f0fdf4',
    borderColor: '#10b981',
    iconColor: '#10b981',
  },
  warning: {
    backgroundColor: '#fffbeb',
    borderColor: '#f59e0b',
    iconColor: '#f59e0b',
  },
  error: {
    backgroundColor: '#fef2f2',
    borderColor: '#ef4444',
    iconColor: '#ef4444',
  },
  info: {
    backgroundColor: '#eff6ff',
    borderColor: '#3b82f6',
    iconColor: '#3b82f6',
  },
};

export const CalloutBox: React.FC<CalloutBoxProps> = ({
  children,
  width = 600,
  height = 200,
  backgroundColor,
  borderColor,
  borderWidth = 2,
  borderRadius = 12,
  padding = 24,
  animationType = 'fade',
  direction = 'up',
  startAt = 0,
  durationInFrames = 45,
  className,
  style,
  icon,
  iconColor,
  title,
  titleColor = '#1f2937',
  titleSize = 18,
  shadow = true,
  shadowColor = 'rgba(0, 0, 0, 0.1)',
  variant = 'default',
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentFrame = frame - startAt;

  const variantStyle = variantStyles[variant];
  const finalBackgroundColor = backgroundColor || variantStyle.backgroundColor;
  const finalBorderColor = borderColor || variantStyle.borderColor;
  const finalIconColor = iconColor || variantStyle.iconColor;

  const progress = spring({
    frame: currentFrame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: durationInFrames,
    config: animationType === 'bounce' ? { damping: 12, stiffness: 100 } : undefined,
  });

  let transform = 'none';
  let opacity = 1;

  switch (animationType) {
    case 'fade':
      opacity = progress;
      break;

    case 'slide':
      const slideDistance = 30;
      let translateX = 0;
      let translateY = 0;

      switch (direction) {
        case 'left':
          translateX = interpolate(progress, [0, 1], [-slideDistance, 0]);
          break;
        case 'right':
          translateX = interpolate(progress, [0, 1], [slideDistance, 0]);
          break;
        case 'up':
          translateY = interpolate(progress, [0, 1], [-slideDistance, 0]);
          break;
        case 'down':
          translateY = interpolate(progress, [0, 1], [slideDistance, 0]);
          break;
      }

      transform = `translate(${translateX}px, ${translateY}px)`;
      opacity = progress;
      break;

    case 'scale':
    case 'bounce':
      const scale = interpolate(progress, [0, 1], [0.8, 1]);
      transform = `scale(${scale})`;
      opacity = progress;
      break;
  }

  const containerStyle: React.CSSProperties = {
    width,
    height: height === 'auto' ? 'auto' : height,
    backgroundColor: finalBackgroundColor,
    border: `${borderWidth}px solid ${finalBorderColor}`,
    borderRadius,
    padding,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: shadow ? `0 10px 25px ${shadowColor}` : 'none',
    transform,
    opacity,
    transformOrigin: 'center',
    ...style,
  };

  const iconOpacity = interpolate(
    currentFrame,
    [durationInFrames * 0.5, durationInFrames * 0.8],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  const contentOpacity = interpolate(
    currentFrame,
    [durationInFrames * 0.3, durationInFrames * 0.7],
    [0, 1],
    {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
    }
  );

  return (
    <div className={className} style={containerStyle}>
      {/* Header with icon and title */}
      {(icon || title) && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: title ? 16 : 8,
            opacity: iconOpacity,
          }}
        >
          {icon && (
            <div
              style={{
                marginRight: title ? 12 : 0,
                color: finalIconColor,
                fontSize: '24px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              {icon}
            </div>
          )}
          {title && (
            <h3
              style={{
                fontSize: titleSize,
                fontWeight: 'bold',
                color: titleColor,
                margin: 0,
              }}
            >
              {title}
            </h3>
          )}
        </div>
      )}

      {/* Content */}
      <div
        style={{
          flex: 1,
          opacity: contentOpacity,
          fontSize: '16px',
          lineHeight: 1.5,
          color: '#374151',
        }}
      >
        {children}
      </div>

      {/* Accent border (left border highlight) */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '4px',
          height: '100%',
          backgroundColor: finalBorderColor,
          borderTopLeftRadius: borderRadius,
          borderBottomLeftRadius: borderRadius,
          opacity: progress,
        }}
      />
    </div>
  );
};