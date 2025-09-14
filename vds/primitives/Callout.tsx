import React from 'react';
import { COLORS, SPACING, RADII, SHADOWS, SpacingToken } from '../tokens';
import { MotionVariant, getRemotionAnimation } from '../motion';
import { Text } from './Text';

export interface CalloutProps {
  children: React.ReactNode;
  
  // Appearance
  variant?: 'default' | 'accent' | 'success' | 'warning' | 'error';
  outline?: boolean;
  
  // Layout
  padding?: SpacingToken;
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

export const Callout: React.FC<CalloutProps> = ({
  children,
  variant = 'default',
  outline = false,
  padding = 4,
  radius = 'lg',
  motion,
  delay = 0,
  frame = 0,
  totalFrames = 100,
  style = {}
}) => {
  // Get variant colors
  const getVariantColors = () => {
    switch (variant) {
      case 'accent':
        return {
          background: outline ? 'transparent' : COLORS.brand.primary,
          border: COLORS.brand.primary,
          text: outline ? COLORS.brand.primary : COLORS.neutrals[100]
        };
      case 'success':
        return {
          background: outline ? 'transparent' : COLORS.semantic.success,
          border: COLORS.semantic.success,
          text: outline ? COLORS.semantic.success : COLORS.neutrals[100]
        };
      case 'warning':
        return {
          background: outline ? 'transparent' : COLORS.semantic.warning,
          border: COLORS.semantic.warning,
          text: outline ? COLORS.neutrals[900] : COLORS.neutrals[900]
        };
      case 'error':
        return {
          background: outline ? 'transparent' : COLORS.semantic.error,
          border: COLORS.semantic.error,
          text: outline ? COLORS.semantic.error : COLORS.neutrals[100]
        };
      default:
        return {
          background: outline ? 'transparent' : COLORS.neutrals[100],
          border: COLORS.neutrals[300],
          text: COLORS.neutrals[900]
        };
    }
  };
  
  const colors = getVariantColors();
  
  // Apply motion if specified (with delay)
  const effectiveFrame = Math.max(0, frame - delay);
  const motionProps = motion 
    ? getRemotionAnimation(motion, 'entrance', effectiveFrame, totalFrames)
    : { opacity: 1, transform: 'none' };
  
  const calloutStyle: React.CSSProperties = {
    backgroundColor: colors.background,
    border: `2px solid ${colors.border}`,
    borderRadius: RADII[radius],
    padding: SPACING[padding],
    boxShadow: outline ? 'none' : SHADOWS.sm,
    opacity: motionProps.opacity,
    transform: motionProps.transform,
    // Ensure text is readable
    minHeight: 44, // Minimum touch target
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ...style
  };
  
  return (
    <div style={calloutStyle}>
      {typeof children === 'string' ? (
        <Text 
          color={colors.text}
          weight="medium"
          align="center"
          style={{ margin: 0 }}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </div>
  );
};