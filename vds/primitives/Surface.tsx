import React from 'react';
import { AbsoluteFill } from 'remotion';
import { COLORS, RADII, SHADOWS, AspectRatio, getSafeArea } from '../tokens';
import { MotionVariant, getRemotionAnimation, getCameraDrift } from '../motion';

export interface SurfaceProps {
  children: React.ReactNode;
  
  // Layout
  aspect?: AspectRatio;
  safe?: boolean; // Use safe areas
  
  // Appearance
  background?: keyof typeof COLORS.brand | keyof typeof COLORS.neutrals | string;
  blur?: boolean;
  radius?: keyof typeof RADII;
  shadow?: keyof typeof SHADOWS;
  
  // Animation
  motion?: MotionVariant;
  drift?: boolean; // Camera drift
  
  // Remotion context
  frame?: number;
  totalFrames?: number;
  
  // Override styles
  style?: React.CSSProperties;
}

export const Surface: React.FC<SurfaceProps> = ({
  children,
  aspect = 'horizontal',
  safe = false,
  background = 'neutrals.100',
  blur = false,
  radius = 'none',
  shadow,
  motion,
  drift = false,
  frame = 0,
  totalFrames = 100,
  style = {}
}) => {
  // Get background color
  const getBackgroundColor = () => {
    if (background.includes('.')) {
      const [category, shade] = background.split('.') as [keyof typeof COLORS, string];
      return COLORS[category]?.[shade as keyof typeof COLORS.brand] || background;
    }
    return background;
  };
  
  // Calculate safe area if needed
  const safeArea = safe ? getSafeArea(aspect) : null;
  
  // Apply motion if specified
  const motionProps = motion 
    ? getRemotionAnimation(motion, 'entrance', frame, totalFrames)
    : { opacity: 1, transform: 'none' };
  
  // Apply camera drift if specified
  const driftProps = drift
    ? getCameraDrift(frame, totalFrames)
    : { transform: 'none' };
  
  // Combine transforms
  const combinedTransform = [
    motionProps.transform,
    driftProps.transform
  ].filter(t => t !== 'none').join(' ') || 'none';
  
  const surfaceStyle: React.CSSProperties = {
    backgroundColor: getBackgroundColor(),
    borderRadius: RADII[radius],
    boxShadow: shadow ? SHADOWS[shadow] : undefined,
    backdropFilter: blur ? 'blur(8px)' : undefined,
    opacity: motionProps.opacity,
    transform: combinedTransform,
    // Safe area positioning
    ...(safeArea ? {
      left: safeArea.x,
      top: safeArea.y,
      width: safeArea.width,
      height: safeArea.height
    } : {}),
    ...style
  };
  
  return (
    <AbsoluteFill style={surfaceStyle}>
      {children}
    </AbsoluteFill>
  );
};