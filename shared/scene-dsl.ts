import { z } from 'zod';

// Scene roles from PRD
export const SceneRoleSchema = z.enum([
  'HOOK', 'PROBLEM', 'TURN', 'APPROACH', 'PROCESS',
  'PROOF', 'CASE', 'QUOTE', 'CTA', 'OUTCOME', 'BACKSTORY', 'RESULT'
]);

// Voiceover with timing cues
export const VoiceoverSchema = z.object({
  text: z.string(),
  cues: z.array(z.number()) // ms offsets for sentence starts
});

// Visual elements (video primitives only)
export const ElementSchema = z.discriminatedUnion('kind', [
  z.object({
    kind: z.literal('TEXT'),
    role: z.enum(['title', 'subtitle', 'body', 'caption', 'kicker']),
    text: z.string()
  }),
  z.object({
    kind: z.literal('MEDIA'),
    src: z.string(),
    fit: z.enum(['cover', 'contain']).optional(),
    focalPoint: z.object({ x: z.number(), y: z.number() }).optional(),
    mask: z.enum(['rounded', 'device', 'circle', 'none']).optional()
  }),
  z.object({
    kind: z.literal('SHAPE'),
    shape: z.enum(['blob', 'bar', 'ring', 'underline']),
    seed: z.number().optional(),
    opacity: z.number().optional(),
    animate: z.enum(['drift', 'pulse', 'wipe']).optional()
  }),
  z.object({
    kind: z.literal('CHART'),
    chart: z.enum(['bar', 'line', 'pie', 'metric']),
    data: z.unknown(),
    emphasize: z.array(z.number()).optional()
  }),
  z.object({
    kind: z.literal('CALLOUT'),
    text: z.string()
  })
]);

// Evidence linking
export const EvidenceSchema = z.object({
  provId: z.string(),
  atCue: z.number() // cue index (not ms)
});

// Scene schema
export const SceneSchema = z.object({
  id: z.string(),
  role: SceneRoleSchema,
  voiceover: VoiceoverSchema,
  visuals: z.array(ElementSchema),
  evidence: z.array(EvidenceSchema).optional(),
  motion: z.enum(['standard', 'emphasis', 'gentle']).optional(),
  accentColor: z.string().optional(),
  durationMs: z.number().optional() // computed if omitted
});

// Story metadata
export const StoryMetaSchema = z.object({
  controllingIdea: z.string(),
  arc: z.enum(['ProblemTurnProof', 'CaseLed', 'MMS']),
  targetDurationSec: z.number(),
  audience: z.string(),
  allowResequence: z.boolean().default(true),
  provenance: z.array(z.object({
    id: z.string(),
    label: z.string(),
    href: z.string().optional()
  }))
});

// Complete video document
export const VideoDocSchema = z.object({
  story: StoryMetaSchema,
  scenes: z.array(SceneSchema).min(1)
});

// Type exports
export type SceneRole = z.infer<typeof SceneRoleSchema>;
export type Voiceover = z.infer<typeof VoiceoverSchema>;
export type Element = z.infer<typeof ElementSchema>;
export type Evidence = z.infer<typeof EvidenceSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type StoryMeta = z.infer<typeof StoryMetaSchema>;
export type VideoDoc = z.infer<typeof VideoDocSchema>;

// Duration computation (from PRD)
const TARGET_WPS = 1.83; // words per second

export function computeSceneDuration(scene: Scene): number {
  if (scene.durationMs) return scene.durationMs;
  
  const wordCount = scene.voiceover.text.split(/\s+/).length;
  const reveals = scene.visuals.length;
  
  const baseDuration = (wordCount / TARGET_WPS) * 1000;
  const revealTime = reveals * 250; // 250ms per reveal
  const enterExit = 600 + 350; // entrance + exit
  
  return Math.min(Math.max(baseDuration + revealTime + enterExit, 2200), 6500);
}

// Scene generation helpers
export class VideoDocGenerator {
  /**
   * Convert VO script to VideoDoc scenes
   */
  static async generateVideoDoc(
    voScript: any,
    storyMeta: StoryMeta,
    ttsTimings: any,
    provenance: any[] = []
  ): Promise<VideoDoc> {
    const scenes: Scene[] = [];
    
    for (let i = 0; i < voScript.scenes.length; i++) {
      const voScene = voScript.scenes[i];
      const timing = ttsTimings.sceneTimings[i];
      
      const scene: Scene = {
        id: voScene.id,
        role: this.inferSceneRole(voScene.id, i),
        voiceover: {
          text: voScene.text,
          cues: timing.sentences.map((s: any) => s.start)
        },
        visuals: await this.generateVisuals(voScene, timing),
        evidence: this.extractEvidence(voScene.evidenceTokens),
        motion: 'standard',
        durationMs: timing.totalDurationMs
      };
      
      scenes.push(scene);
    }
    
    // Ensure story has provenance array
    const storyWithProvenance = {
      ...storyMeta,
      provenance: provenance.length > 0 ? provenance : []
    };
    
    return VideoDocSchema.parse({
      story: storyWithProvenance,
      scenes
    });
  }
  
  private static inferSceneRole(sceneId: string, index: number): SceneRole {
    // Simple inference from scene ID patterns
    if (sceneId.includes('hook')) return 'HOOK';
    if (sceneId.includes('problem')) return 'PROBLEM';
    if (sceneId.includes('turn')) return 'TURN';
    if (sceneId.includes('approach')) return 'APPROACH';
    if (sceneId.includes('proof')) return 'PROOF';
    if (sceneId.includes('cta')) return 'CTA';
    
    // Default sequence
    const roles: SceneRole[] = ['HOOK', 'PROBLEM', 'TURN', 'APPROACH', 'PROOF', 'CTA'];
    return roles[index] || 'APPROACH';
  }
  
  private static async generateVisuals(voScene: any, timing: any): Promise<Element[]> {
    const elements: Element[] = [];
    
    // Add title if first scene
    if (voScene.id.includes('hook')) {
      elements.push({
        kind: 'TEXT',
        role: 'title',
        text: this.extractTitle(voScene.text)
      });
    }
    
    // Add chart for data scenes
    if (voScene.text.includes('%') || voScene.text.includes('increase') || voScene.text.includes('improve')) {
      elements.push({
        kind: 'CHART',
        chart: 'bar',
        data: this.inferChartData(voScene.text)
      });
    }
    
    // Add callouts for process steps
    if (voScene.text.includes('first') || voScene.text.includes('second') || voScene.text.includes('three')) {
      const steps = this.extractSteps(voScene.text);
      steps.forEach(step => {
        elements.push({
          kind: 'CALLOUT',
          text: step
        });
      });
    }
    
    return elements;
  }
  
  private static extractEvidence(evidenceTokens: any[]): Evidence[] {
    return evidenceTokens.map((token, index) => ({
      provId: token.provId,
      atCue: index // Map to cue position
    }));
  }
  
  private static extractTitle(text: string): string {
    const sentences = text.split(/[.!?]+/);
    return sentences[0]?.substring(0, 60) + (sentences[0]?.length > 60 ? '...' : '');
  }
  
  private static inferChartData(text: string) {
    // Simple data inference - in real implementation, use more sophisticated parsing
    return {
      labels: ['Before', 'After'],
      values: [40, 70]
    };
  }
  
  private static extractSteps(text: string): string[] {
    const steps = [];
    if (text.includes('first') || text.includes('one,')) steps.push('Step 1');
    if (text.includes('second') || text.includes('two,')) steps.push('Step 2');  
    if (text.includes('third') || text.includes('three,')) steps.push('Step 3');
    return steps;
  }
}