/**
 * Reusable Layout Components
 * Following DRY principles and consistent styling patterns from lessons
 */

import React from 'react';
import { CSSProperties } from 'react';
import { COLORS, TYPOGRAPHY, SPACING, EFFECTS, SIZES, FONTS, fontUtils, DynamicFonts } from './DesignSystem';

// Props interfaces
interface CenteredLayoutProps {
  children: React.ReactNode;
  spacing?: keyof typeof SPACING;
  style?: CSSProperties;
}

interface SegmentTitleProps {
  children: React.ReactNode;
  style?: CSSProperties;
  color?: string;
  fontFamily?: string;
}

interface SegmentSubtitleProps {
  children: React.ReactNode;
  style?: CSSProperties;
  color?: string;
  fontFamily?: string;
}

interface ContentContainerProps {
  children: React.ReactNode;
  style?: CSSProperties;
  maxWidth?: number;
}

interface IconContainerProps {
  children: React.ReactNode;
  size?: keyof typeof SIZES.icon;
  style?: CSSProperties;
}

// Shared style objects (DRY principle) with dynamic font support
export const createSharedStyles = (fonts?: DynamicFonts) => {
  const appliedFonts = fonts ? fontUtils.applyFontConfiguration(fonts) : FONTS;
  
  return {
    // Standard title style from lessons
    title: {
      fontSize: TYPOGRAPHY.h1.fontSize,
      fontWeight: TYPOGRAPHY.h1.fontWeight,
      fontFamily: appliedFonts.title,
      color: COLORS.primary,
      margin: 0,
      textAlign: 'center' as const,
      letterSpacing: TYPOGRAPHY.h1.letterSpacing,
      lineHeight: TYPOGRAPHY.h1.lineHeight,
    },
    
    // Standard subtitle style
    subtitle: {
      fontSize: TYPOGRAPHY.h2.fontSize,
      fontWeight: TYPOGRAPHY.h2.fontWeight,
      fontFamily: appliedFonts.subtitle,
      color: COLORS.textSecondary,
      margin: 0,
      textAlign: 'center' as const,
      letterSpacing: TYPOGRAPHY.h2.letterSpacing,
      lineHeight: TYPOGRAPHY.h2.lineHeight,
    },
    
    // Centered layout pattern
    centeredContainer: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      width: '100%',
      height: '100%',
    },
    
    // Content wrapper
    contentWrapper: {
      display: 'flex',
      flexDirection: 'column' as const,
      alignItems: 'center',
      justifyContent: 'center',
      padding: SPACING.lg,
      maxWidth: 1200,
      margin: '0 auto',
    },
    
    // Standard card style
    card: {
      backgroundColor: COLORS.surface,
      borderRadius: EFFECTS.borderRadius.medium,
      padding: SPACING.lg,
      border: `${EFFECTS.strokeWidth.thin}px solid ${COLORS.border}`,
      boxShadow: EFFECTS.shadows.medium,
    },
    
    // Icon wrapper
    iconWrapper: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: EFFECTS.borderRadius.small,
    },
  };
};

// Default shared styles (backward compatibility)
export const sharedStyles = createSharedStyles();

// Layout Components

/**
 * Centered layout wrapper component from lessons
 * Use for consistent vertical centering with standard spacing
 */
export const CenteredLayout: React.FC<CenteredLayoutProps> = ({ 
  children, 
  spacing = 'lg',
  style = {} 
}) => (
  <div style={{
    ...sharedStyles.centeredContainer,
    marginTop: SPACING[spacing],
    marginBottom: SPACING.md,
    ...style,
  }}>
    {children}
  </div>
);

/**
 * Standard segment title component
 * Ensures consistent title styling across all segments
 */
export const SegmentTitle: React.FC<SegmentTitleProps> = ({ 
  children, 
  style = {},
  color = COLORS.primary,
  fontFamily 
}) => (
  <h1 style={{
    ...sharedStyles.title,
    fontFamily: fontFamily || sharedStyles.title.fontFamily,
    color,
    marginBottom: SPACING.xxxl, // 80px standard from lessons
    ...style,
  }}>
    {children}
  </h1>
);

/**
 * Standard segment subtitle component
 * Consistent subtitle styling with proper hierarchy
 */
export const SegmentSubtitle: React.FC<SegmentSubtitleProps> = ({ 
  children, 
  style = {},
  color = COLORS.textSecondary,
  fontFamily 
}) => (
  <h2 style={{
    ...sharedStyles.subtitle,
    fontFamily: fontFamily || sharedStyles.subtitle.fontFamily,
    color,
    marginBottom: SPACING.xl,
    ...style,
  }}>
    {children}
  </h2>
);

/**
 * Content container with max width and centering
 * Prevents content from spanning full screen width
 */
export const ContentContainer: React.FC<ContentContainerProps> = ({
  children,
  style = {},
  maxWidth = 1200
}) => (
  <div style={{
    ...sharedStyles.contentWrapper,
    maxWidth,
    ...style,
  }}>
    {children}
  </div>
);

/**
 * Icon container with consistent sizing
 * Standard icon wrapper following size system from lessons
 */
export const IconContainer: React.FC<IconContainerProps> = ({
  children,
  size = 'large',
  style = {}
}) => (
  <div style={{
    ...sharedStyles.iconWrapper,
    width: SIZES.icon[size],
    height: SIZES.icon[size],
    ...style,
  }}>
    {children}
  </div>
);

/**
 * Standard card component
 * Consistent card styling for content blocks
 */
export const Card: React.FC<{ children: React.ReactNode; style?: CSSProperties }> = ({
  children,
  style = {}
}) => (
  <div style={{
    ...sharedStyles.card,
    ...style,
  }}>
    {children}
  </div>
);

/**
 * Animated text reveal component
 * Consistent animation timing for text reveals
 */
interface AnimatedTextProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  style?: CSSProperties;
}

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  children,
  delay = 0,
  duration = ANIMATIONS.durations.normal,
  style = {}
}) => {
  // This would be implemented with Remotion's animation hooks
  // For now, returning the base component
  return (
    <div style={{
      opacity: 1, // Would be animated based on frame
      transform: 'translateY(0px)', // Would be animated
      transition: `all ${duration}ms ${ANIMATIONS.easing.easeOut}`,
      transitionDelay: `${delay}ms`,
      ...style,
    }}>
      {children}
    </div>
  );
};

/**
 * Grid layout component
 * Consistent grid spacing and responsive behavior
 */
interface GridLayoutProps {
  children: React.ReactNode;
  columns?: number;
  gap?: keyof typeof SPACING;
  style?: CSSProperties;
}

export const GridLayout: React.FC<GridLayoutProps> = ({
  children,
  columns = 2,
  gap = 'lg',
  style = {}
}) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: `repeat(${columns}, 1fr)`,
    gap: SPACING[gap],
    width: '100%',
    ...style,
  }}>
    {children}
  </div>
);

/**
 * Bullet point list component
 * Consistent styling for bullet lists in segments
 */
interface BulletListProps {
  items: string[];
  style?: CSSProperties;
  itemStyle?: CSSProperties;
}

export const BulletList: React.FC<BulletListProps> = ({
  items,
  style = {},
  itemStyle = {}
}) => (
  <ul style={{
    listStyle: 'none',
    padding: 0,
    margin: 0,
    ...style,
  }}>
    {items.map((item, index) => (
      <li key={index} style={{
        fontSize: TYPOGRAPHY.body.fontSize,
        color: COLORS.textPrimary,
        marginBottom: SPACING.md,
        paddingLeft: SPACING.lg,
        position: 'relative',
        lineHeight: TYPOGRAPHY.body.lineHeight,
        ...itemStyle,
      }}>
        <span style={{
          position: 'absolute',
          left: 0,
          color: COLORS.primary,
          fontWeight: 'bold',
        }}>
          •
        </span>
        {item}
      </li>
    ))}
  </ul>
);

/**
 * Background component with consistent styling
 * Standard background for all segments
 */
interface BackgroundProps {
  color?: string;
  gradient?: boolean;
  children?: React.ReactNode;
}

export const Background: React.FC<BackgroundProps> = ({
  color = COLORS.background,
  gradient = false,
  children
}) => (
  <div style={{
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: color,
    background: gradient 
      ? `linear-gradient(135deg, ${color} 0%, ${COLORS.surface} 100%)`
      : color,
    zIndex: -1,
  }}>
    {children}
  </div>
);

// Export ANIMATIONS for use in components
import { ANIMATIONS } from './DesignSystem';

export { ANIMATIONS };

export default {
  CenteredLayout,
  SegmentTitle,
  SegmentSubtitle,
  ContentContainer,
  IconContainer,
  Card,
  AnimatedText,
  GridLayout,
  BulletList,
  Background,
  sharedStyles,
};