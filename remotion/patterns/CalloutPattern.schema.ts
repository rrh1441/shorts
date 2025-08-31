import { z } from 'zod';

export const CalloutPatternPropsSchema = z.object({
  format: z.enum(['vertical', 'square', 'horizontal']).default('vertical'),
  headline: z.string().min(4).max(160).optional(),
  title: z.string().min(2).max(80),
  body: z.string().min(4).max(400),
  variant: z.enum(['default', 'success', 'warning', 'error', 'info']).default('info'),
});

export type CalloutPatternProps = z.infer<typeof CalloutPatternPropsSchema>;

export const getCalloutPatternDefaults = (): CalloutPatternProps => ({
  format: 'vertical',
  headline: 'Key Point',
  title: 'Callout',
  body: 'Important supporting context appears here.',
  variant: 'info',
});

