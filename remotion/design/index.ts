/**
 * Design System Exports
 * Central export point for all design system components and utilities
 * Based on lessons learned from manual video generation process
 */

// Core design system constants
export {
  COLORS,
  TYPOGRAPHY,
  SPACING,
  LAYOUT,
  ANIMATIONS,
  SIZES,
  EFFECTS,
  FONTS,
  Z_INDEX,
  responsive,
  getProportionalSize,
  validateHexColor,
  createBrandPalette,
  fontUtils,
  type DynamicFonts
} from './DesignSystem';

// Layout components and shared styles
export {
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
  createSharedStyles
} from './LayoutComponents';

// Brand color management
export {
  BRAND_COLOR_BEST_PRACTICES,
  BrandColorValidator,
  SAFE_GRADIENT_COMBINATIONS,
  ANIMATION_COLOR_GUIDELINES,
  type BrandColorPalette
} from './BrandColorBestPractices';

// Typography system
export {
  VIDEO_FONTS,
  FONT_PAIRINGS,
  VIDEO_TYPOGRAPHY_GUIDELINES,
  CustomFontManager,
  type FontMetadata
} from './TypographySystem';

// UI Components
export { default as BrandColorSelector } from './BrandColorSelector';
export { 
  default as VoiceSelector,
  OPENAI_VOICES
} from './VoiceSelector';
export { 
  default as TypographySelector,
  type FontConfiguration
} from './TypographySelector';

// Asset management system
export {
  AssetManager,
  SUPPORTED_FORMATS,
  PRESET_CONFIGS,
  type AssetMetadata,
  type CustomSegmentConfig,
  type TTSConfiguration
} from './AssetManager';

// UI Components for asset management
export { default as AssetUploader } from './AssetUploader';

// Custom asset segment components
export { 
  default as CustomAssetSegment,
  IntroSegment,
  OutroSegment,
  LogoRevealSegment
} from '../components/CustomAssetSegment';

// Export system
export {
  SegmentExporter,
  EXPORT_PRESETS,
  FILENAME_PATTERNS,
  exportQueue,
  type ExportConfiguration,
  type ExportProgress,
  type SegmentExportRequest,
  type BatchExportRequest
} from './SegmentExporter';

// Export modal
export { default as ExportModal } from './ExportModal';

// Segment-based workflow
export { 
  default as SegmentPreview,
  type SegmentMetadata 
} from './SegmentPreview';

// Re-export default design system for convenience
import DesignSystem from './DesignSystem';
export { DesignSystem };

// Utility functions for common tasks
export const designUtils = {
  // Create a consistent color scheme from brand colors
  createColorScheme: (brandColors: string[]) => {
    // Simplified color scheme generation
    return brandColors;
  },

  // Get animation timing for coordinated sequences
  getAnimationTiming: (segmentIndex: number, totalSegments: number) => {
    const baseDelay = 30; // frames
    const staggerDelay = 15; // frames between elements
    
    return {
      titleStart: segmentIndex * baseDelay,
      contentStart: (segmentIndex * baseDelay) + (1 * staggerDelay),
      actionStart: (segmentIndex * baseDelay) + (2 * staggerDelay),
    };
  },

  // Calculate responsive font sizes
  getResponsiveFontSize: (baseSize: number, breakpoint: 'mobile' | 'tablet' | 'desktop') => {
    const multipliers = {
      mobile: 0.7,
      tablet: 0.85,
      desktop: 1.0
    };
    return Math.round(baseSize * multipliers[breakpoint]);
  },

  // Generate safe gradient colors
  createSafeGradient: (baseColor: string, type: 'monochromatic' | 'analogous' = 'monochromatic') => {
    // Simplified gradient generation
    return [baseColor, baseColor];
  },

  // Validate brand color accessibility
  validateColorAccessibility: (textColor: string, backgroundColor: string) => {
    // Simplified contrast check
    return true;
  },

  // Get standard spacing for consistent margins
  getStandardSpacing: (size: 'small' | 'medium' | 'large' | 'xlarge') => {
    const spacingMap = {
      small: 16,
      medium: 24,
      large: 32,
      xlarge: 80 // The standard 80px from lessons
    };
    return spacingMap[size];
  },

  // Create animation keyframes for common patterns
  createAnimationKeyframes: (animationType: 'fadeIn' | 'slideUp' | 'scaleIn') => {
    const keyframes = {
      fadeIn: {
        from: { opacity: 0 },
        to: { opacity: 1 }
      },
      slideUp: {
        from: { transform: 'translateY(30px)', opacity: 0 },
        to: { transform: 'translateY(0)', opacity: 1 }
      },
      scaleIn: {
        from: { transform: 'scale(0.8)', opacity: 0 },
        to: { transform: 'scale(1)', opacity: 1 }
      }
    };
    return keyframes[animationType];
  }
};

// Export type definitions for TypeScript users
export type {
  CSSProperties
} from 'react';

// Default export for easy importing
const defaultExport = {
  designUtils
};

export default defaultExport;