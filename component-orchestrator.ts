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
   * Public initializer for tools that only need generateComponentTSX.
   */
  async init() {
    await this.ensureInitialized();
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
    const validatedSpec = this.validateComponentProps(aiResponse, scene, videoSpecs);
    
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
      apiKey: process.env.OPENAI_API_KEY || (process.env as any).openai_api_key,
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
    if (!result) {
      throw new Error(JSON.stringify({
        code: 'AI_NO_COMPONENT_SELECTION',
        message: 'AI did not return a component selection.',
        sceneNumber: scene?.sceneNumber,
      }));
    }

    try {
      const parsed = JSON.parse(result);
      const validated = ComponentSelectionSchema.parse(parsed);
      return validated;
    } catch (error: any) {
      throw new Error(JSON.stringify({
        code: 'AI_COMPONENT_SELECTION_PARSE_ERROR',
        message: 'AI component selection was not valid JSON or did not match schema.',
        sceneNumber: scene?.sceneNumber,
        details: error?.message || String(error)
      }));
    }
  }
  
  /**
   * Step 2: Validate AI-generated props against component schema
   */
  private validateComponentProps(aiResponse: any, scene: any, videoSpecs: any): SceneComponentSpec {
    const { componentName, props, reasoning } = aiResponse;
    
    if (!(componentName in ComponentRegistry)) {
      throw new Error(`Unknown component: ${componentName}`);
    }
    
    const component = ComponentRegistry[componentName as ComponentName];
    
    try {
      const validatedProps = component.schema.parse(props);
      return {
        componentName: componentName as ComponentName,
        props: validatedProps,
        validated: true,
        reasoning,
      };
    } catch (error: any) {
      throw new Error(JSON.stringify({
        code: 'COMPONENT_PROPS_VALIDATION_FAILED',
        message: `Props did not conform to ${String(componentName)} schema.`,
        sceneNumber: scene?.sceneNumber,
        componentName,
        details: error?.issues || error?.message || String(error),
      }));
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
    const animatedTextImport = `../../${ComponentRegistry['AnimatedText'].importPath}`;
    
    return `import React from 'react';
import { ${componentName} } from '${importPath}';
import { AnimatedText } from '${animatedTextImport}';
import { useVideoConfig } from 'remotion';

export const Scene${scene.sceneNumber}Component: React.FC = () => {
  const { fps } = useVideoConfig();
  
  const props = ${propsString};
  const headline = ${JSON.stringify((scene?.content || scene?.purpose || '').toString().trim().slice(0, 80))};
  const isVertical = ${JSON.stringify(videoSpecs.format === 'vertical')};
  const headlineSize = isVertical ? 72 : 56;
  
  return (
    <div style={{
      width: ${videoSpecs.dimensions.width},
      height: ${videoSpecs.dimensions.height},
      backgroundColor: '#ffffff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start',
      padding: 40,
      boxSizing: 'border-box',
      gap: 24,
    }}>
      {headline && (
        <AnimatedText
          text={headline}
          animationType="fade"
          fontSize={headlineSize}
          fontWeight="bold"
          textAlign="center"
          color="#111827"
          durationInFrames={90}
        />
      )}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center', width: '100%' }}>
        <${componentName} {...props} />
      </div>
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
  
  // Note: No automatic fallbacks. Invalid AI output must be fixed at the source.
}

// Export singleton
export const componentOrchestrator = new ComponentOrchestrator();
