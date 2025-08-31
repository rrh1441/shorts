import { z } from 'zod';

export const BarDataSchema = z.object({
  label: z.string().min(1).max(50),
  value: z.number(),
  color: z.string().optional(),
});

export const BarChartPropsSchema = z.object({
  data: z.array(BarDataSchema).min(1),
  width: z.number().positive().default(800),
  height: z.number().positive().default(400),
  barColor: z.string().optional(),
  showValues: z.boolean().default(true),
  showGrid: z.boolean().default(true),
  animationType: z.enum(['grow', 'slide', 'fade']).default('grow'),
  staggerDelay: z.number().nonnegative().default(3),
  startAt: z.number().nonnegative().default(0),
  className: z.string().optional(),
});

export type BarChartProps = z.infer<typeof BarChartPropsSchema>;

export const getBarChartDefaults = (): BarChartProps => ({
  data: [
    { label: 'A', value: 10 },
    { label: 'B', value: 20 },
    { label: 'C', value: 15 },
  ],
  width: 800,
  height: 400,
  showValues: true,
  showGrid: true,
  animationType: 'grow',
  staggerDelay: 3,
  startAt: 0,
});

