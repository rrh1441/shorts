export type VideoFormat = 'vertical' | 'square' | 'horizontal';

export const TOKENS = {
  vertical: {
    canvas: { width: 1080, height: 1920 },
    layout: { top: 160, side: 80, bottom: 80, gap: 32 },
    // Aggressive motion-design ramps for portrait
    headline: { size: 96 },
    subhead: { size: 56 },
    stat: { width: 980, height: 640, valueSize: 140, labelSize: 20, titleSize: 52 },
    callout: { width: 980, height: 340, titleSize: 40 },
  },
  square: {
    canvas: { width: 1080, height: 1080 },
    layout: { top: 120, side: 80, bottom: 80, gap: 28 },
    headline: { size: 80 },
    subhead: { size: 48 },
    stat: { width: 980, height: 560, valueSize: 120, labelSize: 20, titleSize: 48 },
    callout: { width: 980, height: 300, titleSize: 36 },
  },
  horizontal: {
    canvas: { width: 1920, height: 1080 },
    layout: { top: 96, side: 120, bottom: 80, gap: 24 },
    headline: { size: 64 },
    subhead: { size: 40 },
    stat: { width: 1600, height: 460, valueSize: 96, labelSize: 18, titleSize: 44 },
    callout: { width: 1600, height: 260, titleSize: 32 },
  },
} as const;

export const tokensFor = (format: VideoFormat) => TOKENS[format] || TOKENS.vertical;
