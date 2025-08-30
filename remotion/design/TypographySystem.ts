/**
 * Typography System for Video Content
 * Curated selection of the best free fonts for motion graphics and video content
 * Based on 2025 industry research and best practices
 */

// Font categories and characteristics
export interface FontMetadata {
  name: string;
  family: string;
  category: 'sans-serif' | 'serif' | 'display' | 'monospace' | 'handwriting';
  weights: number[];
  styles: ('normal' | 'italic')[];
  description: string;
  bestFor: string[];
  readability: 'high' | 'medium' | 'low';
  videoSuitability: 'excellent' | 'good' | 'fair';
  source: 'google-fonts' | 'system' | 'custom';
  url?: string;
}

// Curated collection of the best free fonts for video content
export const VIDEO_FONTS: Record<string, FontMetadata> = {
  // Sans-Serif Fonts (Best for video readability)
  inter: {
    name: 'Inter',
    family: 'Inter, sans-serif',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    description: 'Modern, highly readable sans-serif designed for digital screens',
    bestFor: ['Corporate videos', 'Presentations', 'UI text', 'Body text'],
    readability: 'high',
    videoSuitability: 'excellent',
    source: 'google-fonts',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap'
  },

  bebasNeue: {
    name: 'Bebas Neue',
    family: 'Bebas Neue, sans-serif',
    category: 'display',
    weights: [400],
    styles: ['normal'],
    description: 'Ultra-bold display font with theatrical impact, perfect for titles',
    bestFor: ['Video titles', 'Headers', 'Impact text', 'Dramatic content'],
    readability: 'high',
    videoSuitability: 'excellent',
    source: 'google-fonts',
    url: 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap'
  },

  roboto: {
    name: 'Roboto',
    family: 'Roboto, sans-serif',
    category: 'sans-serif',
    weights: [100, 300, 400, 500, 700, 900],
    styles: ['normal', 'italic'],
    description: 'Clean, modern sans-serif with excellent screen readability',
    bestFor: ['Body text', 'UI elements', 'Technical content', 'Educational videos'],
    readability: 'high',
    videoSuitability: 'excellent',
    source: 'google-fonts',
    url: 'https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&display=swap'
  },

  openSans: {
    name: 'Open Sans',
    family: 'Open Sans, sans-serif',
    category: 'sans-serif',
    weights: [300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
    description: 'Friendly, highly legible humanist sans-serif',
    bestFor: ['Body text', 'Subtitles', 'Professional content', 'Long-form text'],
    readability: 'high',
    videoSuitability: 'excellent',
    source: 'google-fonts',
    url: 'https://fonts.googleapis.com/css2?family=Open+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&display=swap'
  },

  // Display Fonts for Impact
  oswald: {
    name: 'Oswald',
    family: 'Oswald, sans-serif',
    category: 'display',
    weights: [200, 300, 400, 500, 600, 700],
    styles: ['normal'],
    description: 'Condensed sans-serif with strong character, great for headlines',
    bestFor: ['Headlines', 'Titles', 'Impact text', 'News content'],
    readability: 'high',
    videoSuitability: 'excellent',
    source: 'google-fonts',
    url: 'https://fonts.googleapis.com/css2?family=Oswald:wght@200;300;400;500;600;700&display=swap'
  },

  raleway: {
    name: 'Raleway',
    family: 'Raleway, sans-serif',
    category: 'sans-serif',
    weights: [100, 200, 300, 400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    description: 'Elegant, sophisticated sans-serif with great versatility',
    bestFor: ['Premium brands', 'Fashion', 'Luxury content', 'Elegant presentations'],
    readability: 'high',
    videoSuitability: 'excellent',
    source: 'google-fonts',
    url: 'https://fonts.googleapis.com/css2?family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&display=swap'
  },

  // Serif Fonts (Use sparingly in video)
  merriweather: {
    name: 'Merriweather',
    family: 'Merriweather, serif',
    category: 'serif',
    weights: [300, 400, 700, 900],
    styles: ['normal', 'italic'],
    description: 'Readable serif designed for screens, professional yet modern',
    bestFor: ['Formal content', 'Editorial', 'Traditional brands', 'Long-form text'],
    readability: 'high',
    videoSuitability: 'good',
    source: 'google-fonts',
    url: 'https://fonts.googleapis.com/css2?family=Merriweather:ital,wght@0,300;0,400;0,700;0,900;1,300;1,400;1,700;1,900&display=swap'
  },

  playfairDisplay: {
    name: 'Playfair Display',
    family: 'Playfair Display, serif',
    category: 'display',
    weights: [400, 500, 600, 700, 800, 900],
    styles: ['normal', 'italic'],
    description: 'High-contrast serif with elegant, sophisticated character',
    bestFor: ['Luxury brands', 'Fashion', 'Editorial content', 'Elegant titles'],
    readability: 'medium',
    videoSuitability: 'good',
    source: 'google-fonts',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,400;1,500;1,600;1,700;1,800;1,900&display=swap'
  },

  // Monospace Fonts
  jetBrainsMono: {
    name: 'JetBrains Mono',
    family: 'JetBrains Mono, monospace',
    category: 'monospace',
    weights: [100, 200, 300, 400, 500, 600, 700, 800],
    styles: ['normal', 'italic'],
    description: 'Modern monospace designed for developers, highly readable',
    bestFor: ['Code snippets', 'Technical content', 'Data', 'Developer tools'],
    readability: 'high',
    videoSuitability: 'excellent',
    source: 'google-fonts',
    url: 'https://fonts.googleapis.com/css2?family=JetBrains+Mono:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800&display=swap'
  },

  // System Fonts (Always available)
  systemSans: {
    name: 'System Sans-Serif',
    family: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    category: 'sans-serif',
    weights: [400, 500, 600, 700],
    styles: ['normal', 'italic'],
    description: 'Native system font, always available and optimized',
    bestFor: ['Fallback option', 'UI elements', 'System integration'],
    readability: 'high',
    videoSuitability: 'excellent',
    source: 'system'
  },
};

// Font pairing recommendations based on video content type
export const FONT_PAIRINGS = {
  corporate: {
    title: 'inter',
    subtitle: 'roboto',
    body: 'openSans',
    description: 'Professional and trustworthy for business content'
  },
  creative: {
    title: 'bebasNeue',
    subtitle: 'raleway',
    body: 'openSans',
    description: 'Bold and modern for creative agencies and portfolios'
  },
  luxury: {
    title: 'playfairDisplay',
    subtitle: 'raleway',
    body: 'merriweather',
    description: 'Elegant and sophisticated for premium brands'
  },
  technical: {
    title: 'oswald',
    subtitle: 'roboto',
    body: 'jetBrainsMono',
    description: 'Clean and precise for technical and educational content'
  },
  editorial: {
    title: 'playfairDisplay',
    subtitle: 'merriweather',
    body: 'openSans',
    description: 'Traditional and readable for news and editorial content'
  }
};

// Typography best practices for video
export const VIDEO_TYPOGRAPHY_GUIDELINES = {
  principles: {
    readability: {
      title: 'Prioritize Readability',
      rules: [
        'Use fonts with high contrast and clear letterforms',
        'Avoid ultra-thin weights (100-200) for small text',
        'Ensure sufficient size for screen viewing (minimum 24px for body text)',
        'Test readability at various screen sizes'
      ]
    },
    simplicity: {
      title: 'Keep It Simple',
      rules: [
        'Limit to 2-3 font families maximum per video',
        'Avoid overly decorative fonts for body text',
        'Use font weight and size for hierarchy, not multiple fonts',
        'Consider motion - text needs to be readable while moving'
      ]
    },
    hierarchy: {
      title: 'Establish Clear Hierarchy',
      rules: [
        'Use consistent font sizes for same content types',
        'Maintain proportional relationships (title 2x subtitle size)',
        'Use weight variation before changing fonts',
        'Keep consistent line heights for rhythm'
      ]
    }
  },

  sizeGuidelines: {
    title: {
      min: 60,
      recommended: 120,
      max: 200,
      description: 'Main titles should be large and impactful'
    },
    subtitle: {
      min: 36,
      recommended: 60,
      max: 80,
      description: 'Subtitles provide context and hierarchy'
    },
    body: {
      min: 24,
      recommended: 36,
      max: 48,
      description: 'Body text must be readable at distance'
    },
    caption: {
      min: 18,
      recommended: 28,
      max: 32,
      description: 'Small text for labels and footnotes'
    }
  },

  performanceConsiderations: {
    webFonts: {
      title: 'Web Font Performance',
      tips: [
        'Preload critical fonts in <head>',
        'Use font-display: swap for better UX',
        'Limit the number of font weights loaded',
        'Consider using system fonts for better performance'
      ]
    },
    rendering: {
      title: 'Video Rendering',
      tips: [
        'Ensure fonts are embedded in video exports',
        'Test font rendering across different devices',
        'Have fallback fonts for unsupported systems',
        'Consider font licensing for commercial use'
      ]
    }
  }
};

// Custom font validation and management
export class CustomFontManager {
  static supportedFormats = ['.woff', '.woff2', '.ttf', '.otf'];
  static maxFileSize = 2 * 1024 * 1024; // 2MB per font file

  static validateFont(file: File): Promise<{ valid: boolean; error?: string }> {
    return new Promise((resolve) => {
      // Check file size
      if (file.size > this.maxFileSize) {
        resolve({ valid: false, error: 'File size exceeds 2MB limit' });
        return;
      }

      // Check file extension
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!this.supportedFormats.includes(extension)) {
        resolve({ 
          valid: false, 
          error: `Unsupported format. Use: ${this.supportedFormats.join(', ')}` 
        });
        return;
      }

      // Additional validation could be added here
      resolve({ valid: true });
    });
  }

  static async loadCustomFont(
    file: File, 
    fontName: string, 
    fontWeight: number = 400
  ): Promise<FontMetadata> {
    const validation = await this.validateFont(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Create object URL for the font file
    const fontUrl = URL.createObjectURL(file);
    
    // Load the font
    const fontFace = new FontFace(fontName, `url(${fontUrl})`);
    await fontFace.load();
    document.fonts.add(fontFace);

    // Create metadata for the custom font
    const customFont: FontMetadata = {
      name: fontName,
      family: `"${fontName}", sans-serif`,
      category: 'sans-serif', // Default, could be detected
      weights: [fontWeight],
      styles: ['normal'],
      description: 'Custom uploaded font',
      bestFor: ['Brand consistency', 'Custom design'],
      readability: 'medium', // Unknown until tested
      videoSuitability: 'fair', // Unknown until tested
      source: 'custom',
      url: fontUrl
    };

    return customFont;
  }

  static removeCustomFont(fontName: string): void {
    // Remove from document.fonts
    const fontsToRemove = Array.from(document.fonts).filter(
      font => font.family === fontName
    );
    
    fontsToRemove.forEach(font => {
      document.fonts.delete(font);
    });
  }
}

export default {
  VIDEO_FONTS,
  FONT_PAIRINGS,
  VIDEO_TYPOGRAPHY_GUIDELINES,
  CustomFontManager
};