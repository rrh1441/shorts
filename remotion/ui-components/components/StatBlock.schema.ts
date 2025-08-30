import { z } from 'zod';

export const StatItemSchema = z.object({
  label: z.string().min(1).max(50),
  value: z.union([z.string(), z.number()]),
  color: z.string().optional(),
  icon: z.any().optional(), // React.ReactNode - can't validate easily
  format: z.enum(['number', 'percentage', 'currency', 'text']).optional(),
  prefix: z.string().optional(),
  suffix: z.string().optional(),
});

export const StatBlockPropsSchema = z.object({
  stats: z.array(StatItemSchema).min(1).max(12),
  columns: z.number().int().min(1).max(4).default(2),
  width: z.number().positive().default(800),
  height: z.number().positive().default(400),
  backgroundColor: z.string().default('#ffffff'),
  borderColor: z.string().default('#e5e7eb'),
  showBorder: z.boolean().default(true),
  animationType: z.enum(['fade', 'slide', 'scale', 'counter']).default('fade'),
  staggerDelay: z.number().nonnegative().default(5),
  startAt: z.number().nonnegative().default(0),
  className: z.string().optional(),
  title: z.string().optional(),
  titleColor: z.string().default('#1f2937'),
});

export const getStatBlockDefaults = (): z.infer<typeof StatBlockPropsSchema> => ({
  stats: [
    { label: 'Sample Metric', value: 42, format: 'number' }
  ],
  columns: 2,
  width: 800,
  height: 400,
  backgroundColor: '#ffffff',
  borderColor: '#e5e7eb',
  showBorder: true,
  animationType: 'fade',
  staggerDelay: 5,
  startAt: 0,
  titleColor: '#1f2937',
});

export type StatBlockProps = z.infer<typeof StatBlockPropsSchema>;
export type StatItem = z.infer<typeof StatItemSchema>;