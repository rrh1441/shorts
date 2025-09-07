/**
 * Component Orchestration System
 * Implements AI→Props→Component pipeline for reliable video generation
 */

import { z } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

// Import schemas for patterns and underlying components
// Note: Using dynamic imports to avoid module resolution issues during testing
let StatBlockPropsSchema: any, getStatBlockDefaults: any;
let AnimatedTextPropsSchema: any, getAnimatedTextDefaults: any;
let CalloutBoxPropsSchema: any, getCalloutBoxDefaults: any;
let StatHeroPropsSchema: any, getStatHeroDefaults: any;
let TitleSubheadPropsSchema: any, getTitleSubheadDefaults: any;
let CalloutPatternPropsSchema: any, getCalloutPatternDefaults: any;
let ChartRevealPropsSchema: any, getChartRevealDefaults: any;
let QuotePullPropsSchema: any, getQuotePullDefaults: any;
let StatRowPropsSchema: any, getStatRowDefaults: any;
let TimelinePropsSchema: any, getTimelineDefaults: any;

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

    const statHeroModule = await import('./remotion/patterns/StatHero.schema.ts');
    StatHeroPropsSchema = statHeroModule.StatHeroPropsSchema;
    getStatHeroDefaults = statHeroModule.getStatHeroDefaults;

    const titleSubheadModule = await import('./remotion/patterns/TitleSubhead.schema.ts');
    TitleSubheadPropsSchema = titleSubheadModule.TitleSubheadPropsSchema;
    getTitleSubheadDefaults = titleSubheadModule.getTitleSubheadDefaults;

    const calloutPatternModule = await import('./remotion/patterns/CalloutPattern.schema.ts');
    CalloutPatternPropsSchema = calloutPatternModule.CalloutPatternPropsSchema;
    getCalloutPatternDefaults = calloutPatternModule.getCalloutPatternDefaults;

    const chartRevealModule = await import('./remotion/patterns/ChartReveal.schema.ts');
    ChartRevealPropsSchema = chartRevealModule.ChartRevealPropsSchema;
    getChartRevealDefaults = chartRevealModule.getChartRevealDefaults;

    const quotePullModule = await import('./remotion/patterns/QuotePull.schema.ts');
    QuotePullPropsSchema = quotePullModule.QuotePullPropsSchema;
    getQuotePullDefaults = quotePullModule.getQuotePullDefaults;

    const statRowModule = await import('./remotion/patterns/StatRow.schema.ts');
    StatRowPropsSchema = statRowModule.StatRowPropsSchema;
    getStatRowDefaults = statRowModule.getStatRowDefaults;

    const timelineModule = await import('./remotion/patterns/Timeline.schema.ts');
    TimelinePropsSchema = timelineModule.TimelinePropsSchema;
    getTimelineDefaults = timelineModule.getTimelineDefaults;
    
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
    StatHero: {
      schema: StatHeroPropsSchema,
      getDefaults: getStatHeroDefaults,
      importPath: './remotion/patterns/StatHero.tsx',
    },
    TitleSubhead: {
      schema: TitleSubheadPropsSchema,
      getDefaults: getTitleSubheadDefaults,
      importPath: './remotion/patterns/TitleSubhead.tsx',
    },
    CalloutPattern: {
      schema: CalloutPatternPropsSchema,
      getDefaults: getCalloutPatternDefaults,
      importPath: './remotion/patterns/CalloutPattern.tsx',
    },
    ChartReveal: {
      schema: ChartRevealPropsSchema,
      getDefaults: getChartRevealDefaults,
      importPath: './remotion/patterns/ChartReveal.tsx',
    },
    QuotePull: {
      schema: QuotePullPropsSchema,
      getDefaults: getQuotePullDefaults,
      importPath: './remotion/patterns/QuotePull.tsx',
    },
    StatRow: {
      schema: StatRowPropsSchema,
      getDefaults: getStatRowDefaults,
      importPath: './remotion/patterns/StatRow.tsx',
    },
    Timeline: {
      schema: TimelinePropsSchema,
      getDefaults: getTimelineDefaults,
      importPath: './remotion/patterns/Timeline.tsx',
    },
  };
}

type ComponentName = keyof typeof ComponentRegistry;

// AI Response structure for component selection + props
const ComponentSelectionSchema = z.object({
  componentName: z.enum(['StatHero', 'TitleSubhead', 'CalloutPattern', 'ChartReveal', 'QuotePull', 'StatRow', 'Timeline']),
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
   * Deterministic recommendation based on scene.visualType without any AI calls.
   * Used for planning/storyboarding so choices are reviewable before render.
   */
  recommendComponent(scene: any): ComponentName {
    const vt = String(scene?.visualType || '').toLowerCase();
    if (vt === 'statistic') return 'StatHero' as ComponentName;
    if (vt === 'chart') return 'ChartReveal' as ComponentName;
    if (vt === 'text-animation' || vt === 'title' || vt === 'headline') return 'TitleSubhead' as ComponentName;
    return 'CalloutPattern' as ComponentName;
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
    // Step 1: Select component (deterministic mapping, AI backstop only if ambiguous)
    const selectedComponent = await this.selectComponent(scene, videoSpecs, componentPlan);
    // Step 2: Generate props (deterministic mapper by default in NO-AI mode)
    const preferMapper = String(process.env.ORCHESTRATOR_USE_MAPPER || process.env.NO_AI || '').toLowerCase();
    let candidate: any;
    if (preferMapper && ['1','true','yes','mapper'].includes(preferMapper)) {
      const mapped = await this.generatePropsDeterministic(selectedComponent, scene, videoSpecs);
      candidate = { componentName: selectedComponent, props: mapped, reasoning: 'deterministic-mapper' };
    } else {
      const aiResponse = await this.generatePropsForSelectedComponent(selectedComponent, scene, videoSpecs);
      candidate = aiResponse;
    }
    // Step 3: Validate props against component schema
    const validatedSpec = this.validateComponentProps(candidate, scene, videoSpecs);
    
    console.log(`✅ Orchestrated ${validatedSpec.componentName} for scene ${scene.sceneNumber}`);
    return validatedSpec;
  }

  /**
   * Deterministic props from scene content, no AI.
   */
  private async generatePropsDeterministic(
    componentName: ComponentName,
    scene: any,
    videoSpecs: any
  ): Promise<any> {
    await this.ensureInitialized();
    const fmt = (videoSpecs?.format || 'vertical') as 'vertical' | 'square' | 'horizontal';
    const text: string = String(scene?.content || '').trim();
    const vo: string = String(scene?.voiceover || '').trim();
    const oneSentence = (s: string) => {
      const m = s.match(/^[^.!?\n]{1,200}[.!?]?/);
      return (m ? m[0] : s).trim();
    };
    const clamp = (s: string, n: number) => (s.length > n ? s.slice(0, n - 1) + '…' : s);

    const build = (props: any, schema: any) => schema.parse({ format: fmt, ...props });

    if (componentName === 'TitleSubhead') {
      const title = clamp(text || vo || 'Title', 120);
      const subhead = vo ? clamp(oneSentence(vo), 160) : undefined;
      return build({ title, subhead }, ComponentRegistry.TitleSubhead.schema);
    }

    if (componentName === 'QuotePull') {
      const quote = clamp(text || vo || 'Quote', 200);
      return build({ quote }, ComponentRegistry.QuotePull.schema);
    }

    if (componentName === 'StatHero') {
      const num = (text.match(/(\d+[\d.,]*\s?%|\d+(?:\.\d+)?\s?x|\d+(?:\.\d+)?\s?(?:times|weeks?|days?|years?))/i) || [])[0]
        || (vo.match(/(\d+[\d.,]*\s?%|\d+(?:\.\d+)?\s?x|\d+(?:\.\d+)?\s?(?:times|weeks?|days?|years?))/i) || [])[0]
        || '—';
      const cleaned = num.replace(/\s+times/i, '×').replace(/\s+/g, '');
      const remainder = text.replace(num, '').trim();
      const label = clamp(remainder || 'Metric', 40);
      const headline = clamp(oneSentence(vo || text || 'Key Result'), 120);
      return build({ headline, statLabel: label || 'Metric', statValue: cleaned }, ComponentRegistry.StatHero.schema);
    }

    if (componentName === 'StatRow') {
      const afterColon = text.split(':').slice(1).join(':').trim();
      const raw = afterColon || text;
      const parts = raw
        .split(/,|\band\b|\u2014|\n/gi)
        .map((s: string) => s.replace(/^[\s\-–•]+/, '').trim())
        .filter(Boolean)
        .slice(0, 4);
      const values = parts.length >= 2 ? parts : ['Energy', 'Intelligence', 'Action'];
      const stats = values.map((v: string, i: number) => ({ label: `Pillar ${i + 1}`, value: clamp(v, 16) }));
      const headline = clamp(oneSentence(text), 120);
      return build({ headline, stats }, ComponentRegistry.StatRow.schema);
    }

    if (componentName === 'ChartReveal') {
      const pairs: Array<{ label: string; value: number }> = [];
      const rex = /([A-Za-z][A-Za-z0-9\-\s]{0,12})\s+(\d+(?:\.\d+)?)/g;
      let m: RegExpExecArray | null;
      while ((m = rex.exec(text)) && pairs.length < 6) {
        pairs.push({ label: m[1].trim(), value: Number(m[2]) });
      }
      const data = pairs.length >= 2 ? pairs : [
        { label: 'A', value: 10 },
        { label: 'B', value: 14 },
        { label: 'C', value: 18 },
      ];
      const headline = clamp(oneSentence(text), 120) || 'Key Trend';
      return build({ headline, data, showValues: true }, ComponentRegistry.ChartReveal.schema);
    }

    if (componentName === 'CalloutPattern') {
      const title = clamp(text.split(/[.!?]/)[0] || text, 60);
      const body = clamp(vo || text, 200);
      return build({ headline: undefined, title, body, variant: 'default' }, ComponentRegistry.CalloutPattern.schema);
    }

    // Fallback to TitleSubhead
    const title = clamp(text || vo || 'Title', 120);
    const subhead = vo ? clamp(oneSentence(vo), 160) : undefined;
    return build({ title, subhead }, ComponentRegistry.TitleSubhead.schema);
  }
  
  /**
   * Step 1: Ask AI to select component and generate props (not code)
   */
  private async selectComponent(
    scene: any,
    videoSpecs: any,
    componentPlan?: any
  ): Promise<ComponentName> {
    // Honor storyboard recommendation if provided and valid
    const rec = scene?.recommendedComponent as string | undefined;
    if (rec && rec in ComponentRegistry) return rec as ComponentName;
    const vt = String(scene?.visualType || '').toLowerCase();
    if (vt === 'statistic') return 'StatHero';
    if (vt === 'chart') return 'ChartReveal';
    if (vt === 'text-animation' || vt === 'title' || vt === 'headline') return 'TitleSubhead';
    if (vt === 'quote') return 'QuotePull';
    if (vt === 'list' || vt === 'comparison') return 'StatRow';
    if (vt === 'timeline' || /timeline|sequence|process/i.test(String(scene?.purpose||''))) return 'Timeline';
    // If ambiguous, ask AI for a choice among known components
    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || (process.env as any).openai_api_key,
    });
    const options = Object.keys(ComponentRegistry) as ComponentName[];
    const prompt = `Pick one pattern for this scene. Return only JSON: { "componentName": <one of ${JSON.stringify(options)}> }\nScene: ${JSON.stringify(scene)}\nFormat: ${JSON.stringify(videoSpecs)}\nRules: statistic→StatHero, chart→ChartReveal, text→TitleSubhead, otherwise CalloutPattern.`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    const content = response.choices[0]?.message?.content?.trim() || '';
    const parsed = JSON.parse(content);
    if (!options.includes(parsed.componentName)) {
      throw new Error(JSON.stringify({ code: 'AI_COMPONENT_SELECTION_INVALID', message: 'Invalid component choice', got: parsed.componentName }));
    }
    return parsed.componentName as ComponentName;
  }

  private async generatePropsForSelectedComponent(
    componentName: ComponentName,
    scene: any,
    videoSpecs: any
  ): Promise<any> {
    const component = ComponentRegistry[componentName];
    const schema = component?.schema;
    if (!schema) throw new Error(JSON.stringify({ code: 'SCHEMA_MISSING', message: `No schema for ${String(componentName)}` }));
    const jsonSchema = zodToJsonSchema(schema, `${String(componentName)}Props`);
    const defaults = component.getDefaults ? component.getDefaults() : {};

    // Fail-closed/No-AI mode for testing or offline runs
    const useDefaults = String(process.env.ORCHESTRATOR_USE_DEFAULTS || process.env.NO_AI || '').toLowerCase();
    if (useDefaults && ['1','true','yes','defaults'].includes(useDefaults)) {
      return { componentName, props: defaults, reasoning: 'defaults' };
    }

    const { OpenAI } = await import('openai');
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || (process.env as any).openai_api_key,
    });
    const prompt = `Generate ONLY JSON props that conform to this JSON Schema for pattern ${componentName}.\nReturn exactly: { "componentName": ${JSON.stringify(componentName)}, "props": <object matching schema> }\n\nJSON Schema:\n${JSON.stringify(jsonSchema, null, 2)}\n\nContext:\n- Scene: ${JSON.stringify(scene)}\n- Video specs: ${JSON.stringify(videoSpecs)}\n- Required: Use only allowed enum values exactly as shown. Use numbers for numeric fields.\n- Start from these defaults if helpful: ${JSON.stringify(defaults)}\n- ${videoSpecs.format} video; choose readable text and complete required fields.\n\nReturn ONLY valid JSON.`;
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' }
    });
    const content = response.choices[0]?.message?.content?.trim() || '';
    const parsed = JSON.parse(content);
    return ComponentSelectionSchema.parse(parsed);
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
    const normalizedProps = this.applyFormatPresets(componentName as ComponentName, props, videoSpecs);
    const propsString = JSON.stringify(normalizedProps, null, 2);
    
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

  private applyFormatPresets(componentName: ComponentName, props: any, videoSpecs: any) {
    const format = videoSpecs?.format || 'vertical';
    const clone = { ...(props || {}) };
    const set = (k: string, v: any) => { clone[k] = v; };
    // Always enforce pattern format to match the composition
    set('format', format);
    // Preset container sizes
    const sizes = {
      vertical: { width: 980, statHeight: 600, calloutHeight: 340, valueSize: 80, labelSize: 28, titleSize: 48 },
      square: { width: 980, statHeight: 520, calloutHeight: 300, valueSize: 72, labelSize: 26, titleSize: 44 },
      horizontal: { width: 1600, statHeight: 420, calloutHeight: 260, valueSize: 64, labelSize: 24, titleSize: 40 },
    } as const;
    const p = sizes[format as keyof typeof sizes] || sizes.vertical;

    if (componentName === 'StatBlock') {
      set('columns', Math.min(2, Math.max(1, Number(clone.columns || 1))));
      set('width', p.width);
      set('height', p.statHeight);
      // Readability
      set('valueFontSize', Math.max(p.valueSize, Number(clone.valueFontSize || 0)) || p.valueSize);
      set('labelFontSize', Math.max(p.labelSize, Number(clone.labelFontSize || 0)) || p.labelSize);
      set('titleSize', Math.max(p.titleSize, Number(clone.titleSize || 0)) || p.titleSize);
      // Coerce enums already validated; ensure allowed
      const allowed = ['fade', 'slide', 'scale', 'counter'];
      if (!allowed.includes(clone.animationType)) set('animationType', 'counter');
    }

    if (componentName === 'CalloutBox') {
      set('width', p.width);
      set('height', p.calloutHeight);
      set('padding', Math.max(28, Number(clone.padding || 0)) || 32);
      set('borderRadius', Math.max(12, Number(clone.borderRadius || 0)) || 16);
      set('titleSize', Math.max(p.titleSize - 8, Number(clone.titleSize || 0)) || (p.titleSize - 8));
      const allowed = ['fade', 'slide', 'scale', 'bounce'];
      if (!allowed.includes(clone.animationType)) set('animationType', 'slide');
    }

    if (componentName === 'AnimatedText') {
      set('format', undefined);
      set('textAlign', 'center');
      const minSize = format === 'vertical' ? 72 : format === 'square' ? 60 : 48;
      set('fontSize', Math.max(minSize, Number(clone.fontSize || 0)) || minSize);
      if (!clone.animationType || !['typewriter', 'fade', 'slide', 'scale', 'reveal'].includes(clone.animationType)) {
        set('animationType', 'fade');
      }
      if (!clone.direction || !['left', 'right', 'up', 'down'].includes(clone.direction)) {
        set('direction', 'up');
      }
      set('durationInFrames', Math.max(90, Number(clone.durationInFrames || 0)) || 120);
    }

    // Pattern-specific minor guards (optional)
    if (componentName === 'ChartReveal') {
      // Ensure minimal dataset
      if (!Array.isArray(clone.data) || clone.data.length < 2) {
        set('data', [
          { label: 'A', value: 10 },
          { label: 'B', value: 14 },
          { label: 'C', value: 18 },
        ]);
      }
    }

    return clone;
  }
  
  /**
   * Helper: Get component description for AI selection
   */
  private getComponentDescription(componentName: ComponentName): string {
    const descriptions = {
      StatHero: 'Headline + prominent metric card; great for KPI hooks',
      TitleSubhead: 'Large title with optional subhead; ideal for intros and CTAs',
      CalloutPattern: 'Framed callout block with title + body; use for tips/insights',
      ChartReveal: 'Headline + bar chart reveal; use for trend comparisons',
    } as Record<string, string>;
    
    return descriptions[componentName];
  }
  
  // Note: No automatic fallbacks. Invalid AI output must be fixed at the source.
}

// Export singleton
export const componentOrchestrator = new ComponentOrchestrator();
