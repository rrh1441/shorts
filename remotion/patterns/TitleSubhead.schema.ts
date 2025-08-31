import { z } from 'zod';

export const TitleSubheadPropsSchema = z.object({
  format: z.enum(['vertical', 'square', 'horizontal']).default('vertical'),
  title: z.string().min(4).max(120),
  subhead: z.string().min(4).max(200).optional(),
});

export type TitleSubheadProps = z.infer<typeof TitleSubheadPropsSchema>;

export const getTitleSubheadDefaults = (): TitleSubheadProps => ({
  format: 'vertical',
  title: 'Your Title Here',
  subhead: 'Supporting context appears here',
});

