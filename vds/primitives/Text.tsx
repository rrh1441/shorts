import React from 'react';
import { COLORS, TYPOGRAPHY, AspectRatio, getTypeScale, TypographySize } from '../tokens';
import { MotionVariant, getRemotionAnimation } from '../motion';

export interface TextProps {
  children: React.ReactNode;
  
  // Typography
  size?: TypographySize;
  weight?: keyof typeof TYPOGRAPHY.weights;
  family?: keyof typeof TYPOGRAPHY.families;
  lineHeight?: keyof typeof TYPOGRAPHY.lineHeights;
  
  // Appearance  
  color?: keyof typeof COLORS.brand | keyof typeof COLORS.neutrals | keyof typeof COLORS.semantic | string;
  align?: 'left' | 'center' | 'right';
  
  // Layout context
  aspect?: AspectRatio;
  
  // Animation
  motion?: MotionVariant;
  delay?: number; // frames
  
  // Remotion context
  frame?: number;
  totalFrames?: number;
  
  // Accessibility
  role?: 'title' | 'subtitle' | 'body' | 'caption' | 'kicker';
  
  // Override styles
  style?: React.CSSProperties;
}

export const Text: React.FC<TextProps> = ({
  children,
  size = 'body',
  weight = 'regular',
  family = 'sans',
  lineHeight = 'normal',
  color = 'neutrals.900',
  align = 'left',
  aspect = 'horizontal',
  motion,
  delay = 0,
  frame = 0,
  totalFrames = 100,
  role = 'body',
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
  
  // Get font size for aspect ratio
  const fontSize = getTypeScale(aspect, size);
  
  // Apply motion if specified (with delay)
  const effectiveFrame = Math.max(0, frame - delay);
  const motionProps = motion 
    ? getRemotionAnimation(motion, 'entrance', effectiveFrame, totalFrames)
    : { opacity: 1, transform: 'none' };
  
  // Role-specific defaults
  const roleDefaults = {
    title: { weight: 'bold' as const, size: 'title' as const },
    subtitle: { weight: 'medium' as const, size: 'subtitle' as const },
    body: { weight: 'regular' as const, size: 'body' as const },
    caption: { weight: 'regular' as const, size: 'caption' as const, color: 'neutrals.600' },
    kicker: { weight: 'semibold' as const, size: 'small' as const, color: 'brand.primary' }
  };
  
  const defaults = roleDefaults[role] || {};
  const effectiveSize = getTypeScale(aspect, defaults.size || size);
  const effectiveWeight = TYPOGRAPHY.weights[defaults.weight || weight];
  const effectiveColor = getColor();
  
  const textStyle: React.CSSProperties = {
    fontFamily: TYPOGRAPHY.families[family].join(', '),
    fontSize: effectiveSize,
    fontWeight: effectiveWeight,
    lineHeight: TYPOGRAPHY.lineHeights[lineHeight],
    color: effectiveColor,
    textAlign: align,
    opacity: motionProps.opacity,
    transform: motionProps.transform,
    // Video-optimized text rendering
    textRendering: 'optimizeLegibility',
    fontFeatureSettings: '"kern" 1',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    ...style
  };
  
  return (
    <div style={textStyle}>
      {children}
    </div>
  );
};