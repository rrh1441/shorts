import { z } from 'zod';

export const StatRowPropsSchema = z.object({
  format: z.enum(['vertical', 'square', 'horizontal']).default('vertical'),
  headline: z.string().min(4).max(120).optional(),
  stats: z.array(z.object({ label: z.string().min(1).max(40), value: z.union([z.string(), z.number()]) })).min(2).max(4),
});

export type StatRowProps = z.infer<typeof StatRowPropsSchema>;

export const getStatRowDefaults = (): StatRowProps => ({
  format: 'vertical',
  headline: 'Key Metrics',
  stats: [
    { label: 'Metric A', value: 10 },
    { label: 'Metric B', value: 20 },
  ],
});

