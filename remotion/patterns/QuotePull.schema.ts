import { z } from 'zod';

export const QuotePullPropsSchema = z.object({
  format: z.enum(['vertical', 'square', 'horizontal']).default('vertical'),
  quote: z.string().min(6).max(200),
  attribution: z.string().min(0).max(80).optional(),
});

export type QuotePullProps = z.infer<typeof QuotePullPropsSchema>;

export const getQuotePullDefaults = (): QuotePullProps => ({
  format: 'vertical',
  quote: 'Speed is the only dependable defense.',
  attribution: undefined,
});

