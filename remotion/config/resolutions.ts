/**
 * Resolution configurations for Remotion components
 * Import these to ensure consistent layouts across different formats
 */

export interface ResolutionConfig {
  name: string;
  width: number;
  height: number;
  cards: {
    width: number;
    height: number;
    gap: number;
    perRow?: number;
  };
  fonts: {
    title: number;
    subtitle: number;
    body: number;
    small: number;
    min: number;
  };
  zones: {
    headerHeight: number;
    footerHeight: number;
    contentPadding: number;
  };
  layout: 'horizontal' | 'vertical' | 'grid';
  description: string;
}

export const RESOLUTIONS = {
  // Standard HD - Most common format
  'hd': {
    name: 'HD Video',
    width: 1920,
    height: 1080,
    cards: {
      width: 500,
      height: 350,
      gap: 60,
      perRow: 3,
    },
    fonts: {
      title: 84,
      subtitle: 48,
      body: 32,
      small: 24,
      min: 20,
    },
    zones: {
      headerHeight: 200,
      footerHeight: 200,
      contentPadding: 60,
    },
    layout: 'horizontal' as const,
    description: 'YouTube, Presentations, General video',
  },

  // 4K Ultra HD
  '4k': {
    name: '4K Ultra HD',
    width: 3840,
    height: 2160,
    cards: {
      width: 1000,
      height: 700,
      gap: 120,
      perRow: 3,
    },
    fonts: {
      title: 168,
      subtitle: 96,
      body: 64,
      small: 48,
      min: 40,
    },
    zones: {
      headerHeight: 400,
      footerHeight: 400,
      contentPadding: 120,
    },
    layout: 'horizontal' as const,
    description: 'High-resolution displays, premium content',
  },

  // Mobile Portrait (9:16)
  'mobile-portrait': {
    name: 'Mobile Portrait',
    width: 1080,
    height: 1920,
    cards: {
      width: 900,
      height: 400,
      gap: 40,
      perRow: 1,
    },
    fonts: {
      title: 96,
      subtitle: 56,
      body: 36,
      small: 28,
      min: 24,
    },
    zones: {
      headerHeight: 300,
      footerHeight: 300,
      contentPadding: 40,
    },
    layout: 'vertical' as const,
    description: 'TikTok, Instagram Reels, Stories',
  },

  // Mobile Landscape (16:9)
  'mobile-landscape': {
    name: 'Mobile Landscape',
    width: 1920,
    height: 1080,
    cards: {
      width: 500,
      height: 350,
      gap: 60,
      perRow: 3,
    },
    fonts: {
      title: 84,
      subtitle: 48,
      body: 32,
      small: 24,
      min: 20,
    },
    zones: {
      headerHeight: 200,
      footerHeight: 200,
      contentPadding: 60,
    },
    layout: 'horizontal' as const,
    description: 'YouTube Shorts (horizontal), Mobile video',
  },

  // Square (1:1)
  'square': {
    name: 'Square',
    width: 1080,
    height: 1080,
    cards: {
      width: 300,
      height: 300,
      gap: 40,
      perRow: 3,
    },
    fonts: {
      title: 72,
      subtitle: 42,
      body: 28,
      small: 20,
      min: 18,
    },
    zones: {
      headerHeight: 180,
      footerHeight: 180,
      contentPadding: 40,
    },
    layout: 'horizontal' as const,
    description: 'Instagram Posts, Square videos',
  },

  // Ultra-wide (21:9)
  'ultrawide': {
    name: 'Ultra-wide',
    width: 2560,
    height: 1080,
    cards: {
      width: 400,
      height: 350,
      gap: 50,
      perRow: 5,
    },
    fonts: {
      title: 84,
      subtitle: 48,
      body: 32,
      small: 24,
      min: 20,
    },
    zones: {
      headerHeight: 180,
      footerHeight: 180,
      contentPadding: 80,
    },
    layout: 'horizontal' as const,
    description: 'Ultrawide monitors, cinematic content',
  },

  // LinkedIn Video
  'linkedin': {
    name: 'LinkedIn',
    width: 1920,
    height: 1080,
    cards: {
      width: 500,
      height: 350,
      gap: 60,
      perRow: 3,
    },
    fonts: {
      title: 84,
      subtitle: 48,
      body: 32,
      small: 24,
      min: 20,
    },
    zones: {
      headerHeight: 200,
      footerHeight: 200,
      contentPadding: 60,
    },
    layout: 'horizontal' as const,
    description: 'LinkedIn native video, professional content',
  },

  // Twitter/X Video
  'twitter': {
    name: 'Twitter/X',
    width: 1920,
    height: 1080,
    cards: {
      width: 500,
      height: 350,
      gap: 60,
      perRow: 3,
    },
    fonts: {
      title: 84,
      subtitle: 48,
      body: 32,
      small: 24,
      min: 20,
    },
    zones: {
      headerHeight: 200,
      footerHeight: 200,
      contentPadding: 60,
    },
    layout: 'horizontal' as const,
    description: 'Twitter/X video posts',
  },

  // Presentation/Slides (16:9)
  'presentation': {
    name: 'Presentation',
    width: 1920,
    height: 1080,
    cards: {
      width: 500,
      height: 350,
      gap: 60,
      perRow: 3,
    },
    fonts: {
      title: 84,
      subtitle: 48,
      body: 32,
      small: 24,
      min: 20,
    },
    zones: {
      headerHeight: 200,
      footerHeight: 200,
      contentPadding: 60,
    },
    layout: 'horizontal' as const,
    description: 'PowerPoint, Keynote, Google Slides',
  },
} as const;

export type ResolutionKey = keyof typeof RESOLUTIONS;

/**
 * Calculate positions for cards based on resolution config
 */
export function calculateCardPositions(
  config: ResolutionConfig,
  numCards: number
): Array<{ x: number; y: number }> {
  const positions: Array<{ x: number; y: number }> = [];
  
  if (config.layout === 'vertical') {
    // Stack vertically, center horizontally
    const x = (config.width - config.cards.width) / 2;
    const startY = config.zones.headerHeight + config.zones.contentPadding;
    
    for (let i = 0; i < numCards; i++) {
      positions.push({
        x,
        y: startY + (i * (config.cards.height + config.cards.gap)),
      });
    }
  } else if (config.layout === 'horizontal') {
    // Arrange horizontally, center the group
    const totalWidth = (config.cards.width * numCards) + 
                      (config.cards.gap * (numCards - 1));
    const startX = (config.width - totalWidth) / 2;
    const y = config.zones.headerHeight + 
              ((config.height - config.zones.headerHeight - config.zones.footerHeight - config.cards.height) / 2);
    
    for (let i = 0; i < numCards; i++) {
      positions.push({
        x: startX + (i * (config.cards.width + config.cards.gap)),
        y,
      });
    }
  } else if (config.layout === 'grid') {
    // Grid layout
    const cardsPerRow = config.cards.perRow || 3;
    const rows = Math.ceil(numCards / cardsPerRow);
    const totalWidth = (config.cards.width * cardsPerRow) + 
                      (config.cards.gap * (cardsPerRow - 1));
    const totalHeight = (config.cards.height * rows) + 
                       (config.cards.gap * (rows - 1));
    const startX = (config.width - totalWidth) / 2;
    const startY = config.zones.headerHeight + 
                  ((config.height - config.zones.headerHeight - config.zones.footerHeight - totalHeight) / 2);
    
    for (let i = 0; i < numCards; i++) {
      const row = Math.floor(i / cardsPerRow);
      const col = i % cardsPerRow;
      positions.push({
        x: startX + (col * (config.cards.width + config.cards.gap)),
        y: startY + (row * (config.cards.height + config.cards.gap)),
      });
    }
  }
  
  return positions;
}

/**
 * Get safe area bounds (area within margins)
 */
export function getSafeArea(config: ResolutionConfig) {
  return {
    x: config.zones.contentPadding,
    y: config.zones.headerHeight,
    width: config.width - (config.zones.contentPadding * 2),
    height: config.height - config.zones.headerHeight - config.zones.footerHeight,
  };
}

/**
 * Scale a base HD design to another resolution
 */
export function scaleFromHD(
  targetResolution: ResolutionKey,
  hdValue: number
): number {
  const hdConfig = RESOLUTIONS['hd'];
  const targetConfig = RESOLUTIONS[targetResolution];
  
  const scaleX = targetConfig.width / hdConfig.width;
  const scaleY = targetConfig.height / hdConfig.height;
  const scale = Math.min(scaleX, scaleY);
  
  return Math.round(hdValue * scale);
}

/**
 * Get responsive font size based on resolution
 */
export function getResponsiveFontSize(
  resolution: ResolutionKey,
  sizeType: keyof ResolutionConfig['fonts']
): number {
  return RESOLUTIONS[resolution].fonts[sizeType];
}

/**
 * Debug helper: Get grid lines for layout visualization
 */
export function getDebugGrid(config: ResolutionConfig) {
  return {
    centerVertical: config.width / 2,
    centerHorizontal: config.height / 2,
    thirds: {
      vertical: [config.width / 3, (config.width * 2) / 3],
      horizontal: [config.height / 3, (config.height * 2) / 3],
    },
    safeArea: getSafeArea(config),
    zones: {
      header: { y: 0, height: config.zones.headerHeight },
      content: { 
        y: config.zones.headerHeight, 
        height: config.height - config.zones.headerHeight - config.zones.footerHeight 
      },
      footer: { 
        y: config.height - config.zones.footerHeight, 
        height: config.zones.footerHeight 
      },
    },
  };
}