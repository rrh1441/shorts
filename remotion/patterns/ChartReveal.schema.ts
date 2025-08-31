import { z } from 'zod';

export const ChartRevealPropsSchema = z.object({
  format: z.enum(['vertical', 'square', 'horizontal']).default('vertical'),
  headline: z.string().min(4).max(160),
  data: z.array(z.object({ label: z.string(), value: z.number(), color: z.string().optional() })).min(2),
  showValues: z.boolean().default(true),
});

export type ChartRevealProps = z.infer<typeof ChartRevealPropsSchema>;

export const getChartRevealDefaults = (): ChartRevealProps => ({
  format: 'vertical',
  headline: 'Key Trend',
  data: [
    { label: 'Q1', value: 10 },
    { label: 'Q2', value: 14 },
    { label: 'Q3', value: 18 },
    { label: 'Q4', value: 22 },
  ],
  showValues: true,
});

