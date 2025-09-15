/**
 * Video Design System Tokens
 * Foundation tokens for video-first primitives
 * Inherits from shadcn but adapted for video constraints
 */

// Safe areas for different aspect ratios (percentage of dimension)
export const SAFE_AREAS = {
  horizontal: { top: 0.05, bottom: 0.05, left: 0.03, right: 0.03 }, // 16:9
  square: { top: 0.08, bottom: 0.08, left: 0.05, right: 0.05 }, // 1:1
  vertical: { top: 0.12, bottom: 0.15, left: 0.05, right: 0.05 } // 9:16 (space for captions)
} as const;

// Aspect ratio dimensions
export const DIMENSIONS = {
  horizontal: { width: 1920, height: 1080 },
  square: { width: 1080, height: 1080 },
  vertical: { width: 1080, height: 1920 }
} as const;

// Color palette - video optimized
export const COLORS = {
  brand: {
    primary: 'hsl(222 84% 52%)', // Blue
    secondary: 'hsl(210 40% 98%)', // Light blue
    accent: 'hsl(145 63% 49%)', // Green
  },
  neutrals: {
    900: 'hsl(222 84% 5%)', // Near black
    800: 'hsl(215 28% 17%)', // Dark gray
    700: 'hsl(217 33% 24%)', // Medium dark
    600: 'hsl(215 20% 65%)', // Medium
    500: 'hsl(220 13% 69%)', // Light gray
    400: 'hsl(218 11% 85%)', // Very light
    300: 'hsl(220 14% 96%)', // Almost white
    200: 'hsl(210 20% 98%)', // Nearly white
    100: 'hsl(0 0% 100%)', // Pure white
    0: 'hsl(0 0% 0%)' // Pure black
  },
  semantic: {
    success: 'hsl(145 63% 49%)',
    warning: 'hsl(48 96% 53%)',
    error: 'hsl(0 84% 60%)',
    info: 'hsl(222 84% 52%)'
  },
  overlays: {
    dark: 'hsla(222, 84%, 5%, 0.8)',
    light: 'hsla(0, 0%, 100%, 0.9)',
    glass: 'hsla(0, 0%, 100%, 0.1)'
  }
} as const;

// Typography scale - optimized for video readability
export const TYPOGRAPHY = {
  // Font families (prefer variable fonts for animation)
  families: {
    sans: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono Variable', 'JetBrains Mono', 'monospace'],
    display: ['Inter Variable', 'Inter', 'system-ui', 'sans-serif']
  },
  
  // Size scales per aspect ratio (in pixels)
  scales: {
    horizontal: {
      hero: 96,      // Main headlines
      title: 72,     // Section titles  
      subtitle: 48,  // Subtitles
      body: 36,      // Body text
      caption: 24,   // Captions/labels
      small: 18      // Fine print
    },
    square: {
      hero: 72,
      title: 56,
      subtitle: 40,
      body: 28,
      caption: 20,
      small: 16
    },
    vertical: {
      hero: 64,
      title: 48,
      subtitle: 36,
      body: 24,
      caption: 18,
      small: 14
    }
  },
  
  // Line heights
  lineHeights: {
    tight: 1.1,
    normal: 1.3,
    relaxed: 1.5
  },
  
  // Font weights
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    black: 900
  }
} as const;

// Spacing scale (in pixels)
export const SPACING = {
  0: 0,
  1: 8,
  2: 16,
  3: 24,
  4: 32,
  5: 40,
  6: 48,
  8: 64,
  10: 80,
  12: 96,
  16: 128,
  20: 160,
  24: 192,
  32: 256
} as const;

// Border radius values
export const RADII = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 12,
  xl: 16,
  '2xl': 20,
  full: 9999
} as const;

// Shadow definitions
export const SHADOWS = {
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
} as const;

// Blur levels
export const BLUR = {
  none: 0,
  sm: 4,
  md: 8,
  lg: 16,
  xl: 24,
  '2xl': 40,
  '3xl': 64
} as const;

// Opacity steps
export const OPACITY = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1
} as const;

// Animation timing
export const TIMING = {
  // Duration in milliseconds
  durations: {
    fast: 150,
    normal: 250,
    slow: 350,
    slower: 500
  },
  
  // Easing functions (cubic-bezier values)
  easings: {
    standard: [0.2, 0.8, 0.2, 1],
    emphasis: [0.12, 0.9, 0.1, 1],
    gentle: [0.25, 0.46, 0.45, 0.94],
    sharp: [0.4, 0, 0.6, 1]
  }
} as const;

// Utility functions for token access
export function getSafeArea(aspect: keyof typeof SAFE_AREAS) {
  const dims = DIMENSIONS[aspect];
  const safe = SAFE_AREAS[aspect];
  
  return {
    width: dims.width * (1 - safe.left - safe.right),
    height: dims.height * (1 - safe.top - safe.bottom),
    x: dims.width * safe.left,
    y: dims.height * safe.top
  };
}

export function getTypeScale(aspect: keyof typeof TYPOGRAPHY.scales, size: keyof typeof TYPOGRAPHY.scales.horizontal) {
  return TYPOGRAPHY.scales[aspect][size];
}

export function getCubicBezier(easing: keyof typeof TIMING.easings): string {
  const [x1, y1, x2, y2] = TIMING.easings[easing];
  return `cubic-bezier(${x1}, ${y1}, ${x2}, ${y2})`;
}

// Type exports for strict typing
export type AspectRatio = keyof typeof DIMENSIONS;
export type ColorToken = keyof typeof COLORS.brand | keyof typeof COLORS.neutrals | keyof typeof COLORS.semantic;
export type SpacingToken = keyof typeof SPACING;
export type TypographySize = keyof typeof TYPOGRAPHY.scales.horizontal;
export type Easing = keyof typeof TIMING.easings;
