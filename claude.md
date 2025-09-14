Below is a **comprehensive PRD** you can hand to your agent to (1) review the existing Remotion-based tool and (2) update it to a **story‑first, VO‑led** system with **60–90s micro‑explainers** and **30s stand‑alone clips**, while preserving your ability to mass‑generate videos from whitepapers and transcripts.

---

# Product Requirements Document (PRD)

**Product:** VO‑Led Explainer & Clip Generator
**Owner:** \[You]
**Stakeholders:** Content/PMM, Demand Gen, Eng/ML, Design
**Goal:** Convert long‑form source content (whitepapers, webinars/podcasts) into **high‑polish, on‑brand videos** and **short social clips**, optimized for attention and clarity. The **voiceover (VO) is the spine**; visuals support the story.
**Non‑Goal:** Faithfully reproducing the source document structure or slideware aesthetics.

---

## 1) Objectives & Success Metrics

**Primary objectives**

1. **Story‑first output:** VO determines scene order, length, and reveals; source order is advisory.
2. **High visual polish:** Video-first design primitives, theme packs, and motion grammar (Gamma‑like quality without slideware).
3. **Short‑form formats:** Native support for **60–90s micro‑explainers** and **30s stand‑alone clips**.
4. **Deterministic corrections:** All edits as **JSON patches** (LLM‑friendly), stable IDs, reproducible renders.

**Success metrics (quantitative)**

* **Time to first cut:** ≤ 5 minutes from ingest to first render for a 90s piece (cold cache, standard hardware).
* **Revision efficiency:** ≥ 90% of common changes expressed as JSON patches (no code changes).
* **Completion rate:** ≥ 80% of scenes pass automated **narrative + design lints** on first run.
* **Engagement proxy:** For short‑form, median watch time ≥ 60% of duration; for micro‑explainer, ≥ 50%.
* **Brand consistency:** 100% captioned, WCAG AA contrast, provenance tags on all cited stats.

---

## 2) Scope

**In scope**

* Content ingestion (PDFs, transcripts), narrative synthesis, VO script, VO timing, scene JSON generation, Remotion render, captions/SRT, multi‑aspect outputs (16:9, 1:1, 9:16), provenance tags, pre‑render linters, JSON‑patch corrections, short‑form templates.

**Out of scope (v1)**

* Advanced scene editor UI; multi‑speaker lip‑sync; automatic stock/B‑roll licensing flows.

---

## 3) Users & Jobs-to-be-Done

* **PMM/Founder:** Needs a 60–90s explainer for a launch; can accept resequencing if story improves.
* **Social/Content Marketer:** Needs 30s clips from podcasts/webinars that stand alone on feeds.
* **Sales Enablement:** Needs case‑led micro‑explainers with one clear proof and CTA.

---

## 4) System Overview

**Pipeline (top‑level):**

1. **Ingest** → 2. **Narrative Brief** → 3. **VO Script (radio cut)** → 4. **TTS + Word/Sentence Timestamps** →
2. **Scene JSON (story roles + cues)** → 6. **Visual Plan (primitives + motion)** → 7. **Lints** → 8. **Render** → 9. **Review & Patch**

**Design Architecture:**

* **Tokens (foundation):** Adopt shadcn **tokens** (colors/spacing/typography) but **do not** reuse app UI components.
* **Primitives (video‑first):** `Surface`, `Stack/HStack/Grid`, `Text`, `Media`, `Shape`, `Callout`, `ChartFrame`.
* **Motion grammar:** Standardized entrances/exits, easings, cadence, camera drift.
* **Theme packs:** `GradientGlass`, `MinimalEditorial`, `KineticType`, `ProductDemo`. Switchable without content changes.

---

## 5) Functional Requirements

### 5.1 Ingestion

* Accept **PDF whitepapers** and **webinar/podcast transcripts** (with speaker/time metadata if available).
* Extract structured chunks: headings, paragraphs, tables/figures (whitepaper); segments, diarization, quotables (transcript).
* Produce a **Provenance Ledger** with stable IDs (`provId`) for citeable items (stat/quote/figure).

**Acceptance**

* Given a 20‑page PDF, the system returns ≥ 90% of headings and paragraphs with order preserved and a ledger of references.
* Given a transcript with timestamps, segments retain original timestamps (±1s).

### 5.2 Narrative Synthesis (Story‑first)

* Generate a **Narrative Brief**:

  * `controllingIdea`, `audienceChange`, `antagonist`, `stakes`, `promise`, `proofPillars[≤3]`, `nextStep`, `arc`.
* **Arcs supported:**

  * **Problem → Turn → Value/How → Proof → CTA** (default)
  * **Case‑led** (Outcome → Backstory → Intervention → Result → CTA)
  * **Monroe’s Motivated Sequence** (optional, keep in schema)
* **Allow resequencing** irrespective of source order.

**Acceptance**

* Brief contains ≤ 1 sentence per field; ≤ 3 proof pillars; any uncited claim is labeled “observation”.

### 5.3 VO Script (Radio Cut) & Timing

* Write VO **before** visuals; 105–120 wpm; average sentence length 16–20 words.
* Inject **evidence tokens** referencing `provId` in‑line (e.g., `[prov:s1]`).
* Produce **sentence‑onset cues** (ms) via TTS or alignment.
* Enforce **word budgets**:

  * **30s clip:** 47–55 words; max 3 sentences/scene.
  * **60–90s micro:**

    * 60s: 95–110 words
    * 75s: 115–130 words
    * 90s: 140–160 words

**Acceptance**

* Over‑budget scripts are rejected with a diff suggesting deletions until within budget.

### 5.4 Scene DSL (Data Model)

* Scenes have **story roles** and **voiceover cues**.
* Elements use **video primitives** only.

```ts
// Lint-clean TypeScript schema
export type Arc = 'ProblemTurnProof' | 'CaseLed' | 'MMS';

export interface StoryMeta {
  controllingIdea: string;
  arc: Arc;
  targetDurationSec: number;
  audience: string;
  allowResequence: true;
  provenance: { id: string; label: string; href?: string }[];
}

export type SceneRole =
  | 'HOOK' | 'PROBLEM' | 'TURN' | 'APPROACH' | 'PROCESS'
  | 'PROOF' | 'CASE' | 'QUOTE' | 'CTA' | 'OUTCOME' | 'BACKSTORY' | 'RESULT';

export interface Voiceover {
  text: string;        // full VO for the scene
  cues: number[];      // ms offsets for sentence starts
}

export type Element =
  | { kind: 'TEXT'; role: 'title'|'subtitle'|'body'|'caption'|'kicker'; text: string }
  | { kind: 'MEDIA'; src: string; fit?: 'cover'|'contain'; focalPoint?: { x: number; y: number }; mask?: 'rounded'|'device'|'circle'|'none' }
  | { kind: 'SHAPE'; shape: 'blob'|'bar'|'ring'|'underline'; seed?: number; opacity?: number; animate?: 'drift'|'pulse'|'wipe' }
  | { kind: 'CHART'; chart: 'bar'|'line'|'pie'|'metric'; data: unknown; emphasize?: number[] }
  | { kind: 'CALLOUT'; text: string };

export interface Scene {
  id: string;
  role: SceneRole;
  voiceover: Voiceover;
  visuals: Element[];
  evidence?: { provId: string; atCue: number }[]; // tie claims to on-screen moments
  motion?: 'standard'|'emphasis'|'gentle';
  accentColor?: string;
  durationMs?: number; // computed if omitted
}

export interface VideoDoc {
  story: StoryMeta;
  scenes: Scene[];
}
```

**Computation rule:** If `durationMs` missing, compute:

```
duration = clamp( words/target_wps*1000 + reveals*250 + 600 /*enter*/ + 350 /*exit*/, 2200, 6500 )
```

with `target_wps ≈ 1.83`.

**Acceptance**

* JSON validates via Zod; IDs stable across revisions; patching a scene by `id` does not reorder others.

### 5.5 Video Design System (VDS)

* **Tokens:** color palette (brand, accent, neutrals), type scale per aspect ratio, spacing scale, radii, shadows, blur levels, opacity steps, **safe areas**.
* **Theme Packs:** `GradientGlass`, `MinimalEditorial`, `KineticType`, `ProductDemo`.
* **No app UI components.** Only primitives above.

**Acceptance**

* Switching theme pack changes **style** without changing `VideoDoc` content.

### 5.6 Motion Grammar

* **Entrances:** fade+Y (24–36px), mask‑wipe, scale‑in (0.96→1.0) at 600–750ms.
* **Exits:** reverse; 250–350ms.
* **Easings:**

  * `standard`: cubic‑bezier(0.2, 0.8, 0.2, 1)
  * `emphasis`: (0.12, 0.9, 0.1, 1)
  * `gentle`: spring (low stiffness, damping 26–30)
* **Camera drift:** 1.02–1.06 scale over scene; optional parallax on background layers.
* **Reveal cadence:** tie to `voiceover.cues` ±120ms; ≤ 3 concurrent animations.

**Acceptance**

* Lint fails if > 3 concurrent animations or reveals not aligned within ±200ms of cues.

### 5.7 Templates & Formats

* **Micro‑explainer (60/75/90s) templates:**

  * Arc A: Problem → Turn → Value/How → Proof → CTA
  * Arc B: Case‑led: Outcome → Backstory → Intervention → Result → CTA
* **30s clip templates:**

  * T1 Quote, T2 Myth→Fact, T3 Number→Meaning, T4 Before→After, T5 Q→A.
* **Aspect presets:** 16:9, 1:1, 9:16 with adjusted safe areas and type scales.

**Acceptance**

* Rendering any template in all three aspects keeps text within safe areas; captions never collide with lower thirds.

### 5.8 Captions & Accessibility

* Burned‑in captions and exported `.srt`.
* Max 2 lines, ≤ 32 chars/line; line breaks at phrase boundaries.
* WCAG AA contrast for text overlays.

**Acceptance**

* Automated caption audit passes (length, contrast, collision).

### 5.9 Evidence & Provenance

* On‑screen **provenance tag** appears at or after `evidence.atCue`.
* Missing provenance downgrades the line from “stat” to “observation” or fails lint (configurable).

**Acceptance**

* Every `[prov:...]` in VO has a matching on‑screen tag; missing tags trigger lint failure.

### 5.10 Rendering & Performance

* Remotion renders from `VideoDoc` → JSX mapping; **no Tailwind class churn at runtime** (precomputed tokens).
* Render queue supports **batch** (multiple aspect ratios per job).
* Caching of TTS audio and resolved assets by content hash.

**Acceptance**

* Cold render of a 60s micro‑explainer completes within an acceptable budget on standard hardware; subsequent renders with no content change are cache hits for TTS and assets.

### 5.11 Lints & QA Gates (Blocking)

* **Narrative:** HOOK present; TURN by ≤ 40% runtime; CTA present (micro) or explicit takeaway (30s).
* **Pacing:** No scene > 28s (micro) or > 20s (30s); mean scene ≤ 15s.
* **Clarity:** Flesch‑Kincaid ≤ 9 (configurable by audience).
* **Design:** Contrast AA, safe areas; ≤ 1 accent color/scene; max concurrent animations ≤ 3.
* **Evidence:** All cited stats have provenance.
* **Captions:** Rules in §5.8.

**Acceptance**

* Renders are **blocked** when any lint fails; report enumerates violations with suggested fixes.

### 5.12 Podcast/Webinar Clip Extraction (30s)

* Compute **ClipScore** per segment:

```
ClipScore = 0.30*TurnDensity + 0.25*EvidencePresence + 0.20*SelfContainment
          + 0.15*ProsodyEnergy + 0.10*Memorability
```

* Reject if `SelfContainment < 0.6` or duration outside 24–33s.
* If no evidence, auto‑insert **micro‑setup** line ≤ 10 words.

**Acceptance**

* Top‑5 clips surfaced with filled template candidates (T1–T5) and VO within 47–55 words.

### 5.13 Corrections Flow (Deterministic)

* All edits as **RFC 6902 JSON Patch** against `VideoDoc`.
* Stable IDs; patches can target: VO text, cues, element text, data values, theme pack, accent color, timing offsets.

**Acceptance**

* Applying and reversing a patch yields identical renders (hash‑stable audio and JSON).

### 5.14 Configuration & Theming

* **Env/config:** brand colors, logo, font families (variable fonts preferred), default arc, default template, aspect ratios to render, caption styles.
* **Token inheritance** from shadcn Tailwind config → VDS tokens → Theme packs.

**Acceptance**

* Changing brand primary color updates theme packs without scene JSON edits.

### 5.15 Telemetry & Observability

* Capture: ingest time, synthesis time, lint failures, render time, cache hits, error traces.
* Optional: post‑publish engagement metrics ingestion (if available).

**Acceptance**

* Ops dashboard shows last 50 jobs with durations and failure reasons.

### 5.16 Security & Privacy

* Redact emails/API keys detected in source before VO/visuals.
* Configurable PII scrubber with allow‑list for case studies.

**Acceptance**

* Any detected secret/PII is masked; lints fail if PII remains.

---

## 6) Non‑Functional Requirements

* **Determinism:** Same `VideoDoc` + assets + theme → bit‑identical audio and JSON outputs.
* **Composability:** New theme packs and templates can be added with no changes to the DSL.
* **Portability:** Headless rendering usable via CLI/CI.

---

## 7) API/CLI (Minimal)

**CLI Targets**

* `ingest <path>` → `ingest.json` + `provenance.json`
* `synthesize --arc ProblemTurnProof --duration 60 <ingest.json>` → `brief.json`
* `script --budget 110 <brief.json>` → `vo.json`
* `plan <vo.json> <provenance.json>` → `videoDoc.json`
* `lint <videoDoc.json>` → non‑zero on failure
* `render --aspect 16:9,1:1,9:16 <videoDoc.json>`

**Acceptance**

* Each command exits non‑zero on failure with machine‑readable errors.

---

## 8) Review Checklist for Existing Tool (Gap Analysis)

* [ ] Does the current system generate a **radio‑first VO** and use cues to drive reveals?
* [ ] Are **short‑form budgets** enforced (word counts, scene caps)?
* [ ] Are **video‑first primitives** used (no app UI components)?
* [ ] Are **theme packs** decoupled from content JSON?
* [ ] Are **provenance tags** rendered in‑frame and tied to VO cues?
* [ ] Do **lints** block renders and provide actionable fixes?
* [ ] Is **JSON Patch** diffing used for deterministic corrections?
* [ ] Multi‑aspect rendering with safe‑area discipline?
* [ ] Caching of TTS audio and assets by content hash?

---

## 9) Rollout Plan (Phased)

**Phase 1 — Foundations**

* Implement VDS tokens, primitives, motion grammar, theme packs (1–2 to start).
* Add DSL + validators + JSON patching.
* Add lints (design + pacing + provenance).
* Map one **60s micro‑explainer** template; render in 16:9.

**Phase 2 — Short‑form & Multi‑Aspect**

* Add 30s templates (T1–T5).
* Add 1:1 and 9:16 with safe‑area tokens and caption rules.
* Clip extraction and ClipScore.

**Phase 3 — Ops & Polish**

* Telemetry dashboard; cache; batch rendering queue.
* Additional theme packs; animation polish (camera drift, parallax, mask wipes).
* Optional: lightweight web reviewer for apply/preview JSON patches.

---

## 10) Risks & Mitigations

* **VO alignment drift:** TTS timestamps may vary across providers → cache audio, pin engine/version, allow ±120ms nudge.
* **Theme overfitting:** One theme fits all poorly → enforce theme packs; allow per‑scene accent override only.
* **Evidence gaps:** Missing provenance → downgrade claims or block render; provide editor hints.

---

## 11) Open Questions (for Agent to resolve)

1. Which TTS engine/version will be standardized for deterministic cues?
2. Do we need multilingual captions/VO in v1?
3. Are there licensed brand fonts, or must we default to open‑source variable families?
4. Who owns the provenance sources and link hygiene?
5. Required export codecs/bitrates per channel (YouTube, LinkedIn, TikTok)?

---

## 12) Acceptance Test Matrix (Representative)

| ID    | Scenario                    | Input                                 | Expected                                                                  |
| ----- | --------------------------- | ------------------------------------- | ------------------------------------------------------------------------- |
| AT‑01 | 60s micro‑explainer renders | Whitepaper + brand tokens             | VideoDoc passes lints; 3 aspect outputs; provenance visible on stat scene |
| AT‑02 | Over‑budget VO              | 180 words for 60s                     | Build fails with budget error; suggests deletions                         |
| AT‑03 | 30s clip extraction         | 45‑min podcast transcript             | Top‑5 clips (24–33s); chosen template populated; captions present         |
| AT‑04 | Missing provenance          | VO includes `[prov:s1]` not in ledger | Lint failure with pointer to scene/cue                                    |
| AT‑05 | Patch determinism           | Apply + revert JSON patch             | Hash of outputs equals baseline                                           |
| AT‑06 | Safe‑area guard             | 9:16 render with long caption         | Caption reflows; no collision; contrast AA                                |

---

## 13) Appendices

### A) Short‑Form Budgets & Lints (machine‑readable)

```json
{
  "budgets": {
    "clip30": { "wordsMax": 55, "sceneMaxSec": 20, "animConcurrentMax": 3 },
    "micro60": { "wordsMax": 110, "sceneMaxSec": 28, "animConcurrentMax": 3 },
    "micro75": { "wordsMax": 130, "sceneMaxSec": 28, "animConcurrentMax": 3 },
    "micro90": { "wordsMax": 160, "sceneMaxSec": 28, "animConcurrentMax": 3 }
  },
  "lints": {
    "narrative": ["hook", "turnBy40Pct", "ctaOrTakeaway"],
    "design": ["contrastAA", "safeAreas", "accentPerScene<=1", "concurrentAnims<=3"],
    "evidence": ["provTagForEveryProvToken"],
    "captions": ["max2Lines", "max32CharsPerLine", "noLowerThirdCollision"]
  }
}
```

### B) Example VideoDoc (60s Micro‑Explainer)

```json
{
  "story": {
    "controllingIdea": "Route by impact to turn noise into measurable wins.",
    "arc": "ProblemTurnProof",
    "targetDurationSec": 60,
    "audience": "exec",
    "allowResequence": true,
    "provenance": [
      {"id":"s1","label":"Ops Benchmarks 2024"},
      {"id":"s2","label":"Case: MidCo"}
    ]
  },
  "scenes": [
    {
      "id":"hook",
      "role":"HOOK",
      "voiceover":{"text":"You’re not short on data. You’re short on signal.","cues":[0]},
      "visuals":[{"kind":"TEXT","role":"title","text":"From data to signal"}],
      "durationMs":6000
    },
    {
      "id":"problem",
      "role":"PROBLEM",
      "voiceover":{"text":"Teams chase alerts. The expensive issues slip through. Last year, major incidents took weeks and six figures. [prov:s1]","cues":[0,2300,4700]},
      "visuals":[
        {"kind":"CHART","chart":"bar","data":{"labels":["Minor","Major"],"values":[12,96]},"emphasize":[1]},
        {"kind":"TEXT","role":"caption","text":"Ops Benchmarks 2024"}
      ],
      "evidence":[{"provId":"s1","atCue":2}]
    },
    {
      "id":"turn",
      "role":"TURN",
      "voiceover":{"text":"The turn is simple: score impact first, then spend time.","cues":[0]},
      "visuals":[{"kind":"SHAPE","shape":"bar","animate":"wipe"}]
    },
    {
      "id":"process",
      "role":"PROCESS",
      "voiceover":{"text":"Here’s how: one, quantify risk in dollars. Two, route by impact. Three, prove savings.","cues":[0,2100,4300]},
      "visuals":[
        {"kind":"CALLOUT","text":"$‑risk"},
        {"kind":"CALLOUT","text":"Impact routing"},
        {"kind":"CALLOUT","text":"Proof of savings"}
      ]
    },
    {
      "id":"proof",
      "role":"PROOF",
      "voiceover":{"text":"MidCo cut resolve time by thirty percent in one quarter. [prov:s2]","cues":[0]},
      "visuals":[
        {"kind":"CHART","chart":"metric","data":{"label":"TTR","value":"−30%"}},
        {"kind":"TEXT","role":"caption","text":"Case: MidCo"}
      ],
      "evidence":[{"provId":"s2","atCue":0}]
    },
    {
      "id":"cta",
      "role":"CTA",
      "voiceover":{"text":"See where your time pays off. Take the two‑minute assessment.","cues":[0]},
      "visuals":[
        {"kind":"TEXT","role":"title","text":"Start the 2‑minute assessment"},
        {"kind":"TEXT","role":"caption","text":"example.com/assessment"}
      ]
    }
  ]
}
```

### C) ESLint/TS Guidelines (for any new code)

* **TypeScript strict mode** on; no `any` in exported types.
* **No implicit `any`**, **no unused vars**, **no default export** for schema modules.
* Enforce Prettier defaults; ensure **named exports** for primitives and theme packs.

### D) Prompt Scaffolds (LLM)

1. **Narrative Brief** → compact JSON with controlling idea, proof pillars (≤3), arc.
2. **VO Script** → split into scenes, mark sentence boundaries with `|`, include `[prov:id]`.
3. **Visual Mapping** → assign primitives, ensure reveals at `cues`, limit concurrent animations.
4. **Fixes** → always return RFC 6902 JSON patches targeting `VideoDoc`.

---

## 14) Definition of Done (DoD)

* **Functionally complete:** All FRs in §5 implemented; templates render in three aspects; lints block bad outputs.
* **Quality gates:** 10‑item acceptance matrix passes; automated tests for schema validation and lint checks.
* **Docs:** README for CLI; schema reference; examples for micro‑explainer and 30s clip.
* **Ops:** Telemetry dashboard shows job status; cache in place; reproducible renders.

---

### Final Note for the Agent

Start with **Phase 1 foundations** (VDS, DSL, motion grammar, lints, one 60s template). Ensure **VO‑led** timing drives all reveals. Build JSON‑patch corrections early to keep iteration cheap. Then add **30s clip extraction** and multi‑aspect outputs.

If you want me to tailor this PRD to your current repo (file layout, modules, and specific gaps), share the existing structure and I’ll produce a targeted delta plan with precise refactors and task breakdown.
