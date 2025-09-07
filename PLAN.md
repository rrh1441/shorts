# Execution Plan — Dynamic, Concept‑Driven Video Components

Goals
- Dynamic visuals: Each beat is expressed by an animated, non‑interactive React component. No transcripts on screen; visuals anchor the VO.
- Minimal constraints: Let the model invent the metaphor and motion; we enforce only window fit, readability, determinism.
- Deterministic pipeline: Format‑aware sizing, safe margins, repeatable timing; guardrails catch illegible/busy results before render.

VisualPlan (Per‑Beat Contract)
- component: "auto" | SectionTitle | QuoteBlock | BulletList | StatCard | Figure | Chart | TransitionCard | ExternalReact
- concept: short string (what this beat conveys)
- styleLane: "documentary" | "product" | "electric" (cohesion hint; optional)
- anchors: { title?: string; sub?: string; labels?: string[]; metric?: { value: string; label: string }; chartData?: { label: string; value: number }[] }
- motion: { introFrames: number; revealFrames: number; holdFrames: number; variant?: string }
- external?: { source: 'v0' | 'raw'; code?: string; cssAllowed?: boolean }
- format: 'horizontal' | 'vertical' | 'square'; durationSec: number; gutters: boolean

Generator Loop (LLM‑first, non‑prescriptive)
1) Brief per beat (inputs):
   - Concept (1 sentence)
   - Window (W×H)
   - Style lane (optional, 1–2 words)
   - Allow up to two strong sentences (no paragraphs)
2) Generate 2–3 variants → choose strongest.
3) If Section components suffice → emit anchors only; else emit ExternalReact (self‑contained component).

ExternalReact Adapter (CSS→Remotion “fit” pass)
- Normalize timing: map CSS keyframes to frames at 30fps; intro ≤ 0.5s; 1–2 distinct motions; end with a hold.
- Fit to window: scale/position to 1920×1080 (or target format); enforce ≥3% gutters; prevent edge clipping.
- Determinism: strip randomness; forbid event‑driven motion; keep animation code otherwise intact.
- Text budget: ≤2 strong sentences; clamp font sizes to readable tokens; no paragraph blocks.
- Reject on: >2 concurrent animations; dense particle/texture fields; illegible contrast; empty first 500ms.

Guardrails (Non‑prescriptive, enforced)
- Clarity: one idea visible within 0.5s; ≥50% negative space.
- Density: ≤3 focal elements; ≤2 simultaneous animations.
- Palette: 1 background, 1 accent, 1 neutral (per slide).
- Fit: safe margins; no clipping; legible at 1080p.
- Deterministic: identical renders across runs.

Style Lanes (Cohesion)
- Documentary Minimal: black/white, high contrast, subtle underline/line accents.
- Product Keynote: white/black with 1 accent; clean cards, soft shadows.
- Electric Tech: deep navy + electric accents; subtle grid/lines; kinetic.

Milestones & Definition of Done (DoD)
Week 1–2 — System Core
- Tokens & motion grammar locked; used by 100% primitives. DoD: audits show no raw px/hex in primitives.
- Layout primitives (Stack/Box/Grid) with safe‑area overlays. DoD: stage renders only via primitives.
- Components v1: SectionTitle, QuoteBlock, BulletList, StatCard. DoD: pass guardrails + zod validation.
- VisualPlan v1: zod schema + examples for 10 beats. DoD: editor/renderer round‑trip JSON.

Week 3–4 — Data & Motion Depth
- Figure (focal‑point crop), Chart (bar/line with label rules). DoD: auto labels; gutters respected.
- TransitionCard (2 branded transitions). DoD: deterministic timings; no random effects.
- Editor panels + timeline mini‑bars (stagger in frame steps). DoD: live stage reflects controls.
- Generator adapter alpha: ExternalReact path (v0‑style). DoD: drop a generated component, auto‑fit, render.

Week 5 — Integration & QA
- VO sync (optional): map SRT/word times to holds/reveals. DoD: at least one scene demonstrates sync.
- Export presets (1080p/30, 4K/30, vertical). DoD: batch render completes with zero guardrail errors.
- QA pipeline: legibility + density + clipping + blank‑frame checks. DoD: 90% of test scenes pass first try.

Immediate Actions (This Repo)
- Add VisualPlan schema + ExternalReact adapter stub.
- Adopt generator brief that allows strong sentences (no prescriptive shapes); generate 2 variants per beat.
- Integrate Segment 1 via ExternalReact (fit + timing only) and scale to next 4 beats.
- Wire guardrail checks (legibility/density/margins) into “plan” script as a pre‑render gate.

Decision Rights
- Creative: LLM selects metaphor, shapes, motion; we select variants.
- Engineering: Fit/timing/determinism/margins enforced by adapter; visual feel unchanged.

