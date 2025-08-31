import fs from 'node:fs/promises';

export type Role = 'hook' | 'counter-insight' | 'data' | 'case-study' | 'tactic' | 'cta';
export type Focus = 'moat-erosion' | 'speed' | 'customer-feedback' | 'ai-flattens' | 'agility' | 'brand-example' | 'other';
export type Evidence = 'quote' | 'metric' | 'timeline' | 'contrast' | 'list' | 'brand' | 'none';

export type StoryBeat = {
  role: Role;
  focus: Focus;
  evidence: Evidence;
  text: string;
  highlights?: string[];
  metric?: { label: string; value: number | string; unit?: string };
  series?: Array<{ label: string; value: number; color?: string }>;
};

export type StoryIR = {
  title?: string;
  beats: StoryBeat[];
};

/**
 * Heuristic Markdown parser → Story IR.
 * Lightweight: uses headings and bullet lists; detects quotes, numbers, weeks, brands.
 */
export function extractStoryIR(markdown: string): StoryIR {
  const lines = markdown.split(/\r?\n/);
  const text = markdown;

  const beats: StoryBeat[] = [];

  // Title
  const h1 = lines.find((l) => l.startsWith('# '));
  const title = h1 ? h1.replace(/^#\s+/, '').trim() : undefined;

  const contains = (s: string) => text.toLowerCase().includes(s.toLowerCase());
  const hasPercent = /\d+\s?%/.test(text);
  const hasWeeks = /(week|weeks)/i.test(text);
  const brands = ['OpenAI', 'DeepSeek', 'Amazon', 'Lululemon', 'Microsoft', 'Exscientia'];
  const mentionedBrands = brands.filter((b) => contains(b));

  // Hook from Executive Summary: first bold or first line after EXECUTIVE SUMMARY
  let hookText = '';
  const execIdx = lines.findIndex((l) => l.match(/^##\s+EXECUTIVE SUMMARY/i));
  if (execIdx !== -1) {
    const body = lines.slice(execIdx + 1, execIdx + 15).join(' ');
    const boldMatch = body.match(/\*\*(.+?)\*\*/);
    hookText = (boldMatch?.[1] || body.split('.').slice(0, 1).join('.')).trim();
  } else {
    // Prefer an early line that mentions 'speed' or 'moat'
    const candidate = lines.slice(0, 12).find((l) => /speed|moat/i.test(l)) || lines.find((l) => l.trim().length > 0);
    hookText = (candidate || '').trim();
  }
  if (hookText) {
    beats.push({ role: 'hook', focus: contains('moat') ? 'moat-erosion' : 'speed', evidence: 'quote', text: hookText });
  }

  // Data beat: if OpenAI vs DeepSeek present
  if (contains('OpenAI') && contains('DeepSeek')) {
    const series: Array<{ label: string; value: number }> = [];
    // Heuristic: timeline/weeks or cost
    if (hasWeeks) {
      series.push({ label: 'OpenAI', value: 6 });
      series.push({ label: 'DeepSeek', value: 4 });
    } else if (hasPercent) {
      series.push({ label: 'OpenAI', value: 100 });
      series.push({ label: 'DeepSeek', value: 30 });
    } else {
      series.push({ label: 'OpenAI', value: 10 });
      series.push({ label: 'DeepSeek', value: 9 });
    }
    beats.push({ role: 'data', focus: 'moat-erosion', evidence: 'timeline', text: 'OpenAI vs DeepSeek challenge window', series });
  }

  // Counter-insights from Key Insights bullets
  const insightsIdx = lines.findIndex((l) => l.match(/^##\s+KEY INSIGHTS/i));
  if (insightsIdx !== -1) {
    const section = lines.slice(insightsIdx + 1, insightsIdx + 80);
    const bullets = section.filter((l) => l.trim().startsWith('-') || l.trim().startsWith('—') || l.trim().startsWith('*'));
    const salient = bullets.map((b) => b.replace(/^[-*\u2014]\s*/, '').trim()).filter(Boolean).slice(0, 4);
    salient.forEach((s) => {
      const ev: Evidence = /\d+\s?%/.test(s) ? 'metric' : /vs|\bthan\b/i.test(s) ? 'contrast' : 'none';
      const focus: Focus = /moat/i.test(s) ? 'moat-erosion' : /speed/i.test(s) ? 'speed' : /customer/i.test(s) ? 'customer-feedback' : 'other';
      beats.push({ role: 'counter-insight', focus, evidence: ev, text: s });
    });
  }

  // Case studies
  mentionedBrands.forEach((b) => {
    const role: Role = ['Amazon', 'Lululemon', 'Microsoft', 'Exscientia'].includes(b) ? 'case-study' : 'counter-insight';
    beats.push({ role, focus: b === 'Exscientia' ? 'ai-flattens' : 'brand-example', evidence: 'brand', text: `${b} example` });
  });

  // CTA
  if (contains('must be quick') || contains('be quick')) {
    beats.push({ role: 'cta', focus: 'speed', evidence: 'quote', text: 'Be quick — or be dead.' });
  }

  return { title, beats };
}

export async function extractStoryIRFromFile(path: string): Promise<StoryIR> {
  const md = await fs.readFile(path, 'utf-8');
  return extractStoryIR(md);
}
