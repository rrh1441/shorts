import { z } from 'zod';

export const CalloutBoxPropsSchema = z.object({
  children: z.any(), // React.ReactNode - can't validate easily
  width: z.number().positive().default(600),
  height: z.union([z.number().positive(), z.literal('auto')]).default(200),
  backgroundColor: z.string().optional(),
  borderColor: z.string().optional(),
  borderWidth: z.number().nonnegative().default(2),
  borderRadius: z.number().nonnegative().default(12),
  padding: z.number().nonnegative().default(24),
  animationType: z.enum(['fade', 'slide', 'scale', 'bounce']).default('fade'),
  direction: z.enum(['left', 'right', 'up', 'down']).default('up'),
  startAt: z.number().nonnegative().default(0),
  durationInFrames: z.number().positive().default(45),
  className: z.string().optional(),
  style: z.any().optional(), // React.CSSProperties - complex to validate
  icon: z.any().optional(), // React.ReactNode - can't validate easily
  iconColor: z.string().optional(),
  title: z.string().optional(),
  titleColor: z.string().default('#1f2937'),
  titleSize: z.number().positive().default(18),
  bodyFontSize: z.number().positive().default(48),
  shadow: z.boolean().default(true),
  shadowColor: z.string().default('rgba(0, 0, 0, 0.1)'),
  variant: z.enum(['default', 'success', 'warning', 'error', 'info']).default('default'),
});

export const getCalloutBoxDefaults = (): Omit<z.infer<typeof CalloutBoxPropsSchema>, 'children'> & { children: string } => ({
  children: 'Sample callout content',
  width: 600,
  height: 200,
  borderWidth: 2,
  borderRadius: 12,
  padding: 24,
  animationType: 'fade',
  direction: 'up',
  startAt: 0,
  durationInFrames: 45,
  titleColor: '#1f2937',
  titleSize: 18,
  bodyFontSize: 48,
  shadow: true,
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  variant: 'default',
});

export type CalloutBoxProps = z.infer<typeof CalloutBoxPropsSchema>;
