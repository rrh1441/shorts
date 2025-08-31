import { OpenAI } from 'openai';
import type { StoryBeat } from './story-ir';

export type BeatVO = {
  vo_script: string;
  screen_text: { title?: string; subhead?: string; headline?: string; body?: string };
  bridge?: string;
};

const WORDS_PER_SEC = 4.8; // ~0.21s/word

function estimateSeconds(text: string) {
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round((words / WORDS_PER_SEC) * 100) / 100);
}

function template(beat: StoryBeat, prev?: StoryBeat): BeatVO {
  const role = beat.role;
  const t = beat.text.trim();
  const bridge = prev ? (prev.role === 'hook' ? 'So what changed?' : 'For context:') : undefined;

  if (role === 'hook') {
    const vo = t.replace(/\s+/g, ' ');
    return { vo_script: vo, screen_text: { title: t }, bridge: undefined };
  }
  if (role === 'data') {
    const vo = 'OpenAI\'s lead was challenged within weeks. DeepSeek matched it at a fraction of the cost.';
    return { vo_script: vo, screen_text: { headline: 'OpenAI vs DeepSeek: challenge window' }, bridge };
  }
  if (role === 'case-study') {
    const brand = t.replace(/\s+example$/i, '');
    const vo = `${brand} wins by moving faster — serving demand and scaling before rivals react.`;
    return { vo_script: vo, screen_text: { headline: `${brand}: velocity advantage` }, bridge };
  }
  if (role === 'tactic') {
    const vo = `Embed speed into the org: flatten decisions and iterate with real-time feedback.`;
    return { vo_script: vo, screen_text: { headline: 'Build speed into your DNA' }, bridge };
  }
  if (role === 'cta') {
    const vo = t;
    return { vo_script: vo, screen_text: { title: t }, bridge };
  }
  // counter-insight / default
  const vo = t;
  return { vo_script: vo, screen_text: { headline: t }, bridge };
}

export async function generateVO(beat: StoryBeat, prev?: StoryBeat): Promise<BeatVO> {
  const base = template(beat, prev);
  const apiKey = process.env.OPENAI_API_KEY || (process.env as any).openai_api_key;
  if (!apiKey) return base;

  try {
    const openai = new OpenAI({ apiKey });
    const prompt = `You write concise voiceover lines for short business videos.\n\nINPUT ROLE: ${beat.role}\nINPUT TEXT: ${beat.text}\nPREVIOUS ROLE: ${prev?.role || 'none'}\n\nWrite a natural voiceover in 1–2 sentences that:\n- Explains the on-screen point plainly\n- Avoids repeating phrases (e.g., don't say 'weeks' twice)\n- Adds no new facts\n- Targets ~2–8 seconds (≈ 10–40 words)\n- If not the first beat, optionally begin with a short bridge like 'So' or 'For example'\n\nReturn JSON: { "vo_script": string, "screen_text": { "headline"?: string, "title"?: string, "subhead"?: string, "body"?: string }, "bridge"?: string }`;
    const res = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });
    const content = res.choices[0]?.message?.content?.trim();
    if (!content) return base;
    const parsed = JSON.parse(content);
    const vo_script: string = parsed.vo_script || base.vo_script;
    const screen = parsed.screen_text || base.screen_text;
    const bridge = parsed.bridge || base.bridge;
    // Enforce duration budget by trimming sentences if needed
    if (estimateSeconds(vo_script) > 9) {
      const firstSentence = vo_script.split(/\.(\s|$)/)[0] + '.';
      return { vo_script: firstSentence, screen_text: screen, bridge };
    }
    return { vo_script, screen_text: screen, bridge };
  } catch {
    return base;
  }
}

