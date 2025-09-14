import { z } from 'zod';

export const ChartPointSchema = z.object({ label: z.string(), value: z.number() });

export const VisualAnchorsSchema = z.object({
  title: z.string().optional(),
  sub: z.string().optional(),
  labels: z.array(z.string()).max(6).optional(),
  metric: z.object({ value: z.string(), label: z.string() }).optional(),
  chartData: z.array(ChartPointSchema).min(2).max(12).optional(),
});

export const VisualMotionSchema = z.object({
  introFrames: z.number().int().min(0).default(12),
  revealFrames: z.number().int().min(0).default(18),
  holdFrames: z.number().int().min(0).default(60),
  variant: z.string().optional(),
});

export const VisualPlanBeatSchema = z.object({
  component: z.enum([
    'auto',
    'SectionTitle',
    'QuoteBlock',
    'BulletList',
    'StatCard',
    'Figure',
    'Chart',
    'TransitionCard',
    'ExternalReact',
  ]).default('auto'),
  concept: z.string().min(4),
  styleLane: z.enum(['documentary', 'product', 'electric']).optional(),
  anchors: VisualAnchorsSchema.optional(),
  motion: VisualMotionSchema.optional(),
  external: z.object({ source: z.enum(['v0', 'raw']), modulePath: z.string().optional(), cssAllowed: z.boolean().default(true) }).optional(),
  format: z.enum(['horizontal', 'vertical', 'square']).default('horizontal'),
  durationSec: z.number().min(1).default(10),
  gutters: z.boolean().default(true),
});

export const VisualPlanSchema = z.object({
  beats: z.array(VisualPlanBeatSchema).min(1),
});

export type VisualPlan = z.infer<typeof VisualPlanSchema>;
export type VisualPlanBeat = z.infer<typeof VisualPlanBeatSchema>;

