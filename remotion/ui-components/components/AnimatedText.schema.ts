import { z } from 'zod';

export const AnimatedTextPropsSchema = z.object({
  text: z.string().min(1).max(500),
  fontSize: z.number().positive().default(48),
  fontWeight: z.union([z.string(), z.number()]).default('normal'),
  color: z.string().default('#000000'),
  fontFamily: z.string().default('Inter, sans-serif'),
  animationType: z.enum(['typewriter', 'fade', 'slide', 'scale', 'reveal']).default('fade'),
  direction: z.enum(['left', 'right', 'up', 'down']).default('left'),
  startAt: z.number().nonnegative().default(0),
  durationInFrames: z.number().positive().default(60),
  characterDelay: z.number().nonnegative().default(2),
  className: z.string().optional(),
  style: z.any().optional(), // React.CSSProperties - complex to validate
  textAlign: z.enum(['left', 'center', 'right']).default('left'),
  lineHeight: z.number().positive().default(1.2),
});

export const getAnimatedTextDefaults = (): z.infer<typeof AnimatedTextPropsSchema> => ({
  text: 'Sample Text',
  fontSize: 48,
  fontWeight: 'normal',
  color: '#000000',
  fontFamily: 'Inter, sans-serif',
  animationType: 'fade',
  direction: 'left',
  startAt: 0,
  durationInFrames: 60,
  characterDelay: 2,
  textAlign: 'left',
  lineHeight: 1.2,
});

export type AnimatedTextProps = z.infer<typeof AnimatedTextPropsSchema>;