import type { StoryBeat } from './story-ir';

export type QAIssue = {
  scene: number;
  severity: 'error' | 'warn';
  code: string;
  message: string;
};

const WORDS_PER_SEC = 4.8;
const estSecs = (s: string) => Math.round((s.trim().split(/\s+/).length / WORDS_PER_SEC) * 100) / 100;

export function qaPreflight(
  beats: StoryBeat[],
  decisions: Array<{ scene: number; decision: { pattern: string; props: any }; vo: { vo_script: string; screen_text: any; bridge?: string } }>
): { ok: boolean; issues: QAIssue[] } {
  const issues: QAIssue[] = [];

  for (const d of decisions) {
    const { scene, decision, vo } = d;
    const pattern = decision.pattern;
    const props = decision.props || {};
    const beat = beats[scene - 1];

    // VO length checks
    const secs = estSecs(vo.vo_script || '');
    if (secs < 1.5) issues.push({ scene, severity: 'warn', code: 'vo_short', message: `VO ${secs}s may be too short.` });
    if (secs > 12) issues.push({ scene, severity: 'error', code: 'vo_long', message: `VO ${secs}s exceeds 12s.` });

    // Narrative bridging for scenes > 1
    if (scene > 1 && !/^\s*(So|For example|Next|Meanwhile|In short|Then)\b/i.test(vo.vo_script)) {
      issues.push({ scene, severity: 'warn', code: 'vo_no_bridge', message: 'Consider adding a short bridge for coherence.' });
    }

    // Pattern-specific
    if (pattern === 'TitleSubhead') {
      const title: string = props.title || '';
      if (!title || title.trim().length < 8) {
        issues.push({ scene, severity: 'error', code: 'title_missing', message: 'TitleSubhead requires a meaningful title (>=8 chars).' });
      }
      if (title.length > 120) issues.push({ scene, severity: 'warn', code: 'title_long', message: 'Title may be too long (>120 chars).' });
    }

    if (pattern === 'CalloutPattern') {
      const title: string = props.title || '';
      const body: string = props.body || '';
      if (!title) issues.push({ scene, severity: 'error', code: 'callout_title_missing', message: 'Callout requires a title.' });
      if (!body) issues.push({ scene, severity: 'error', code: 'callout_body_missing', message: 'Callout requires a body.' });
      if (body.length > 240) issues.push({ scene, severity: 'warn', code: 'callout_body_long', message: 'Callout body may be too long (>240 chars).' });
    }

    if (pattern === 'ChartReveal') {
      const data: Array<{ label: string; value: number }> = props.data || [];
      if (data.length < 2 || data.length > 6) {
        issues.push({ scene, severity: 'error', code: 'chart_density', message: 'Chart requires between 2 and 6 bars.' });
      }
      data.forEach((dpt, idx) => {
        if (!dpt.label || dpt.label.length > 18) {
          issues.push({ scene, severity: 'warn', code: 'label_length', message: `Bar ${idx + 1} label is missing or too long (>18).` });
        }
      });
    }

    if (pattern === 'StatHero') {
      const val = String(props.statValue || '').trim();
      if (!val) issues.push({ scene, severity: 'error', code: 'stat_missing', message: 'StatHero requires a statValue.' });
    }
  }

  const ok = !issues.some((i) => i.severity === 'error');
  return { ok, issues };
}

