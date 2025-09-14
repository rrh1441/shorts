import React from 'react';
import { Img } from 'remotion';
import { RADII } from '../tokens';
import { MotionVariant, getRemotionAnimation } from '../motion';

export interface MediaProps {
  src: string;
  alt?: string;
  
  // Layout
  fit?: 'cover' | 'contain' | 'fill';
  focalPoint?: { x: number; y: number }; // 0-1 range
  
  // Appearance
  mask?: 'rounded' | 'device' | 'circle' | 'none';
  radius?: keyof typeof RADII;
  
  // Animation
  motion?: MotionVariant;
  delay?: number; // frames
  
  // Remotion context
  frame?: number;
  totalFrames?: number;
  
  // Override styles
  style?: React.CSSProperties;
}

export const Media: React.FC<MediaProps> = ({
  src,
  alt = '',
  fit = 'cover',
  focalPoint = { x: 0.5, y: 0.5 },
  mask = 'rounded',
  radius = 'lg',
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
  
  // Get mask styles
  const getMaskStyles = (): React.CSSProperties => {
    switch (mask) {
      case 'circle':
        return {
          borderRadius: '50%',
          aspectRatio: '1/1'
        };
      case 'device':
        return {
          borderRadius: RADII['2xl'],
          border: '8px solid #1a1a1a',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)'
        };
      case 'rounded':
        return {
          borderRadius: RADII[radius]
        };
      default:
        return {};
    }
  };
  
  // Get object position from focal point
  const getObjectPosition = () => {
    const x = Math.round(focalPoint.x * 100);
    const y = Math.round(focalPoint.y * 100);
    return `${x}% ${y}%`;
  };
  
  const containerStyle: React.CSSProperties = {
    overflow: 'hidden',
    opacity: motionProps.opacity,
    transform: motionProps.transform,
    ...getMaskStyles(),
    ...style
  };
  
  const imageStyle: React.CSSProperties = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    objectPosition: getObjectPosition(),
    display: 'block'
  };
  
  return (
    <div style={containerStyle}>
      <Img
        src={src}
        alt={alt}
        style={imageStyle}
      />
    </div>
  );
};