import { z } from 'zod';

export const TimelinePropsSchema = z.object({
  format: z.enum(['vertical', 'square', 'horizontal']).default('vertical'),
  headline: z.string().min(4).max(120).optional(),
  steps: z.array(z.object({ title: z.string().min(2).max(60), body: z.string().min(2).max(140).optional() })).min(3).max(6),
});

export type TimelineProps = z.infer<typeof TimelinePropsSchema>;

export const getTimelineDefaults = (): TimelineProps => ({
  format: 'vertical',
  headline: 'Timeline',
  steps: [
    { title: 'Step 1', body: 'Description' },
    { title: 'Step 2', body: 'Description' },
    { title: 'Step 3', body: 'Description' },
  ],
});

