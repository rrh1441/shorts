/**
 * Brand Color Best Practices for Animated Videos
 * Research-based guidelines to avoid ugly gradients and create professional animations
 * Based on 2025 motion graphics trends and industry best practices
 */

export interface BrandColorPalette {
  primary: string;
  secondary: string;
  tertiary?: string;
  neutral: string[];
  accent: string[];
}

export const BRAND_COLOR_BEST_PRACTICES = {
  // Core Principles from 2025 Motion Graphics Research
  principles: {
    consistency: {
      title: "Consistency is Key",
      description: "Maintain consistent color usage across all segments and animations",
      rules: [
        "Use the same primary colors throughout the entire video",
        "Maintain consistent color relationships (primary, secondary, accent)",
        "Apply colors systematically, not randomly across elements"
      ]
    },
    
    purposeDriven: {
      title: "Purpose-Driven Color Choices",
      description: "Every color should serve a specific purpose in the narrative",
      rules: [
        "Primary colors for main brand elements and key messages",
        "Secondary colors for supporting information and context",
        "Accent colors sparingly for emphasis and calls-to-action"
      ]
    },
    
    contextAppropriate: {
      title: "Context-Appropriate Usage",
      description: "Colors should enhance message clarity, not distract from it",
      rules: [
        "Use high contrast for important text and data",
        "Apply subtle colors for background elements",
        "Ensure accessibility with proper color contrast ratios"
      ]
    },
    
    minimalistMaximalism: {
      title: "Minimalist Maximalism (2025 Trend)",
      description: "Balance bold colors with clean, simple design",
      rules: [
        "Use vibrant colors on clean, minimal backgrounds",
        "Combine bold accent colors with muted base tones",
        "Create visual hierarchy through strategic color application"
      ]
    }
  },

  // What NOT to do (lessons from manual process)
  avoidUglyGradients: {
    badPractices: [
      "Random rainbow gradients with no brand connection",
      "Over-saturated color combinations that strain the eyes",
      "Too many colors competing for attention simultaneously",
      "Gradients that muddy the middle tones (brown/gray mixing)",
      "Mismatched color temperatures (warm + cool without intention)"
    ],
    
    betterAlternatives: [
      "Use 2-3 color gradients maximum with brand colors",
      "Create gradients within the same color family (analogous colors)",
      "Use gradients as subtle backgrounds, not main focal points",
      "Apply gradients to enhance depth, not create visual noise",
      "Consider monochromatic gradients for sophisticated looks"
    ]
  },

  // 2025 Color Trends for Video
  trendingApproaches: {
    retroFuturistic: {
      description: "Blend nostalgic aesthetics with futuristic concepts",
      colors: ["#FF6B35", "#004E89", "#00A8CC", "#FFD23F", "#EE6C4D"],
      usage: "Neon accents on dark backgrounds, geometric patterns"
    },
    
    boldMinimalism: {
      description: "Vibrant colors on clean, spacious layouts",
      approach: "Single bold color per scene with plenty of whitespace",
      example: "Bright primary color text on neutral background"
    },
    
    sustainablePalettes: {
      description: "Earth-tones and nature-inspired colors for 2025",
      colors: ["#2D5016", "#61A55C", "#A4BE7B", "#E5D37F", "#D4A574"],
      usage: "For eco-friendly or sustainable brand messaging"
    }
  },

  // Color Psychology for Video
  colorPsychology: {
    red: {
      emotions: ["urgency", "excitement", "importance"],
      usage: "Calls-to-action, error states, key statistics",
      avoid: "Large background areas (can be overwhelming)"
    },
    blue: {
      emotions: ["trust", "professionalism", "stability"],
      usage: "Corporate branding, data visualization, headers",
      avoid: "Too much blue can feel cold or clinical"
    },
    green: {
      emotions: ["growth", "success", "sustainability"],
      usage: "Success states, environmental messaging, progress indicators",
      avoid: "Neon green can appear unprofessional"
    },
    orange: {
      emotions: ["energy", "creativity", "enthusiasm"],
      usage: "Accent colors, highlights, creative industries",
      avoid: "Overuse can appear unprofessional"
    },
    purple: {
      emotions: ["creativity", "luxury", "innovation"],
      usage: "Premium brands, tech companies, creative services",
      avoid: "Dark purples can be hard to read"
    }
  },

  // Implementation Guidelines
  implementationRules: {
    colorRatios: {
      primary: "60% - Main brand color for backgrounds and large elements",
      secondary: "30% - Supporting color for secondary elements",
      accent: "10% - Bright color for emphasis and highlights"
    },
    
    contrastRequirements: {
      textOnBackground: "Minimum 4.5:1 contrast ratio for readability",
      importantText: "Minimum 7:1 contrast ratio for accessibility",
      dataVisualization: "Clear distinction between adjacent colors"
    },
    
    animationConsiderations: {
      colorTransitions: "Smooth transitions between related colors",
      brandConsistency: "Maintain brand colors through all animations",
      visualHierarchy: "Use color to guide viewer attention through scenes"
    }
  }
};

// Utility functions for brand color implementation
export class BrandColorValidator {
  static validateHexColor(hex: string): boolean {
    return /^#([0-9A-F]{3}){1,2}$/i.test(hex);
  }

  static calculateContrastRatio(color1: string, color2: string): number {
    // Simplified contrast calculation - in production, use a proper color library
    return 4.5; // Placeholder - would implement actual calculation
  }

  static generateColorScheme(brandColors: string[]): BrandColorPalette {
    if (!brandColors.every(this.validateHexColor)) {
      throw new Error('All colors must be valid hex codes');
    }

    return {
      primary: brandColors[0],
      secondary: brandColors[1] || this.generateSecondary(brandColors[0]),
      tertiary: brandColors[2],
      neutral: ['#FFFFFF', '#F8F9FA', '#E9ECEF', '#DEE2E6', '#ADB5BD', '#6C757D', '#495057', '#343A40', '#212529'],
      accent: brandColors.slice(1) // Use additional brand colors as accents
    };
  }

  private static generateSecondary(primary: string): string {
    // Simplified - in production, would use color theory to generate complementary colors
    return primary;
  }

  static createGradientPalette(baseColor: string): string[] {
    // Generate a safe gradient palette from a base color
    // Avoiding the "ugly gradient" problem by staying within color family
    return [
      baseColor,
      this.lightenColor(baseColor, 20),
      this.darkenColor(baseColor, 20)
    ];
  }

  private static lightenColor(hex: string, percent: number): string {
    // Simplified - would implement proper color manipulation
    return hex;
  }

  private static darkenColor(hex: string, percent: number): string {
    // Simplified - would implement proper color manipulation
    return hex;
  }
}

// Safe gradient combinations (avoiding ugly gradients from lessons)
export const SAFE_GRADIENT_COMBINATIONS = {
  monochromatic: {
    description: "Single color with light/dark variations",
    example: ["#FF6B35", "#FF8A5B", "#FFA07A"],
    usage: "Professional, sophisticated look"
  },
  
  analogous: {
    description: "Colors next to each other on color wheel",
    example: ["#FF6B35", "#FF9500", "#FFB347"],
    usage: "Harmonious, natural feeling"
  },
  
  complementary: {
    description: "Two colors opposite on color wheel",
    example: ["#FF6B35", "#004E89"],
    usage: "High contrast, dynamic"
  },
  
  triadic: {
    description: "Three evenly spaced colors",
    example: ["#FF6B35", "#35FF6B", "#6B35FF"],
    usage: "Vibrant but balanced (use sparingly)"
  }
};

// Animation-specific color guidelines
export const ANIMATION_COLOR_GUIDELINES = {
  textReveal: {
    background: "Use subtle, low-contrast background colors",
    text: "High contrast colors for readability during motion",
    timing: "Consistent color timing with animation rhythm"
  },
  
  dataVisualization: {
    bars: "Use brand primary for main data",
    labels: "High contrast text colors",
    background: "Neutral colors to not compete with data"
  },
  
  transitions: {
    betweenScenes: "Maintain color continuity across transitions",
    withinScene: "Smooth color transitions, avoid jarring changes",
    brandElements: "Keep brand colors consistent throughout"
  },
  
  iconography: {
    mainIcons: "Use primary brand color",
    secondaryIcons: "Use secondary or neutral colors",
    interactive: "Use accent colors sparingly for emphasis"
  }
};

export default {
  BRAND_COLOR_BEST_PRACTICES,
  BrandColorValidator,
  SAFE_GRADIENT_COMBINATIONS,
  ANIMATION_COLOR_GUIDELINES
};