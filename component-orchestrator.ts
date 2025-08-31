/**
 * Component Orchestration System
 * Implements AI→Props→Component pipeline for reliable video generation
 */

import { z } from 'zod';

// Import schemas from our components
// Note: Using dynamic imports to avoid module resolution issues during testing
let StatBlockPropsSchema: any, getStatBlockDefaults: any;
let AnimatedTextPropsSchema: any, getAnimatedTextDefaults: any;
let CalloutBoxPropsSchema: any, getCalloutBoxDefaults: any;

// Dynamic schema loading
async function loadSchemas() {
  try {
    const statBlockModule = await import('./remotion/ui-components/components/StatBlock.schema.ts');
    StatBlockPropsSchema = statBlockModule.StatBlockPropsSchema;
    getStatBlockDefaults = statBlockModule.getStatBlockDefaults;
    
    const animatedTextModule = await import('./remotion/ui-components/components/AnimatedText.schema.ts');
    AnimatedTextPropsSchema = animatedTextModule.AnimatedTextPropsSchema;
    getAnimatedTextDefaults = animatedTextModule.getAnimatedTextDefaults;
    
    const calloutBoxModule = await import('./remotion/ui-components/components/CalloutBox.schema.ts');
    CalloutBoxPropsSchema = calloutBoxModule.CalloutBoxPropsSchema;
    getCalloutBoxDefaults = calloutBoxModule.getCalloutBoxDefaults;
    
    return true;
  } catch (error) {
    console.warn('Schema loading failed, using fallback validation:', error);
    return false;
  }
}

// Component registry - populated dynamically after schema loading
let ComponentRegistry: any = {};

// Initialize component registry
function initializeRegistry() {
  ComponentRegistry = {
    StatBlock: {
      schema: StatBlockPropsSchema,
      getDefaults: getStatBlockDefaults,
      importPath: './remotion/ui-components/components/StatBlock.tsx',
    },
    AnimatedText: {
      schema: AnimatedTextPropsSchema,
      getDefaults: getAnimatedTextDefaults,
      importPath: './remotion/ui-components/components/AnimatedText.tsx',
    },
    CalloutBox: {
      schema: CalloutBoxPropsSchema,
      getDefaults: getCalloutBoxDefaults,
      importPath: './remotion/ui-components/components/CalloutBox.tsx',
    },
  };
}

type ComponentName = keyof typeof ComponentRegistry;

// AI Response structure for component selection + props
const ComponentSelectionSchema = z.object({
  componentName: z.enum(['StatBlock', 'AnimatedText', 'CalloutBox']),
  props: z.any(), // Will be validated against component-specific schema
  reasoning: z.string().optional(), // Why this component was chosen
});

export interface SceneComponentSpec {
  componentName: ComponentName;
  props: any;
  validated: boolean;
  reasoning?: string;
}

export class ComponentOrchestrator {
  private initialized = false;
  
  /**
   * Initialize schemas - must be called before orchestration
   */
  private async ensureInitialized() {
    if (!this.initialized) {
      await loadSchemas();
      initializeRegistry();
      this.initialized = true;
    }
  }
  
  /**
   * Main orchestration method: Scene + Video specs → Component + Props
   * Replaces the old generateSceneComponent that returned TSX code
   */
  async orchestrateComponent(
    scene: any,
    videoSpecs: any,
    componentPlan?: any
  ): Promise<SceneComponentSpec> {
    
    // Ensure schemas are loaded
    await this.ensureInitialized();
    
    // Step 1: AI selects component and generates props
    const aiResponse = await this.selectComponentAndGenerateProps(scene, videoSpecs, componentPlan);
    
    // Step 2: Validate props against component schema
    const validatedSpec = this.validateComponentProps(aiResponse);
    
    console.log(`✅ Orchestrated ${validatedSpec.componentName} for scene ${scene.sceneNumber}`);
    return validatedSpec;
  }
  
  /**
   * Step 1: Ask AI to select component and generate props (not code)
   */
  private async selectComponentAndGenerateProps(
    scene: any,
    videoSpecs: any,
    componentPlan?: any
  ): Promise<any> {
    
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    
    const componentOptions = Object.keys(ComponentRegistry).map(name => ({
      name,
      description: this.getComponentDescription(name as ComponentName)
    }));
    
    const prompt = `You are a component orchestrator for animated video generation.
    
SCENE DETAILS:
${JSON.stringify(scene, null, 2)}

VIDEO SPECS:
${JSON.stringify(videoSpecs, null, 2)}

AVAILABLE COMPONENTS:
${componentOptions.map(c => `- **${c.name}**: ${c.description}`).join('\n')}

YOUR TASK:
1. Choose the BEST component for this scene based on scene.visualType and content
2. Generate JSON props that will make this component look professional and engaging
3. Consider the video format (${videoSpecs.format}) and duration (${scene.duration}s)

COMPONENT SELECTION RULES:
- visualType "statistic" → StatBlock (for KPIs, metrics, numbers)
- visualType "text-animation" → AnimatedText (for headlines, titles)
- visualType "chart" → StatBlock (can display chart-like data)
- Anything else → CalloutBox (for highlighted content)

CRITICAL: Return ONLY a JSON object in this format:
{
  "componentName": "StatBlock" | "AnimatedText" | "CalloutBox",
  "props": {
    // Component-specific props object
  },
  "reasoning": "Brief explanation of choice"
}

Focus on creating engaging, mobile-optimized props that will work well for ${videoSpecs.format} format.`;
    
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    
    const result = response.choices[0]?.message?.content?.trim();
    if (!result) throw new Error('No component selection generated');
    
    try {
      const parsed = JSON.parse(result);
      
      // Validate basic structure
      const validated = ComponentSelectionSchema.parse(parsed);
      return validated;
      
    } catch (error) {
      console.warn('AI response parsing failed, using fallback:', error);
      return this.getFallbackSelection(scene, videoSpecs);
    }
  }
  
  /**
   * Step 2: Validate AI-generated props against component schema
   */
  private validateComponentProps(aiResponse: any): SceneComponentSpec {
    const { componentName, props, reasoning } = aiResponse;
    
    if (!(componentName in ComponentRegistry)) {
      throw new Error(`Unknown component: ${componentName}`);
    }
    
    const component = ComponentRegistry[componentName as ComponentName];
    
    try {
      // Validate props against component schema
      const validatedProps = component.schema.parse(props);
      
      return {
        componentName: componentName as ComponentName,
        props: validatedProps,
        validated: true,
        reasoning,
      };
      
    } catch (error) {
      console.warn(`Props validation failed for ${componentName}:`, error);
      
      // Fallback to default props with some AI content preserved
      const defaults = component.getDefaults();
      const fallbackProps = this.mergeWithDefaults(props, defaults);
      
      return {
        componentName: componentName as ComponentName,
        props: fallbackProps,
        validated: false,
        reasoning: `Fallback used due to validation error: ${error instanceof Error ? error.message : 'Unknown error'}`,
      };
    }
  }
  
  /**
   * Generate TSX code that uses the orchestrated component
   */
  generateComponentTSX(spec: SceneComponentSpec, scene: any, videoSpecs: any): string {
    const { componentName, props } = spec;
    
    const propsString = JSON.stringify(props, null, 2);
    
    // Use relative path from output directory back to project root
    const importPath = `../../${ComponentRegistry[componentName].importPath}`;
    
    return `import React from 'react';
import { ${componentName} } from '${importPath}';
import { useVideoConfig } from 'remotion';

export const Scene${scene.sceneNumber}Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = ${propsString};
  
  return (
    <div style={{
      width: ${videoSpecs.dimensions.width},
      height: ${videoSpecs.dimensions.height},
      backgroundColor: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
    }}>
      <${componentName} {...props} />
    </div>
  );
};

export default Scene${scene.sceneNumber}Component;`;
  }
  
  /**
   * Helper: Get component description for AI selection
   */
  private getComponentDescription(componentName: ComponentName): string {
    const descriptions = {
      StatBlock: 'Displays statistics, KPIs, and metrics with animated counters and professional layout',
      AnimatedText: 'Animated text with typewriter, fade, slide, scale, and reveal effects',
      CalloutBox: 'Highlighted content boxes with icons, variants (success/warning/error), and animations',
    };
    
    return descriptions[componentName];
  }
  
  /**
   * Fallback selection when AI fails - with mobile-optimized props
   */
  private getFallbackSelection(scene: any, videoSpecs: any): any {
    let componentName: ComponentName;
    let props: any;
    
    // Extract key info from scene content
    const isVertical = videoSpecs.format === 'vertical';
    const sceneContent = scene.content || '';
    
    // Simple rule-based fallback
    switch (scene.visualType) {
      case 'statistic':
        componentName = 'StatBlock';
        // Extract percentage or number from content with better regex
        const statMatch = sceneContent.match(/(\d+(?:\.\d+)?%?)/);
        const statValue = statMatch ? statMatch[1] : '20%';
        
        // Extract description context from the content
        let description = 'Productivity Change';
        if (sceneContent.toLowerCase().includes('drop')) {
          description = 'Drop in Productivity';
        } else if (sceneContent.toLowerCase().includes('increase') || sceneContent.toLowerCase().includes('rise')) {
          description = 'Productivity Increase';
        } else if (sceneContent.toLowerCase().includes('productivity')) {
          description = 'Productivity Impact';
        }
        
        props = {
          stats: [{
            label: description,
            value: statValue.replace('%', ''),
            format: statValue.includes('%') ? 'percentage' : 'number'
          }],
          title: '',  // No title needed for single stat
          columns: 1,
          width: isVertical ? 800 : 700,
          height: isVertical ? 400 : 300,
          animationType: 'counter',
          backgroundColor: '#ffffff',
          borderColor: '#e5e7eb',
          showBorder: true,
          titleColor: '#1f2937'
        };
        break;
        
      case 'text-animation':
        componentName = 'AnimatedText';
        props = {
          text: sceneContent.substring(0, 120) || 'Key Business Insight',
          animationType: 'fade',
          fontSize: isVertical ? 72 : 48,
          fontWeight: 'bold',
          color: '#1f2937',
          textAlign: 'center'
        };
        break;
        
      default:
        componentName = 'CalloutBox';
        // Extract a meaningful title from the scene purpose or content
        let title = 'Key Point';
        if (scene.purpose?.includes('insight')) {
          title = 'Key Insight';
        } else if (scene.purpose?.includes('tip')) {
          title = 'Pro Tip';
        } else if (scene.purpose?.includes('action')) {
          title = 'Take Action';
        } else if (scene.purpose?.includes('misconception')) {
          title = 'Common Myth';
        }
        
        props = {
          children: sceneContent.substring(0, 150) || 'Important insight about productivity',
          title: title,
          variant: 'info',
          width: isVertical ? 800 : 600,
          height: isVertical ? 200 : 180,
          padding: 24,
          borderRadius: 12,
          titleSize: 20,
          backgroundColor: '#f8fafc',
          borderColor: '#e2e8f0',
          showBorder: true
        };
    }
    
    return {
      componentName,
      props,
      reasoning: 'Mobile-optimized fallback selection',
    };
  }
  
  /**
   * Merge AI props with defaults, preserving valid values and extracting usable content
   */
  private mergeWithDefaults(aiProps: any, defaults: any): any {
    const merged = { ...defaults };
    
    // Safely merge non-null, defined values from AI
    for (const [key, value] of Object.entries(aiProps || {})) {
      if (value !== null && value !== undefined) {
        merged[key] = value;
      }
    }
    
    // Special handling for StatBlock: extract content from various invalid AI prop patterns
    if (merged.stats && Array.isArray(merged.stats)) {
      // Pattern 1: "statistics" array (previous pattern)
      if (aiProps?.statistics && Array.isArray(aiProps.statistics)) {
        const firstStat = aiProps.statistics[0];
        if (firstStat?.value && firstStat?.description) {
          const match = firstStat.value.match(/(\d+(?:\.\d+)?%?)/);
          if (match) {
            merged.stats = [{
              label: firstStat.description || 'Remote Teams',
              value: match[1].replace('%', ''),
              format: match[1].includes('%') ? 'percentage' : 'number'
            }];
          }
        }
      }
      
      // Pattern 2: Direct "statistic" and "label" props
      else if (aiProps?.statistic && aiProps?.label) {
        const match = aiProps.statistic.match(/(\d+(?:\.\d+)?%?)/);
        if (match) {
          merged.stats = [{
            label: aiProps.label,
            value: match[1].replace('%', ''),
            format: match[1].includes('%') ? 'percentage' : 'number'
          }];
        }
      }
      
      // Pattern 3: "statisticValue" and "statisticLabel" props (latest pattern)
      else if (aiProps?.statisticValue && aiProps?.statisticLabel) {
        const match = aiProps.statisticValue.match(/(\d+(?:\.\d+)?%?)/);
        if (match) {
          merged.stats = [{
            label: aiProps.statisticLabel,
            value: match[1].replace('%', ''),
            format: match[1].includes('%') ? 'percentage' : 'number'
          }];
        }
      }
    }
    
    return merged;
  }
}

// Export singleton
export const componentOrchestrator = new ComponentOrchestrator();
