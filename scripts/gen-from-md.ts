#!/usr/bin/env tsx
import fs from 'node:fs/promises';
import path from 'node:path';
import { extractStoryIRFromFile, type StoryBeat } from '../shared/story-ir';
import { mapBeatToPattern } from '../shared/pattern-mapper';
import { generateVO } from '../shared/vo';
import { OpenAI } from 'openai';
import { qaPreflight } from '../shared/qa-preflight';

async function main() {
  const mdPath = process.argv[2];
  const outputDir = process.argv[3] || './output';
  const format = (process.argv[4] as 'vertical' | 'square' | 'horizontal') || 'vertical';
  if (!mdPath) {
    console.error('Usage: tsx scripts/gen-from-md.ts <content.md> [output-dir] [format]');
    process.exit(1);
  }

  const outAnimated = path.join(outputDir, 'animated-video');
  await fs.mkdir(outAnimated, { recursive: true });

  const ir = await extractStoryIRFromFile(mdPath);
  const beats = ir.beats;

  const decisions: Array<{ scene: number; beat: StoryBeat; decision: any; vo: any }> = [];
  let segIndex = 1;
  let prevBeat: StoryBeat | undefined = undefined;
  for (const beat of beats) {
    const decision = mapBeatToPattern(beat, format);
    // Generate VO/script and screen text; update props for the selected pattern
    let vo = await generateVO(beat, prevBeat);
    // Enforce bridge for scenes > 1 if not present
    if (segIndex > 1 && !/^\s*(So|For example|Next|Meanwhile|In short|Then)\b/i.test(vo.vo_script)) {
      const prefix = beat.role === 'data' ? 'So ' : beat.role === 'case-study' ? 'For example, ' : 'Next, ';
      vo = { ...vo, vo_script: `${prefix}${vo.vo_script}` };
    }
    if (decision.pattern === 'TitleSubhead') {
      (decision.props as any).title = vo.screen_text.title || vo.screen_text.headline || (decision.props as any).title;
      if (vo.screen_text.subhead) (decision.props as any).subhead = vo.screen_text.subhead;
    }
    if (decision.pattern === 'CalloutPattern') {
      (decision.props as any).title = vo.screen_text.headline || (decision.props as any).title;
      (decision.props as any).body = vo.screen_text.body || (decision.props as any).body || beat.text;
    }
    if (decision.pattern === 'ChartReveal') {
      (decision.props as any).headline = vo.screen_text.headline || (decision.props as any).headline;
    }
    decisions.push({ scene: segIndex, beat, decision, vo });
    segIndex++;
    prevBeat = beat;
  }

  // QA preflight before writing files
  const qa = qaPreflight(beats, decisions as any);
  await fs.writeFile(path.join(outAnimated, 'qa-report.json'), JSON.stringify(qa, null, 2));
  if (!qa.ok) {
    console.error('QA failed. See qa-report.json for details.');
    process.exit(1);
  }

  // Write components and audio after QA passes
  for (const { scene, decision, vo } of decisions) {
    const componentCode = renderComponent(decision.pattern, decision.props, format);
    const fileName = `Segment${scene}Component.tsx`;
    await fs.writeFile(path.join(outAnimated, fileName), componentCode);

    const ttsPath = path.join(outAnimated, `segment-${scene}-tts.txt`);
    await fs.writeFile(ttsPath, vo.vo_script);
    try {
      const apiKey = process.env.OPENAI_API_KEY || (process.env as any).openai_api_key;
      if (apiKey) {
        const openai = new OpenAI({ apiKey });
        const audioRes = await openai.audio.speech.create({ model: 'tts-1-hd', voice: 'alloy', input: vo.vo_script, speed: 1.0 });
        const audioBuffer = Buffer.from(await audioRes.arrayBuffer());
        const audioPath = path.join(outAnimated, `segment-${scene}-audio.mp3`);
        await fs.writeFile(audioPath, audioBuffer);
      }
    } catch { /* ignore audio failures */ }
  }

  // Save decisions & IR
  await fs.writeFile(path.join(outAnimated, 'story-ir.json'), JSON.stringify(ir, null, 2));
  await fs.writeFile(path.join(outAnimated, 'pattern-decisions.json'), JSON.stringify(decisions, null, 2));
  // Save narrative + storyboard artifacts
  const narrative = {
    title: ir.title || 'Narrative',
    beats: decisions.map(({ scene, beat, vo }) => ({ scene, role: beat.role, focus: beat.focus, bridge: vo.bridge, vo_script: vo.vo_script, screen_text: vo.screen_text })),
  };
  const storyboard = {
    beats: decisions.map(({ scene, decision }) => ({ scene, pattern: decision.pattern, props: decision.props })),
  };
  await fs.writeFile(path.join(outAnimated, 'narrative.json'), JSON.stringify(narrative, null, 2));
  await fs.writeFile(path.join(outAnimated, 'storyboard.json'), JSON.stringify(storyboard, null, 2));

  console.log(`Generated ${beats.length} segments to ${outAnimated}`);
}

function patternImport(name: string) {
  switch (name) {
    case 'TitleSubhead':
      return "../../remotion/patterns/TitleSubhead.tsx";
    case 'CalloutPattern':
      return "../../remotion/patterns/CalloutPattern.tsx";
    case 'StatHero':
      return "../../remotion/patterns/StatHero.tsx";
    case 'ChartReveal':
      return "../../remotion/patterns/ChartReveal.tsx";
    default:
      return "../../remotion/patterns/TitleSubhead.tsx";
  }
}

function renderComponent(pattern: string, props: any, format: 'vertical' | 'square' | 'horizontal') {
  const importPath = patternImport(pattern);
  const propsString = JSON.stringify(props, null, 2);
  const dim = format === 'vertical' ? { w: 1080, h: 1920 } : format === 'square' ? { w: 1080, h: 1080 } : { w: 1920, h: 1080 };
  return `import React from 'react';
import { ${pattern} } from '${importPath}';

const Component: React.FC = () => {
  const props = ${propsString};
  return (
    <div style={{ width: ${dim.w}, height: ${dim.h}, background: props.format==='vertical' ? '#ffffff' : '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <${pattern} {...props} />
    </div>
  );
}

export default Component;
`;
}

main().catch((e) => { console.error(e); process.exit(1); });
