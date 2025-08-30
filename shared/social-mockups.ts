#!/usr/bin/env tsx

/**
 * Social Media Mockup Generator
 * Uses the React components from socialframe.md to generate visual post previews
 * Integrates with LinkedIn Posts and Twitter Threads pipelines
 */

import fs from 'node:fs/promises';
import path from 'node:path';

// Import types from the React components
export interface MediaItem {
  src: string;
  alt?: string;
  width?: number;
  height?: number;
  aspect?: "square" | "landscape" | "portrait";
}

export interface LinkedInPostProps {
  avatarUrl: string;
  name: string;
  headline?: string;
  timestamp: string;
  visibility?: "Public" | "Connections" | "Group";
  text: string;
  media?: MediaItem[];
  likes?: number;
  comments?: number;
  reposts?: number;
  sends?: number;
}

export interface XPostProps {
  avatarUrl: string;
  name: string;
  handle: string;
  verified?: boolean;
  timestamp: string;
  text: string;
  media?: MediaItem;
  theme?: "light" | "dim" | "dark";
  replies?: number;
  reposts?: number;
  likes?: number;
  views?: number;
}

export interface MockupConfig {
  // User profile info
  profile: {
    name: string;
    avatarUrl: string;
    headline?: string; // For LinkedIn
    handle?: string; // For Twitter
    verified?: boolean;
  };
  
  // Engagement simulation
  engagement: {
    likes: { min: number; max: number };
    comments: { min: number; max: number };
    reposts: { min: number; max: number };
    views?: { min: number; max: number }; // Twitter only
  };
  
  // Media attachments
  defaultMedia?: MediaItem[];
}

export class SocialMockupGenerator {
  
  private config: MockupConfig;
  
  constructor(config: MockupConfig) {
    this.config = config;
  }
  
  /**
   * Generate realistic engagement numbers
   */
  private generateEngagement(type: 'likes' | 'comments' | 'reposts' | 'views'): number {
    const range = this.config.engagement[type];
    if (!range) return 0;
    
    return Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
  }
  
  /**
   * Generate timestamp for posts
   */
  private generateTimestamp(platform: 'linkedin' | 'twitter', hoursAgo: number = 2): string {
    const now = new Date();
    const postTime = new Date(now.getTime() - (hoursAgo * 60 * 60 * 1000));
    
    if (platform === 'linkedin') {
      if (hoursAgo < 1) return `${Math.floor(hoursAgo * 60)}m`;
      if (hoursAgo < 24) return `${hoursAgo}h`;
      return `${Math.floor(hoursAgo / 24)}d`;
    } else {
      // Twitter format: "3:21 PM · Aug 24, 2025"
      return postTime.toLocaleString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      }).replace(',', ' ·');
    }
  }
  
  /**
   * Generate LinkedIn post mockup data
   */
  generateLinkedInPost(
    content: string,
    options: {
      hoursAgo?: number;
      media?: MediaItem[];
      visibility?: "Public" | "Connections" | "Group";
    } = {}
  ): LinkedInPostProps {
    
    return {
      avatarUrl: this.config.profile.avatarUrl,
      name: this.config.profile.name,
      headline: this.config.profile.headline,
      timestamp: this.generateTimestamp('linkedin', options.hoursAgo || 2),
      visibility: options.visibility || "Public",
      text: content,
      media: options.media || this.config.defaultMedia || [],
      likes: this.generateEngagement('likes'),
      comments: this.generateEngagement('comments'),
      reposts: this.generateEngagement('reposts'),
      sends: Math.floor(this.generateEngagement('reposts') * 0.3), // Sends are typically less
    };
  }
  
  /**
   * Generate Twitter/X post mockup data
   */
  generateXPost(
    content: string,
    options: {
      hoursAgo?: number;
      media?: MediaItem;
      theme?: "light" | "dim" | "dark";
    } = {}
  ): XPostProps {
    
    if (!this.config.profile.handle) {
      throw new Error('Twitter handle required for X post mockups');
    }
    
    return {
      avatarUrl: this.config.profile.avatarUrl,
      name: this.config.profile.name,
      handle: this.config.profile.handle.replace('@', ''),
      verified: this.config.profile.verified || false,
      timestamp: this.generateTimestamp('twitter', options.hoursAgo || 2),
      text: content,
      media: options.media,
      theme: options.theme || "light",
      replies: this.generateEngagement('comments'), // Twitter calls them replies
      reposts: this.generateEngagement('reposts'),
      likes: this.generateEngagement('likes'),
      views: this.generateEngagement('views') || this.generateEngagement('likes') * 50, // Estimate views from likes
    };
  }
  
  /**
   * Generate LinkedIn carousel post mockup data
   */
  generateLinkedInCarousel(
    content: string,
    carouselPages: MediaItem[],
    options: {
      hoursAgo?: number;
      visibility?: "Public" | "Connections" | "Group";
    } = {}
  ): any {
    
    return {
      avatarUrl: this.config.profile.avatarUrl,
      name: this.config.profile.name,
      headline: this.config.profile.headline,
      timestamp: this.generateTimestamp('linkedin', options.hoursAgo || 1),
      visibility: options.visibility || "Public",
      text: content,
      pages: carouselPages,
      likes: this.generateEngagement('likes'),
      comments: this.generateEngagement('comments'),
      reposts: this.generateEngagement('reposts'),
    };
  }
  
  /**
   * Save mockup data as JSON for React component consumption
   */
  async saveMockupData(
    mockups: Array<{
      type: 'linkedin-post' | 'linkedin-carousel' | 'x-post';
      data: LinkedInPostProps | XPostProps | any;
      filename: string;
    }>,
    outputDir: string
  ): Promise<string[]> {
    
    await fs.mkdir(outputDir, { recursive: true });
    const savedPaths: string[] = [];
    
    // Save individual mockup files
    for (const mockup of mockups) {
      const mockupPath = path.join(outputDir, `${mockup.filename}.json`);
      await fs.writeFile(mockupPath, JSON.stringify(mockup.data, null, 2));
      savedPaths.push(mockupPath);
    }
    
    // Save complete mockup suite
    const suiteData = {
      generatedAt: new Date().toISOString(),
      profileUsed: this.config.profile,
      mockups: mockups.map(m => ({
        type: m.type,
        filename: m.filename,
        preview: m.type.includes('linkedin') ? 
          { text: m.data.text?.substring(0, 100) + '...' } :
          { text: m.data.text?.substring(0, 100) + '...' }
      })),
      reactComponentPath: '/socialframe.md'
    };
    
    const suitePath = path.join(outputDir, 'social-mockups-suite.json');
    await fs.writeFile(suitePath, JSON.stringify(suiteData, null, 2));
    savedPaths.push(suitePath);
    
    // Save React import instructions
    const instructionsContent = `# Social Media Mockup Usage

## Generated Mockup Files
${mockups.map(m => `- \`${m.filename}.json\` - ${m.type} mockup data`).join('\n')}

## How to Use with React Components

1. **Import the React components:**
\`\`\`tsx
import { LinkedInPost, LinkedInCarouselPost, XPost } from './socialframe';
\`\`\`

2. **Load mockup data:**
\`\`\`tsx
import linkedInPost1 from './${mockups.find(m => m.type === 'linkedin-post')?.filename || 'linkedin-post-1'}.json';
import xPost1 from './${mockups.find(m => m.type === 'x-post')?.filename || 'x-post-1'}.json';
\`\`\`

3. **Render the mockups:**
\`\`\`tsx
function SocialPreview() {
  return (
    <div className="space-y-8 p-6">
      <LinkedInPost {...linkedInPost1} />
      <XPost {...xPost1} />
    </div>
  );
}
\`\`\`

## Export as Images

Use the built-in SVG export functions:

\`\`\`tsx
import { renderLinkedInSVG, renderXSvg } from './socialframe';

// Generate LinkedIn post image
const linkedInSvg = await renderLinkedInSVG(linkedInPost1, {
  width: 800,
  height: 600,
  fontPath: './Inter-Regular.ttf'
});

// Generate Twitter post image  
const xSvg = await renderXSvg(xPost1, {
  width: 800,
  height: 600,
  fontPath: './Inter-Regular.ttf'
});
\`\`\`

## Profile Configuration Used
- **Name:** ${this.config.profile.name}
- **Avatar:** ${this.config.profile.avatarUrl}
${this.config.profile.headline ? `- **Headline:** ${this.config.profile.headline}` : ''}
${this.config.profile.handle ? `- **Handle:** @${this.config.profile.handle}` : ''}
- **Verified:** ${this.config.profile.verified ? 'Yes' : 'No'}

---
*Generated: ${new Date().toISOString()}*
`;
    
    const instructionsPath = path.join(outputDir, 'mockup-usage-instructions.md');
    await fs.writeFile(instructionsPath, instructionsContent);
    savedPaths.push(instructionsPath);
    
    return savedPaths;
  }
}

// Default configuration for testing
export const DEFAULT_MOCKUP_CONFIG: MockupConfig = {
  profile: {
    name: "Alex Morgan",
    avatarUrl: "https://images.unsplash.com/photo-1544723795-3fb6469f5b39?q=80&w=256&auto=format&fit=crop",
    headline: "VP, Marketing at Acme Co.",
    handle: "alexmorgan",
    verified: false
  },
  engagement: {
    likes: { min: 50, max: 500 },
    comments: { min: 5, max: 50 },
    reposts: { min: 2, max: 25 },
    views: { min: 1000, max: 10000 }
  },
  defaultMedia: []
};

// Export factory function
export function createSocialMockupGenerator(config: MockupConfig = DEFAULT_MOCKUP_CONFIG): SocialMockupGenerator {
  return new SocialMockupGenerator(config);
}