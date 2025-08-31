import { z } from 'zod';

export const StatHeroPropsSchema = z.object({
  format: z.enum(['vertical', 'square', 'horizontal']).default('vertical'),
  headline: z.string().min(4).max(120),
  statLabel: z.string().min(1).max(60),
  statValue: z.union([z.number(), z.string()]), // allow "34%" or 34
  valueFormat: z.enum(['number', 'percentage', 'currency', 'text']).optional(),
});

export type StatHeroProps = z.infer<typeof StatHeroPropsSchema>;

export const getStatHeroDefaults = (): StatHeroProps => ({
  format: 'vertical',
  headline: 'Key Result',
  statLabel: 'Metric',
  statValue: 42,
  valueFormat: 'number',
});

