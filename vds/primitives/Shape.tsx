import React from 'react';
import { COLORS } from '../tokens';
import { MotionVariant, getRemotionAnimation } from '../motion';

export interface ShapeProps {
  shape: 'blob' | 'bar' | 'ring' | 'underline';
  
  // Appearance
  color?: keyof typeof COLORS.brand | keyof typeof COLORS.neutrals | string;
  opacity?: number;
  seed?: number; // For randomizable shapes
  
  // Animation
  animate?: 'drift' | 'pulse' | 'wipe';
  motion?: MotionVariant;
  delay?: number; // frames
  
  // Remotion context
  frame?: number;
  totalFrames?: number;
  
  // Override styles
  style?: React.CSSProperties;
}

export const Shape: React.FC<ShapeProps> = ({
  shape,
  color = 'brand.primary',
  opacity = 0.1,
  seed = 0,
  animate,
  motion,
  delay = 0,
  frame = 0,
  totalFrames = 100,
  style = {}
}) => {
  // Get color value
  const getColor = () => {
    if (color.includes('.')) {
      const [category, shade] = color.split('.') as [keyof typeof COLORS, string];
      return COLORS[category]?.[shade as keyof typeof COLORS.brand] || color;
    }
    return color;
  };
  
  // Apply motion if specified (with delay)
  const effectiveFrame = Math.max(0, frame - delay);
  const motionProps = motion 
    ? getRemotionAnimation(motion, 'entrance', effectiveFrame, totalFrames)
    : { opacity: 1, transform: 'none' };
  
  // Apply animation if specified
  const animationTransform = getAnimationTransform(animate, frame, totalFrames);
  
  // Combine transforms
  const combinedTransform = [
    motionProps.transform,
    animationTransform
  ].filter(t => t !== 'none').join(' ') || 'none';
  
  const baseStyle: React.CSSProperties = {
    opacity: motionProps.opacity * opacity,
    transform: combinedTransform,
    ...style
  };
  
  switch (shape) {
    case 'bar':
      return (
        <div
          style={{
            ...baseStyle,
            width: '60%',
            height: '4px',
            backgroundColor: getColor(),
            borderRadius: '2px'
          }}
        />
      );
      
    case 'underline':
      return (
        <div
          style={{
            ...baseStyle,
            width: '40%',
            height: '2px',
            backgroundColor: getColor(),
            position: 'absolute',
            bottom: '-8px'
          }}
        />
      );
      
    case 'ring':
      return (
        <div
          style={{
            ...baseStyle,
            width: '100px',
            height: '100px',
            border: `3px solid ${getColor()}`,
            borderRadius: '50%',
            background: 'transparent'
          }}
        />
      );
      
    case 'blob':
      return (
        <div
          style={{
            ...baseStyle,
            width: '120px',
            height: '120px',
            backgroundColor: getColor(),
            borderRadius: getBlobRadius(seed),
            position: 'absolute',
            zIndex: -1
          }}
        />
      );
      
    default:
      return null;
  }
};

function getAnimationTransform(animate: string | undefined, frame: number, totalFrames: number): string {
  if (!animate) return 'none';
  
  const progress = frame / totalFrames;
  
  switch (animate) {
    case 'drift':
      const drift = Math.sin(progress * Math.PI * 2) * 2;
      return `translateY(${drift}px)`;
      
    case 'pulse':
      const pulse = 1 + Math.sin(progress * Math.PI * 4) * 0.1;
      return `scale(${pulse})`;
      
    case 'wipe':
      const wipe = Math.min(progress * 2, 1) * 100;
      return `scaleX(${wipe / 100})`;
      
    default:
      return 'none';
  }
}

function getBlobRadius(seed: number): string {
  // Generate deterministic blob shape based on seed
  const baseRadius = 50;
  const variation = Math.sin(seed) * 20;
  return `${baseRadius + variation}% ${baseRadius - variation}% ${baseRadius + variation * 0.5}% ${baseRadius - variation * 0.5}%`;
}