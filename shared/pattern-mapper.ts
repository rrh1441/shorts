import { z } from 'zod';
import type { StoryBeat } from './story-ir';
import { TitleSubheadPropsSchema } from '../remotion/patterns/TitleSubhead.schema';
import { CalloutPatternPropsSchema } from '../remotion/patterns/CalloutPattern.schema';
import { StatHeroPropsSchema } from '../remotion/patterns/StatHero.schema';
import { ChartRevealPropsSchema } from '../remotion/patterns/ChartReveal.schema';

type PatternName = 'TitleSubhead' | 'CalloutPattern' | 'StatHero' | 'ChartReveal';

export type PatternDecision = {
  pattern: PatternName;
  props: any; // validated per-schema
  rationale: string;
};

const clampText = (s: string, max = 120) => (s.length > max ? s.slice(0, max - 1) + '…' : s);

export function mapBeatToPattern(beat: StoryBeat, format: 'vertical' | 'square' | 'horizontal' = 'vertical'): PatternDecision {
  const text = beat.text.trim();

  // Deterministic mapping
  if (beat.role === 'hook') {
    const headline = clampText(text, 80);
    const base: any = { format, title: headline };
    return { pattern: 'TitleSubhead', props: TitleSubheadPropsSchema.parse(base), rationale: 'Hook → TitleSubhead' };
  }

  if (beat.role === 'data' || beat.evidence === 'timeline') {
    const headline = clampText(text, 80) || 'Key Trend';
    const data = (beat.series || []).slice(0, 6).map((d) => ({ label: d.label, value: d.value }));
    const props = { format, headline, data, showValues: true };
    return { pattern: 'ChartReveal', props: ChartRevealPropsSchema.parse(props), rationale: 'Data/timeline → ChartReveal' };
  }

  if (beat.evidence === 'metric') {
    // Pull number or percent
    const match = beat.text.match(/(\d+\s?%|\~?\d+\s?(?:weeks?|days?|x))/i);
    const val = match ? match[1] : '—';
    const label = clampText(beat.text.replace(match?.[0] || '', '').trim() || 'Key Metric', 40);
    const props = { format, headline: clampText(beat.text, 80), statLabel: label || 'Metric', statValue: val };
    return { pattern: 'StatHero', props: StatHeroPropsSchema.parse(props), rationale: 'Metric → StatHero' };
  }

  if (beat.role === 'cta') {
    const base: any = { format, title: clampText(text, 60) };
    return { pattern: 'TitleSubhead', props: TitleSubheadPropsSchema.parse(base), rationale: 'CTA → TitleSubhead' };
  }

  // Default: Callout
  const headline = undefined;
  const title = clampText(text.split(':')[0] || text, 60);
  const body = clampText(text, 200);
  const props = { format, headline, title, body, variant: 'default' as const };
  return { pattern: 'CalloutPattern', props: CalloutPatternPropsSchema.parse(props), rationale: 'Default → Callout' };
}
