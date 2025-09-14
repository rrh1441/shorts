#!/usr/bin/env tsx

/**
 * Plan / Lint a video spec or generated segments
 * - If a spec path is provided, validates structure and prints summary
 * - If not, tries to read ./output/animated-video/video-segments.json
 * Outputs a basic lint report to ./output/lint-report.json
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { VisualPlanSchema } from '../shared/visual-plan';

type Scene = {
  sceneNumber: number;
  duration: number; // seconds
  purpose?: string;
  visualType?: string;
  content?: string;
};

async function loadJson(maybePath?: string): Promise<{ scenes: Scene[]; [k: string]: any }> {
  const defaultPath = path.join(process.cwd(), 'output/animated-video/video-segments.json');
  const target = maybePath ? path.resolve(maybePath) : defaultPath;
  const raw = await fs.readFile(target, 'utf-8');
  return JSON.parse(raw);
}

function lintScenes(scenes: Scene[]) {
  const issues: string[] = [];
  const warnings: string[] = [];

  if (!Array.isArray(scenes) || scenes.length === 0) {
    issues.push('No scenes found.');
    return { issues, warnings };
  }

  if (scenes.length < 3) warnings.push('Fewer than 3 scenes; narrative may feel thin.');
  if (scenes.length > 8) warnings.push('More than 8 scenes; consider trimming for pace.');

  for (const s of scenes) {
    if (!s.duration || s.duration <= 0) issues.push(`Scene ${s.sceneNumber}: duration must be > 0s.`);
    if (s.duration && (s.duration < 4 || s.duration > 20)) warnings.push(`Scene ${s.sceneNumber}: duration ${s.duration}s atypical (aim 6–15s).`);
    if (!s.content) warnings.push(`Scene ${s.sceneNumber}: missing content.`);
    if (!s.visualType) warnings.push(`Scene ${s.sceneNumber}: missing visualType.`);
  }

  return { issues, warnings };
}

function lintVisualPlan(plan: any) {
  const issues: string[] = [];
  const warnings: string[] = [];
  try {
    const parsed = VisualPlanSchema.parse(plan);
    // Guardrails (non-prescriptive): density, text budget, duration
    parsed.beats.forEach((b, i) => {
      const idx = i + 1;
      if (b.durationSec < 3) warnings.push(`Beat ${idx}: duration ${b.durationSec}s is short (<3s).`);
      if (b.durationSec > 20) warnings.push(`Beat ${idx}: duration ${b.durationSec}s is long (>20s).`);
      // Text budget
      const labels = b.anchors?.labels?.length || 0;
      const title = b.anchors?.title?.length || 0;
      const sub = b.anchors?.sub?.length || 0;
      const metric = b.anchors?.metric ? 1 : 0;
      const chart = b.anchors?.chartData ? 1 : 0;
      const focalCount = (metric ? 1 : 0) + (chart ? 1 : 0) + (labels > 0 ? 1 : 0) + (title ? 1 : 0);
      if (focalCount > 3) issues.push(`Beat ${idx}: too many focal anchors (${focalCount} > 3).`);
      if (labels > 4) warnings.push(`Beat ${idx}: labels > 4 may be dense.`);
      if (title > 60) warnings.push(`Beat ${idx}: title is long (>60 chars).`);
      if (sub > 90) warnings.push(`Beat ${idx}: sub is long (>90 chars).`);
    });
    return { issues, warnings, ok: issues.length === 0 };
  } catch (e: any) {
    issues.push(`VisualPlan invalid: ${e?.message || String(e)}`);
    return { issues, warnings, ok: false };
  }
}

async function writeReport(report: any) {
  const outDir = path.join(process.cwd(), 'output');
  await fs.mkdir(outDir, { recursive: true });
  const file = path.join(outDir, 'lint-report.json');
  await fs.writeFile(file, JSON.stringify(report, null, 2));
  return file;
}

async function main() {
  const specPath = process.argv[2];
  try {
    const data = await loadJson(specPath);
    const scenes: Scene[] = data.scenes ?? data.narrative?.scenes ?? [];
    let issues: string[] = [];
    let warnings: string[] = [];
    if (Array.isArray(scenes) && scenes.length) {
      const r = lintScenes(scenes);
      issues = issues.concat(r.issues);
      warnings = warnings.concat(r.warnings);
    }
    if (data.visualPlan) {
      const r2 = lintVisualPlan(data.visualPlan);
      issues = issues.concat(r2.issues);
      warnings = warnings.concat(r2.warnings);
    }

    const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 0), 0);
    const report = {
      ok: issues.length === 0,
      summary: {
        scenes: scenes.length,
        totalDurationSeconds: totalDuration,
        hasVisualPlan: Boolean(data.visualPlan),
      },
      issues,
      warnings,
    };

    const pathOut = await writeReport(report);
    console.log('Plan check complete');
    console.log(`Scenes: ${scenes.length}, Total: ${totalDuration}s`);
    console.log(`Report: ${pathOut}`);
    if (issues.length) process.exitCode = 1;
  } catch (err: any) {
    console.error('Plan failed:', err?.message || err);
    process.exit(1);
  }
}

main();
