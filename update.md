# Implementation Update Plan: VO-Led Explainer & Clip Generator

## Executive Summary

This plan transforms the existing Remotion-based video generator into a **story-first, VO-led system** for creating **60-90s micro-explainers** and **30s social clips**. The system will prioritize voiceover timing as the spine of the video, with visuals supporting the narrative rather than driving it.

## Current State Analysis

### Existing Strengths
- ✅ Remotion pipeline established with component generation
- ✅ TTS integration via OpenAI
- ✅ Multi-format support (vertical/square/horizontal)
- ✅ Component orchestrator with pattern mapping
- ✅ Visual plan schema with beat-based structure
- ✅ Basic linting infrastructure in place

### Critical Gaps (vs PRD Requirements)

| Requirement | Current State | Gap |
|------------|--------------|-----|
| **Radio-first VO** | Script generated after visuals | VO must drive timing/reveals |
| **Word budgets** | No enforcement | Need strict 30s/60s/75s/90s limits |
| **Video primitives** | Mixed UI/video components | Need pure video-first primitives |
| **Theme packs** | Hardcoded styles | Need swappable theme system |
| **Provenance tags** | Not implemented | Need citation tracking |
| **JSON Patch edits** | Not implemented | Need deterministic corrections |
| **Narrative lints** | Basic duration checks | Need story structure validation |
| **Clip extraction** | Manual process | Need automated ClipScore |
| **Safe areas** | Not enforced | Need aspect-aware margins |
| **Captions** | Not implemented | Need burned-in + SRT |

## Implementation Phases

### Phase 1: Foundations (Weeks 1-2)
**Goal:** Establish VO-led architecture with video-first primitives

#### 1.1 VO-First Pipeline Refactor
```
Current: Insights → Visuals → Script → TTS
Target:  Insights → Brief → VO Script → TTS/Timing → Scene JSON → Visuals
```

**Tasks:**
- [ ] Create `NarrativeBrief` generator with arc selection
- [ ] Implement `VOScript` generator with word budgets
- [ ] Add sentence-level timing extraction from TTS
- [ ] Refactor scene generation to use VO cues

**New Files:**
- `shared/narrative-brief.ts` - Brief schema and generator
- `shared/vo-script.ts` - VO writing with evidence tokens
- `shared/tts-timing.ts` - Extract word/sentence timestamps
- `shared/scene-dsl.ts` - New scene schema (per PRD §5.4)

#### 1.2 Video Design System (VDS)
**Tasks:**
- [ ] Extract tokens from shadcn config (no UI components)
- [ ] Create video-first primitives
- [ ] Implement motion grammar
- [ ] Add theme pack infrastructure

**New Files:**
- `vds/tokens.ts` - Color, spacing, typography tokens
- `vds/primitives/` - Surface, Stack, Text, Media, Shape, Callout, ChartFrame
- `vds/motion.ts` - Entrance/exit/easing definitions
- `vds/themes/` - GradientGlass, MinimalEditorial themes

#### 1.3 Scene DSL & Validators
**Tasks:**
- [ ] Implement TypeScript schema from PRD §5.4
- [ ] Add Zod validators with stable IDs
- [ ] Create scene-to-Remotion mapper
- [ ] Add duration computation logic

**Files to Update:**
- `shared/visual-plan.ts` → Migrate to new `VideoDoc` schema
- `scripts/plan.ts` → Add new lint rules

### Phase 2: Short-Form & Multi-Aspect (Weeks 3-4)
**Goal:** Add 30s clips, multi-aspect rendering, and linting

#### 2.1 Templates & Formats
**Tasks:**
- [ ] Implement 60/75/90s micro-explainer templates
- [ ] Add 30s clip templates (T1-T5)
- [ ] Create aspect-aware safe areas
- [ ] Add caption generation

**New Files:**
- `templates/micro-explainer.ts` - Arc A & B templates
- `templates/clips.ts` - T1-T5 short templates
- `shared/safe-areas.ts` - Aspect ratio constraints
- `shared/captions.ts` - Caption generation/SRT export

#### 2.2 Linting & QA Gates
**Tasks:**
- [ ] Implement narrative lints (HOOK/TURN/CTA)
- [ ] Add pacing lints (scene duration limits)
- [ ] Create design lints (contrast/animations)
- [ ] Add evidence/provenance validation

**Files to Update:**
- `scripts/plan.ts` → Full lint implementation
- `shared/qa-preflight.ts` → Expand checks

#### 2.3 Clip Extraction
**Tasks:**
- [ ] Implement ClipScore algorithm
- [ ] Add self-containment check
- [ ] Create micro-setup injector
- [ ] Build clip template matcher

**New Files:**
- `scripts/extract-clips.ts` - Clip extraction pipeline
- `shared/clip-score.ts` - Scoring algorithm

### Phase 3: Operations & Polish (Weeks 5-6)
**Goal:** Add corrections, caching, and production features

#### 3.1 JSON Patch Corrections
**Tasks:**
- [ ] Implement RFC 6902 JSON Patch support
- [ ] Add patch validation/reversal
- [ ] Create correction UI helpers
- [ ] Ensure deterministic renders

**New Files:**
- `shared/json-patch.ts` - Patch operations
- `scripts/apply-patch.ts` - CLI for corrections

#### 3.2 Performance & Caching
**Tasks:**
- [ ] Add TTS audio caching by hash
- [ ] Implement asset caching
- [ ] Create batch render queue
- [ ] Add telemetry collection

**New Files:**
- `cache/` - Caching infrastructure
- `shared/telemetry.ts` - Job tracking

#### 3.3 Production Features
**Tasks:**
- [ ] Add provenance tag rendering
- [ ] Implement PII detection/redaction
- [ ] Create export presets
- [ ] Add dashboard/monitoring

## Migration Strategy

### Step 1: Parallel Development
- Keep existing pipeline functional
- Build new VO-led pipeline alongside
- Use feature flags to switch between old/new

### Step 2: Component Migration
```typescript
// Old component (UI-based)
import { CalloutBox } from '@contentfork/remotion-ui';

// New primitive (video-first)
import { Callout } from '../vds/primitives';
```

### Step 3: Data Migration
```typescript
// Migration script
function migrateToVideoDoc(oldScene: any): Scene {
  return {
    id: generateStableId(oldScene),
    role: mapToSceneRole(oldScene.visualType),
    voiceover: {
      text: oldScene.ttsScript,
      cues: extractCues(oldScene.timing)
    },
    visuals: mapToElements(oldScene.visualElements)
  };
}
```

## File Structure (Target)

```
shorts/
├── vds/                    # Video Design System
│   ├── tokens.ts
│   ├── primitives/
│   ├── motion.ts
│   └── themes/
├── templates/              # Scene templates
│   ├── micro-explainer.ts
│   └── clips.ts
├── shared/
│   ├── narrative-brief.ts  # Story synthesis
│   ├── vo-script.ts       # VO generation
│   ├── scene-dsl.ts       # VideoDoc schema
│   ├── tts-timing.ts      # Timing extraction
│   ├── captions.ts        # Caption generation
│   ├── clip-score.ts      # Clip extraction
│   ├── json-patch.ts      # Corrections
│   └── safe-areas.ts      # Aspect constraints
├── scripts/
│   ├── ingest.ts          # Content ingestion
│   ├── synthesize.ts      # Brief generation
│   ├── script.ts          # VO writing
│   ├── plan.ts            # Linting (enhanced)
│   ├── render.ts          # Multi-aspect render
│   ├── extract-clips.ts   # Clip extraction
│   └── apply-patch.ts     # Corrections
└── cache/                  # TTS/asset caching
```

## CLI Commands (New)

```bash
# New VO-led pipeline
npm run ingest whitepaper.pdf              # → ingest.json + provenance.json
npm run synthesize --arc ProblemTurnProof  # → brief.json
npm run script --budget 110                # → vo.json
npm run plan                               # → videoDoc.json (with lints)
npm run render --aspect 16:9,1:1,9:16      # → MP4s + SRT

# Clip extraction
npm run extract-clips transcript.json      # → top-5-clips.json

# Corrections
npm run patch videoDoc.json patch.json     # → videoDoc-patched.json
```

## Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Time to first cut | ≤ 5 min | Pipeline execution time |
| Revision efficiency | ≥ 90% via JSON | Patch success rate |
| Lint pass rate | ≥ 80% first run | Automated tracking |
| Word budget compliance | 100% | Script validation |
| Caption coverage | 100% | SRT generation |

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| TTS timing drift | Cache audio, pin OpenAI model version |
| Breaking changes | Feature flags, parallel pipelines |
| Performance regression | Benchmark before/after each phase |
| Theme inconsistency | Strict token inheritance |

## Immediate Actions (Week 1)

1. **Monday-Tuesday:** 
   - Set up new file structure
   - Create `NarrativeBrief` and `VOScript` generators
   - Implement word budget enforcement

2. **Wednesday-Thursday:**
   - Build VDS tokens and first 2 primitives
   - Create `VideoDoc` schema with validators
   - Wire up VO-to-scene timing

3. **Friday:**
   - Implement first micro-explainer template
   - Add narrative lints to plan.ts
   - Test end-to-end with 60s video

## Definition of Done

Phase 1 complete when:
- [ ] 60s video renders with VO-led timing
- [ ] Word budgets enforced (reject if over)
- [ ] 2+ theme packs switchable
- [ ] Narrative lints block bad structure
- [ ] All scenes use video primitives only

Phase 2 complete when:
- [ ] 30s clips extract with ClipScore
- [ ] 3 aspects render with safe areas
- [ ] Captions generated (burned + SRT)
- [ ] All lints operational and blocking

Phase 3 complete when:
- [ ] JSON patches work deterministically
- [ ] TTS/assets cached by hash
- [ ] Provenance tags render on-screen
- [ ] Telemetry dashboard operational

## Notes for Implementation

- **Prioritize determinism:** Same inputs must produce identical outputs
- **VO is king:** Never let visuals override VO timing
- **Fail fast:** Lints should catch issues before expensive renders
- **Cache aggressively:** TTS and assets are expensive to regenerate
- **Document patterns:** Each primitive needs usage examples

---

*This plan provides a clear path from the current state to the PRD requirements. Start with Phase 1 foundations to establish the VO-led architecture, then layer in short-form features and production capabilities.*