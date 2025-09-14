import React from 'react';
import { SPACING, SpacingToken } from '../tokens';
import { MotionVariant, getRemotionAnimation, getStaggerDelay } from '../motion';

export interface StackProps {
  children: React.ReactNode;
  
  // Layout
  direction?: 'vertical' | 'horizontal';
  gap?: SpacingToken;
  align?: 'start' | 'center' | 'end' | 'stretch';
  justify?: 'start' | 'center' | 'end' | 'space-between' | 'space-around';
  wrap?: boolean;
  
  // Animation
  motion?: MotionVariant;
  stagger?: boolean; // Stagger children animations
  staggerDelay?: 'tight' | 'normal' | 'loose';
  
  // Remotion context
  frame?: number;
  totalFrames?: number;
  
  // Override styles
  style?: React.CSSProperties;
}

export const Stack: React.FC<StackProps> = ({
  children,
  direction = 'vertical',
  gap = 4,
  align = 'stretch',
  justify = 'start',
  wrap = false,
  motion,
  stagger = false,
  staggerDelay = 'normal',
  frame = 0,
  totalFrames = 100,
  style = {}
}) => {
  const isHorizontal = direction === 'horizontal';
  
  // Apply motion if specified
  const motionProps = motion 
    ? getRemotionAnimation(motion, 'entrance', frame, totalFrames)
    : { opacity: 1, transform: 'none' };
  
  const stackStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: isHorizontal ? 'row' : 'column',
    gap: SPACING[gap],
    alignItems: align === 'stretch' ? 'stretch' : 
                align === 'start' ? 'flex-start' :
                align === 'end' ? 'flex-end' : 'center',
    justifyContent: justify === 'start' ? 'flex-start' :
                    justify === 'end' ? 'flex-end' :
                    justify === 'center' ? 'center' :
                    justify === 'space-between' ? 'space-between' : 'space-around',
    flexWrap: wrap ? 'wrap' : 'nowrap',
    opacity: motionProps.opacity,
    transform: motionProps.transform,
    ...style
  };
  
  // Handle staggered children animation
  const childrenArray = React.Children.toArray(children);
  const renderedChildren = stagger && motion ? 
    childrenArray.map((child, index) => {
      const delay = getStaggerDelay(index, staggerDelay);
      const childFrame = Math.max(0, frame - delay);
      const childMotion = getRemotionAnimation(motion, 'entrance', childFrame, totalFrames);
      
      return (
        <div 
          key={index}
          style={{
            opacity: childMotion.opacity,
            transform: childMotion.transform
          }}
        >
          {child}
        </div>
      );
    }) : children;
  
  return (
    <div style={stackStyle}>
      {renderedChildren}
    </div>
  );
};

// Convenience components for common layouts
export interface HStackProps extends Omit<StackProps, 'direction'> {}
export interface VStackProps extends Omit<StackProps, 'direction'> {}

export const HStack: React.FC<HStackProps> = (props) => (
  <Stack {...props} direction="horizontal" />
);

export const VStack: React.FC<VStackProps> = (props) => (
  <Stack {...props} direction="vertical" />
);