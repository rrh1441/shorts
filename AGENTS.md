# AGENTS.md

## Shorts — Component‑Driven Video Automation

A Remotion-powered system where agents orchestrate prebuilt UI components by generating JSON props (validated with Zod) instead of writing animation code. This makes renders reliable, legible, and deterministic while keeping the AI’s job simple.

---

## Agent Handoff — Options & Next Steps (2025‑09‑15)

Two viable directions for the next implementation sprint. Pick A or B.

- Option A — Visual polish first
  - Layout shell: format‑aware safe margins, top spacing, grid container.
  - Type scale enforcement: minimum readable sizes per aspect; line‑length guard.
  - Theme packs: add MinimalEditorial and GradientGlass with a simple switch.
  - Acceptance: all scenes render within safe area; text sizes ≥ minimum per aspect; theme switch changes look without content changes.

- Option B — Ops/features first
  - JSON Patch: RFC 6902 patching of VideoDoc with CLI and reversal.
  - Clip extraction: implement ClipScore + T1–T5 templates from transcripts.
  - Determinism: hash‑stable outputs; cache hits for unchanged inputs.
  - Acceptance: patches apply/rollback idempotently; top‑N clips generated with VO and scenes; cached TTS reused.

Decision needed
- Choose Option A or B to start. For A: confirm brand colors/fonts if any. For B: confirm transcript schema and patch review workflow.

What’s already fixed (ready today)
- Scene‑relative VO cues and reveal clamping to avoid invisible elements.
- Baseline visuals per scene (never an empty frame).
- Aspect propagation to primitives (horizontal/square/vertical safe areas + type scale).
- Word budget hard gate in `script`; lint gate in `render:videodoc` (override with `--force`).
- Provenance captions at cited cues; narration audio auto‑detected (`vo.mp3`).

VO‑Led Pipeline (current default)
- Ingest → Brief → VO Script (budgeted) → TTS/Timing → VideoDoc → Lint → Render
- Commands:
  - `npm run ingest <input> [./output]`
  - `npm run synthesize`
  - `npm run script` (fails when outside budget)
  - `npm run plan:new` (saves `vo.mp3`, writes `videoDoc.json` + `lint-report.json`)
  - `npm run render:videodoc ./output/videoDoc.json ./output/video.mp4 --aspect=horizontal|square|vertical [--force]`

Legacy Component‑Orchestrator Path (kept for specific uses)
- Use when you need to target `remotion/patterns` and schema’d components with AI‑generated props. Prefer the VO‑led pipeline for end‑to‑end explainers.

Next steps checklist (fill based on chosen option)
- A/1: Implement format‑aware layout shell across scenes
- A/2: Enforce min type scale per aspect in primitives
- A/3: Add theme packs and a selection flag
- B/1: Implement RFC 6902 patching + CLI
- B/2: Add ClipScore + T1–T5 clip templates and CLI
- B/3: Wire caching to TTS/assets and surface cache stats

## How Agents Operate

1. Extract insights → Build a single source of truth (UniversalInsights).
2. Draft narrative → 5–7 scenes, each 6–15s with a clear purpose.
3. Storyboard plan → For each scene: story beat, VO draft, recommended component (no rendering).
4. Select component → From the curated library (StatBlock, AnimatedText, CalloutBox to start).
5. Generate props → Return JSON matching each component’s Zod schema.
6. Validate + fallback → Schemas enforce correctness; invalid props merge with defaults.
7. Emit TSX per scene → The orchestrator builds a thin wrapper using the chosen component.
8. TTS + render → Generate per‑scene audio and MP4s; stitch externally as needed.

---

## Agent Rules (Do / Don’t)

- Do: return JSON props, not TSX/JSX code.
- Do: respect the video format (vertical/square/horizontal) and readability constraints.
- Do: keep durations realistic (6–15s), avoid tiny text, ensure clear hierarchy.
- Don’t: invent component names. Use the registry provided by this repo.
- Don’t: set absolute widths/heights unless asked; prefer semantic sizes where available.
- Don’t: add randomness (determinism matters for repeatability).
- Don’t: rely on fallbacks — invalid props must fail with a clear error (fail‑closed).

---

## Scripts

- preview: Launch Remotion Studio with a minimal demo composition.
  - `npm run preview`
- generate: Transform UniversalInsights JSON into segmented components + TTS scripts.
  - `npm run generate <universal-insights.json> [output-dir] [format]`
  - Formats: `vertical` (default), `square`, `horizontal`
- render: Render a single segment TSX to MP4.
  - `npm run render <SegmentXComponent.tsx> <output.mp4>`
- render:with-audio: Render and mux an external audio file via ffmpeg.
  - `npm run render:with-audio <SegmentXComponent.tsx> <output.mp4> <audio.mp3>`
- plan: Lint a spec or the generated segments and write a basic report.
  - `npm run plan [path/to/spec.json]`
- storyboard: Generate a reviewable storyboard (beats, VO text, component recommendation) without rendering.
  - `npm run storyboard <universal-insights.json> [output-dir] [format]`
- realize:storyboard: Convert an approved storyboard into Segment components and VO scripts.
  - `npm run realize:storyboard <path/to/storyboard.json> [output-dir] [format]`

---

## Pipeline Output

Output directory (example):

```
output/
  animated-video/
    storyboard.json
    STORYBOARD.md
    Segment1Component.tsx
    segment-1-script.txt
    segment-1-audio.mp3
    segment-1.mp4 (after render)
    video-segments.json
    RENDERING-INSTRUCTIONS.md
  lint-report.json (from plan)
  segment-metadata.json
```

---

## Component Library Contract

- Location: `remotion/ui-components`
- Components export both the implementation and a Zod schema + defaults. Example:
  - `AnimatedText.tsx` → `AnimatedText`
  - `AnimatedText.schema.ts` → `AnimatedTextPropsSchema`, `getAnimatedTextDefaults()`
- Agents must select from known components only and return props conforming to the schema. The orchestrator validates and merges invalid props with defaults.

Current registry (curated for reliability):
- `StatBlock`: Metrics/KPIs with animated counters and layout options.
- `AnimatedText`: Headlines/titles with typewriter/fade/slide/scale/reveal.
- `CalloutBox`: Highlighted content with variants, icons, and animations.

---

## Determinism & Readability Guardrails

- FPS: 30; even dimensions for encoder compatibility.
- Dwell time: ensure text is readable (≈0.18s/word minimum).
- Safe margins: ≥3% gutter for mobile; avoid edge-clipping.
- No runtime randomness; animations should be consistent.

---

## Recommended Flow (Works Today)

1. Prepare UniversalInsights JSON (or use `shared/insights.ts` to extract it).
2. Plan the storyboard for review (no render):
   - `npm run storyboard insights.json ./output vertical`
   - Review and edit `output/animated-video/storyboard.json` or `STORYBOARD.md` as needed.
3. Realize the storyboard into components + scripts:
   - `npm run realize:storyboard ./output/animated-video/storyboard.json ./output vertical`
   - (Or run the legacy one-shot) `npm run generate insights.json ./output vertical`
4. Render each segment:
   - `npm run render ./output/animated-video/Segment1Component.tsx ./output/animated-video/segment-1.mp4`
   - `npm run render:with-audio ./output/animated-video/Segment1Component.tsx ./output/animated-video/segment-1-final.mp4 ./output/animated-video/segment-1-audio.mp3`
5. Optionally run a quick lint:
   - `npm run plan ./output/animated-video/video-segments.json`

---

## Notes on @contentfork/remotion-ui

- The npm package is a CLI for scaffolding components into your repo; it is not a runtime component library.
- This project already includes a local `remotion/ui-components` directory with components and schemas. Agents should use the local registry.

---

## Roadmap (Non‑blocking)

- Format‑aware presets (portrait/square/landscape) to replace raw width/height choices.
- Storybook dictionary for AI selection and prop exploration.
- Timeline helpers (Sequences + speech-mark alignment).
- Batch rendering and asset caching for scale.

---

Updated 2025‑09‑15

---

## Status Update — 2025‑09‑15

What improved
- Scene reveals align to scene‑relative cues; no invisible scenes.
- Baseline visuals added; every scene shows at least one readable element.
- Aspect applied end‑to‑end (tokens/safe areas/typography).
- Word budgets and lint gates enforced; render supports `--force`.
- Provenance captions render at cited cues; narration auto‑detected.

Still to do (choose A or B above)
- Layout shell, type scale enforcement, and theme packs (A).
- JSON Patch workflow, clip extraction, and caching polish (B).
