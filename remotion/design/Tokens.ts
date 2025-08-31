export type VideoFormat = 'vertical' | 'square' | 'horizontal';

export const TOKENS = {
  vertical: {
    canvas: { width: 1080, height: 1920 },
    layout: { top: 160, side: 80, bottom: 80, gap: 32 },
    headline: { size: 80 },
    subhead: { size: 48 },
    stat: { width: 980, height: 600, valueSize: 96, labelSize: 28, titleSize: 48 },
    callout: { width: 980, height: 340, titleSize: 40 },
  },
  square: {
    canvas: { width: 1080, height: 1080 },
    layout: { top: 120, side: 80, bottom: 80, gap: 28 },
    headline: { size: 64 },
    subhead: { size: 40 },
    stat: { width: 980, height: 520, valueSize: 84, labelSize: 26, titleSize: 44 },
    callout: { width: 980, height: 300, titleSize: 36 },
  },
  horizontal: {
    canvas: { width: 1920, height: 1080 },
    layout: { top: 96, side: 120, bottom: 80, gap: 24 },
    headline: { size: 56 },
    subhead: { size: 36 },
    stat: { width: 1600, height: 420, valueSize: 72, labelSize: 24, titleSize: 40 },
    callout: { width: 1600, height: 260, titleSize: 32 },
  },
} as const;

export const tokensFor = (format: VideoFormat) => TOKENS[format] || TOKENS.vertical;

