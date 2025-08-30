#!/usr/bin/env tsx

/**
 * Universal Content Insights Extractor
 * Single source of truth for all content analysis
 * All pipelines consume from this shared insights object
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { llmClient } from '../../src/lib/llm-client.js';
import { buildPrompt, SCHEMAS } from '../../src/lib/prompt-templates.js';

dotenv.config();

export interface UniversalInsights {
  // Core content analysis
  mainThesis: string;
  executiveSummary: string;
  targetAudience: string;
  
  // Key insights and supporting data
  keyInsights: Array<{
    insight: string;
    explanation: string;
    importance: 'high' | 'medium' | 'low';
  }>;
  
  supportingData: Array<{
    statistic: string;
    context: string;
    source?: string;
    visualPotential: 'chart' | 'infographic' | 'callout' | 'text';
  }>;
  
  // Content hooks and angles
  hooks: Array<{
    hook: string;
    type: 'problem' | 'statistic' | 'story' | 'question' | 'contrarian';
    strength: 'strong' | 'medium' | 'weak';
  }>;
  
  // Actionable takeaways
  actionableItems: Array<{
    action: string;
    difficulty: 'easy' | 'moderate' | 'complex';
    timeframe: 'immediate' | 'short-term' | 'long-term';
  }>;
  
  // SEO and discoverability
  seoKeywords: {
    primary: string[];
    secondary: string[];
    longTail: string[];
  };
  
  // Content structure suggestions
  themes: Array<{
    theme: string;
    subTopics: string[];
    contentDepth: 'surface' | 'detailed' | 'comprehensive';
  }>;
  
  // Call to action options
  callToActionOptions: Array<{
    cta: string;
    type: 'engagement' | 'conversion' | 'education' | 'community';
    urgency: 'high' | 'medium' | 'low';
  }>;
  
  // Metadata
  contentType: string;
  complexity: 'beginner' | 'intermediate' | 'advanced';
  estimatedReadTime: number;
  wordCount: number;
  
  // Format-specific guidance
  formatSuggestions: {
    carousel: {
      idealSlideCount: number;
      visualElements: string[];
      keySlideTypes: string[];
    };
    blog: {
      suggestedWordCount: number;
      headingStructure: string[];
      contentSections: string[];
    };
    infographic: {
      layoutType: 'vertical' | 'horizontal' | 'grid';
      dataVisualization: string[];
      hierarchyLevels: number;
    };
  };
}

export class UniversalInsightsExtractor {
  
  /**
   * Extract comprehensive insights that serve as single source of truth
   */
  async extract(originalContent: string, outputDir?: string): Promise<UniversalInsights> {
    console.log('🧠 Universal Insights Extraction Starting...');
    
    // Check cache first
    if (outputDir) {
      const cachePath = path.join(outputDir, 'universal-insights.json');
      try {
        const cached = await fs.readFile(cachePath, 'utf-8');
        const data = JSON.parse(cached);
        
        // Check if cache is fresh (1 hour TTL)
        const cacheAge = Date.now() - new Date(data.extractedAt).getTime();
        if (cacheAge < 3600000) {
          console.log('💾 Using cached universal insights');
          const { extractedAt, model, ...insights } = data;
          return insights as UniversalInsights;
        }
      } catch (error) {
        // Cache miss is normal
      }
    }
    
    const prompt = buildPrompt('EXTRACT_INSIGHTS', originalContent);

    const response = await llmClient.chatCompletion({
      model: 'gpt-4.1-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      maxTokens: 500,
      contentType: 'insights',
      taskType: 'extraction',
      responseFormat: { type: 'json_object' },
      cache: true,
      cacheTTL: 3600
    });

    const result = response.choices[0]?.message?.content?.trim();
    if (!result) throw new Error('No universal insights extracted');

    const cleanResult = result.replace(/^```json\n?/, '').replace(/\n?```$/, '');
    const insights: UniversalInsights = JSON.parse(cleanResult);
    
    // Save insights if output directory provided
    if (outputDir) {
      await fs.mkdir(outputDir, { recursive: true });
      const insightsPath = path.join(outputDir, 'universal-insights.json');
      await fs.writeFile(
        insightsPath, 
        JSON.stringify({
          ...insights,
          extractedAt: new Date().toISOString(),
          model: 'gpt-4.1-mini'
        }, null, 2)
      );
      console.log(`💾 Saved universal insights: ${insightsPath}`);
    }
    
    console.log('✅ Universal insights extraction complete');
    return insights;
  }
  
  /**
   * Load existing insights from file
   */
  async load(insightsPath: string): Promise<UniversalInsights> {
    const content = await fs.readFile(insightsPath, 'utf-8');
    const data = JSON.parse(content);
    
    // Remove metadata fields that aren't part of UniversalInsights interface
    const { extractedAt, model, ...insights } = data;
    return insights as UniversalInsights;
  }
}

// Export singleton
export const universalInsightsExtractor = new UniversalInsightsExtractor();

// CLI usage
export async function runUniversalInsightsExtraction(
  contentPath: string,
  outputDir: string
): Promise<UniversalInsights> {
  const content = await fs.readFile(contentPath, 'utf-8');
  return await universalInsightsExtractor.extract(content, outputDir);
}

// CLI entry point
if (typeof process !== 'undefined' && import.meta.url === `file://${process.argv[1]}`) {
  const contentPath = process.argv[2];
  const outputDir = process.argv[3] || './output';
  
  if (!contentPath) {
    console.error('Usage: tsx shared/insights.ts <content-file> [output-dir]');
    process.exit(1);
  }
  
  runUniversalInsightsExtraction(contentPath, outputDir)
    .then((insights) => {
      console.log('\n🎉 Universal Insights Extraction Complete:');
      console.log(`   Main Thesis: ${insights.mainThesis}`);
      console.log(`   Key Insights: ${insights.keyInsights.length}`);
      console.log(`   Supporting Data: ${insights.supportingData.length}`);
      console.log(`   Hooks: ${insights.hooks.length}`);
    })
    .catch(console.error);
}