/**
 * Design System Constants
 * Centralized design tokens following lessons from manual video generation process
 */

// Color Palette - Single Source of Truth
export const COLORS = {
  // Primary brand colors
  primary: '#f1552f',      // Main brand color
  secondary: '#f8ac8c',    // Accent color  
  tertiary: '#ff8a65',     // Supporting accent
  
  // Neutral colors
  background: '#40423c',   // Main dark background
  surface: '#444640',      // Card/surface backgrounds
  surfaceLight: '#4a4c46', // Lighter surface variant
  
  // Text colors (semantic naming)
  textPrimary: '#ffffff',    // White text
  textSecondary: '#9d9a95',  // Gray text secondary
  textTertiary: '#7a7872',   // Lighter gray text
  
  // Feedback colors
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  
  // Additional utility colors
  overlay: 'rgba(0, 0, 0, 0.6)',
  border: 'rgba(255, 255, 255, 0.1)',
  divider: 'rgba(255, 255, 255, 0.08)',
};

// Typography System - Consistent hierarchy
export const TYPOGRAPHY = {
  // Main headings
  h1: {
    fontSize: 120,
    fontWeight: 800,
    letterSpacing: '-0.02em',
    lineHeight: 1.1,
  },
  h2: {
    fontSize: 60,
    fontWeight: 400,
    letterSpacing: '-0.01em',
    lineHeight: 1.2,
  },
  h3: {
    fontSize: 46,
    fontWeight: 600,
    letterSpacing: '0em',
    lineHeight: 1.3,
  },
  
  // Body text
  body: {
    fontSize: 36,
    fontWeight: 400,
    lineHeight: 1.4,
  },
  bodyLarge: {
    fontSize: 42,
    fontWeight: 400,
    lineHeight: 1.4,
  },
  bodySmall: {
    fontSize: 32,
    fontWeight: 400,
    lineHeight: 1.4,
  },
  
  // Special cases
  caption: {
    fontSize: 28,
    fontWeight: 300,
    lineHeight: 1.3,
  },
  overline: {
    fontSize: 24,
    fontWeight: 500,
    letterSpacing: '0.1em',
    textTransform: 'uppercase' as const,
  },
};

// Spacing System - Consistent margins and padding
export const SPACING = {
  xs: 8,     // 8px
  sm: 16,    // 16px  
  md: 24,    // 24px
  lg: 32,    // 32px
  xl: 48,    // 48px
  xxl: 64,   // 64px
  xxxl: 80,  // 80px - standard title margin from lessons
  xxxxl: 120, // 120px - extra large spacing
};

// Layout System
export const LAYOUT = {
  containerMaxWidth: 1600,
  contentMaxWidth: 1200,
  sidebarWidth: 320,
  headerHeight: 80,
  
  // Breakpoints
  breakpoints: {
    mobile: 768,
    tablet: 1024,
    desktop: 1440,
    largeDesktop: 1920,
  },
  
  // Grid system
  gridGap: SPACING.lg,
  gridColumns: 12,
};

// Animation System - Consistent timing and easing
export const ANIMATIONS = {
  durations: {
    fast: 200,
    normal: 300,     // Standard transition
    slow: 500,
    slower: 800,
  },
  
  easing: {
    ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    easeIn: 'cubic-bezier(0.42, 0, 1, 1)',
    easeOut: 'cubic-bezier(0, 0, 0.58, 1)',
    easeInOut: 'cubic-bezier(0.42, 0, 0.58, 1)',
  },
  
  // Video-specific timing (30fps = 33.33ms per frame)
  frameRate: 30,
  framesToMs: (frames: number) => (frames / 30) * 1000,
  msToFrames: (ms: number) => Math.round((ms / 1000) * 30),
};

// Icon and Asset Sizes
export const SIZES = {
  icon: {
    small: 24,
    medium: 48,
    large: 120,    // Standard for main icons from lessons
    xlarge: 180,
  },
  
  avatar: {
    small: 32,
    medium: 48,
    large: 64,
    xlarge: 96,
  },
  
  button: {
    small: { height: 32, padding: SPACING.sm },
    medium: { height: 40, padding: SPACING.md },
    large: { height: 48, padding: SPACING.lg },
  },
};

// Visual Effects System
export const EFFECTS = {
  // Border radius system
  borderRadius: {
    small: 8,
    medium: 12,   // Standard for cards from lessons
    large: 20,    // For buttons/links
    round: 9999,  // Fully rounded
  },
  
  // Shadow system
  shadows: {
    small: '0 2px 4px rgba(0, 0, 0, 0.1)',
    medium: '0 4px 8px rgba(0, 0, 0, 0.15)',
    large: '0 8px 16px rgba(0, 0, 0, 0.2)',
    xlarge: '0 16px 32px rgba(0, 0, 0, 0.25)',
  },
  
  // Stroke widths
  strokeWidth: {
    thin: 2,
    medium: 4,    // Standard for borders from lessons
    thick: 6,     // For emphasis
    extraThick: 8,
  },
};

// Font System (Enhanced with Typography Selection)
export const FONTS = {
  primary: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  secondary: "'JetBrains Mono', 'Fira Code', monospace",
  display: "'Inter', sans-serif",
  
  // Video-optimized font families
  title: "'Inter', sans-serif", // Will be dynamic based on user selection
  subtitle: "'Roboto', sans-serif", // Will be dynamic based on user selection
  body: "'Open Sans', sans-serif", // Will be dynamic based on user selection
};

// Dynamic font configuration interface
export interface DynamicFonts {
  title: string;
  subtitle: string;
  body: string;
  pairing?: string;
}

// Font management utilities
export const fontUtils = {
  // Load Google Fonts dynamically
  loadGoogleFont: (fontUrl: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const existingLink = document.querySelector(`link[href="${fontUrl}"]`);
      if (existingLink) {
        resolve();
        return;
      }

      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = fontUrl;
      link.onload = () => resolve();
      link.onerror = () => reject(new Error(`Failed to load font: ${fontUrl}`));
      document.head.appendChild(link);
    });
  },

  // Apply dynamic fonts to the design system
  applyFontConfiguration: (fontConfig: DynamicFonts) => {
    return {
      ...FONTS,
      title: fontConfig.title,
      subtitle: fontConfig.subtitle,
      body: fontConfig.body,
    };
  },

  // Get font family string for CSS
  getFontFamily: (fontName: string, fallback: string = 'sans-serif') => {
    return fontName.includes(',') ? fontName : `"${fontName}", ${fallback}`;
  },

  // Validate if font is loaded
  isFontLoaded: (fontFamily: string): boolean => {
    return document.fonts.check(`16px ${fontFamily}`);
  },
};

// Z-index System
export const Z_INDEX = {
  dropdown: 1000,
  modal: 1010,
  popover: 1020,
  tooltip: 1030,
  toast: 1040,
};

// Responsive helper functions
export const responsive = {
  mobile: (styles: any) => ({
    [`@media (max-width: ${LAYOUT.breakpoints.mobile}px)`]: styles,
  }),
  tablet: (styles: any) => ({
    [`@media (max-width: ${LAYOUT.breakpoints.tablet}px)`]: styles,
  }),
  desktop: (styles: any) => ({
    [`@media (min-width: ${LAYOUT.breakpoints.desktop}px)`]: styles,
  }),
};

// Utility function to get proportional sizes (from lessons)
export const getProportionalSize = (baseSize: number, ratio: number) => 
  Math.round(baseSize * ratio);

// Brand color validation (for future brand color selector)
export const validateHexColor = (hex: string): boolean => {
  return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
};

// Create brand color palette from user input
export const createBrandPalette = (brandColors: string[]) => {
  if (!brandColors.every(validateHexColor)) {
    throw new Error('All colors must be valid hex codes');
  }
  
  return {
    primary: brandColors[0] || COLORS.primary,
    secondary: brandColors[1] || COLORS.secondary,
    tertiary: brandColors[2] || COLORS.tertiary,
    // Keep neutral colors from system
    ...COLORS,
  };
};

export default {
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
};