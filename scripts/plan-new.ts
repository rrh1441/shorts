#!/usr/bin/env tsx

/**
 * Enhanced plan script with comprehensive linting for VO-led pipeline
 * Input: vo.json + provenance.json
 * Output: videoDoc.json + lint report
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import dotenv from 'dotenv';
import { VideoDocGenerator, VideoDocSchema, VideoDoc } from '../shared/scene-dsl';
import { TTSTimingExtractor } from '../shared/tts-timing';

dotenv.config();

interface LintResult {
  category: string;
  rule: string;
  severity: 'error' | 'warning';
  message: string;
  sceneId?: string;
  suggestion?: string;
}

class EnhancedVideoLinter {
  
  /**
   * Run comprehensive lints on VideoDoc
   */
  lint(videoDoc: VideoDoc): {
    passed: boolean;
    errors: LintResult[];
    warnings: LintResult[];
    summary: string;
  } {
    const results: LintResult[] = [];
    
    // Narrative lints
    results.push(...this.lintNarrative(videoDoc));
    
    // Pacing lints  
    results.push(...this.lintPacing(videoDoc));
    
    // Design lints
    results.push(...this.lintDesign(videoDoc));
    
    // Evidence lints
    results.push(...this.lintEvidence(videoDoc));
    
    // Accessibility lints
    results.push(...this.lintAccessibility(videoDoc));
    
    const errors = results.filter(r => r.severity === 'error');
    const warnings = results.filter(r => r.severity === 'warning');
    
    return {
      passed: errors.length === 0,
      errors,
      warnings,
      summary: this.generateSummary(videoDoc, errors, warnings)
    };
  }
  
  private lintNarrative(videoDoc: VideoDoc): LintResult[] {
    const results: LintResult[] = [];
    const { story, scenes } = videoDoc;
    
    // Check for HOOK scene
    const hasHook = scenes.some(s => s.role === 'HOOK');
    if (!hasHook) {
      results.push({
        category: 'narrative',
        rule: 'hook_required',
        severity: 'error',
        message: 'Missing HOOK scene to capture attention',
        suggestion: 'Add opening scene with attention-grabbing statement'
      });
    }
    
    // Check TURN timing (must appear by 40% of runtime)
    const turnIndex = scenes.findIndex(s => s.role === 'TURN');
    const totalDuration = scenes.reduce((sum, s) => sum + (s.durationMs || 0), 0);
    
    if (turnIndex >= 0) {
      const turnTime = scenes.slice(0, turnIndex + 1).reduce((sum, s) => sum + (s.durationMs || 0), 0);
      const turnPercent = turnTime / totalDuration;
      
      if (turnPercent > 0.4) {
        results.push({
          category: 'narrative',
          rule: 'turn_timing',
          severity: 'warning',
          message: `TURN appears at ${Math.round(turnPercent * 100)}% (should be ≤40%)`,
          sceneId: scenes[turnIndex].id,
          suggestion: 'Move TURN scene earlier or trim preceding scenes'
        });
      }
    } else {
      results.push({
        category: 'narrative',
        rule: 'turn_required',
        severity: 'error',
        message: 'Missing TURN scene (key insight or pivot)',
        suggestion: 'Add scene presenting the key insight or solution'
      });
    }
    
    // Check for CTA or explicit takeaway
    const hasCTA = scenes.some(s => s.role === 'CTA');
    const hasExplicitEnd = scenes[scenes.length - 1]?.voiceover.text.includes('next') ||
                          scenes[scenes.length - 1]?.voiceover.text.includes('start') ||
                          scenes[scenes.length - 1]?.voiceover.text.includes('begin');
    
    if (!hasCTA && !hasExplicitEnd) {
      results.push({
        category: 'narrative',
        rule: 'cta_required',
        severity: 'error',
        message: 'Missing clear call-to-action or next step',
        sceneId: scenes[scenes.length - 1]?.id,
        suggestion: 'Add explicit next step or call-to-action'
      });
    }
    
    return results;
  }
  
  private lintPacing(videoDoc: VideoDoc): LintResult[] {
    const results: LintResult[] = [];
    const { scenes, story } = videoDoc;
    
    const isClip = story.targetDurationSec <= 30;
    const maxSceneDuration = isClip ? 20 : 28; // seconds
    
    scenes.forEach(scene => {
      const durationSec = (scene.durationMs || 0) / 1000;
      
      if (durationSec > maxSceneDuration) {
        results.push({
          category: 'pacing',
          rule: 'scene_duration',
          severity: 'error',
          message: `Scene duration ${durationSec.toFixed(1)}s exceeds limit (${maxSceneDuration}s)`,
          sceneId: scene.id,
          suggestion: 'Split scene or trim content to improve pacing'
        });
      }
      
      if (durationSec < 3) {
        results.push({
          category: 'pacing',
          rule: 'scene_minimum',
          severity: 'warning',
          message: `Scene duration ${durationSec.toFixed(1)}s is very short (<3s)`,
          sceneId: scene.id,
          suggestion: 'Consider combining with adjacent scene'
        });
      }
    });
    
    // Check mean scene duration
    const totalDuration = scenes.reduce((sum, s) => sum + (s.durationMs || 0), 0) / 1000;
    const meanDuration = totalDuration / scenes.length;
    
    if (meanDuration > 15) {
      results.push({
        category: 'pacing',
        rule: 'mean_duration',
        severity: 'warning',
        message: `Average scene duration ${meanDuration.toFixed(1)}s is long (target ≤15s)`,
        suggestion: 'Reduce scene length for better pacing'
      });
    }
    
    return results;
  }
  
  private lintDesign(videoDoc: VideoDoc): LintResult[] {
    const results: LintResult[] = [];
    const { scenes } = videoDoc;
    
    scenes.forEach(scene => {
      // Check focal element density
      const focalElements = scene.visuals.filter(v => 
        v.kind === 'CHART' || v.kind === 'MEDIA' || 
        (v.kind === 'TEXT' && v.role === 'title')
      );
      
      if (focalElements.length > 3) {
        results.push({
          category: 'design',
          rule: 'focal_density',
          severity: 'error',
          message: `Too many focal elements (${focalElements.length} > 3)`,
          sceneId: scene.id,
          suggestion: 'Reduce to max 3 focal elements per scene'
        });
      }
      
      // Check accent color consistency (max 1 per scene)
      const accentCount = scene.visuals.filter(v => 
        (v.kind === 'SHAPE' && v.animate) ||
        (v.kind === 'CALLOUT') ||
        (v.kind === 'CHART' && v.emphasize)
      ).length;
      
      if (accentCount > 1 && !scene.accentColor) {
        results.push({
          category: 'design',
          rule: 'accent_consistency',
          severity: 'warning',
          message: 'Multiple accent elements without unified color',
          sceneId: scene.id,
          suggestion: 'Set consistent accentColor for scene'
        });
      }
      
      // Check text density
      const textElements = scene.visuals.filter(v => v.kind === 'TEXT');
      const totalTextLength = textElements.reduce((sum, t) => 
        sum + (t.kind === 'TEXT' ? t.text.length : 0), 0);
      
      if (totalTextLength > 200) {
        results.push({
          category: 'design',
          rule: 'text_density',
          severity: 'warning',
          message: `High text density (${totalTextLength} chars)`,
          sceneId: scene.id,
          suggestion: 'Reduce text or split across multiple scenes'
        });
      }
    });
    
    return results;
  }
  
  private lintEvidence(videoDoc: VideoDoc): LintResult[] {
    const results: LintResult[] = [];
    const { scenes, story } = videoDoc;
    
    // Check provenance coverage
    scenes.forEach(scene => {
      const voText = scene.voiceover.text;
      const provTokens = voText.match(/\[prov:[^\]]+\]/g) || [];
      const evidenceCount = scene.evidence?.length || 0;
      
      if (provTokens.length !== evidenceCount) {
        results.push({
          category: 'evidence',
          rule: 'provenance_mismatch',
          severity: 'error',
          message: `VO has ${provTokens.length} prov tokens but ${evidenceCount} evidence entries`,
          sceneId: scene.id,
          suggestion: 'Ensure each [prov:...] token has matching evidence entry'
        });
      }
      
      // Check that evidence appears at valid cue times
      scene.evidence?.forEach(evidence => {
        if (evidence.atCue >= scene.voiceover.cues.length) {
          results.push({
            category: 'evidence',
            rule: 'evidence_timing',
            severity: 'error',
            message: `Evidence cue ${evidence.atCue} exceeds available cues (${scene.voiceover.cues.length})`,
            sceneId: scene.id,
            suggestion: 'Adjust evidence.atCue to valid cue index'
          });
        }
      });
    });
    
    return results;
  }
  
  private lintAccessibility(videoDoc: VideoDoc): LintResult[] {
    const results: LintResult[] = [];
    const { scenes } = videoDoc;
    
    scenes.forEach(scene => {
      // Check for alt text on media
      scene.visuals.forEach((visual, i) => {
        if (visual.kind === 'MEDIA' && !visual.src.includes('alt')) {
          results.push({
            category: 'accessibility',
            rule: 'media_alt_text',
            severity: 'warning',
            message: `Media element ${i + 1} may lack alt text`,
            sceneId: scene.id,
            suggestion: 'Ensure media has descriptive alt text'
          });
        }
      });
      
      // Check color contrast (simplified)
      const hasLightText = scene.visuals.some(v => 
        v.kind === 'TEXT' && scene.accentColor?.includes('light')
      );
      const hasDarkBackground = scene.visuals.some(v =>
        v.kind === 'TEXT' && !scene.accentColor
      );
      
      if (hasLightText && !hasDarkBackground) {
        results.push({
          category: 'accessibility',
          rule: 'color_contrast',
          severity: 'warning',
          message: 'Potential contrast issue with light text',
          sceneId: scene.id,
          suggestion: 'Ensure WCAG AA contrast requirements (4.5:1)'
        });
      }
    });
    
    return results;
  }
  
  private generateSummary(videoDoc: VideoDoc, errors: LintResult[], warnings: LintResult[]): string {
    const { scenes, story } = videoDoc;
    const totalDuration = scenes.reduce((sum, s) => sum + (s.durationMs || 0), 0) / 1000;
    
    const summary = [
      `📊 Video Analysis: ${story.controllingIdea.substring(0, 50)}...`,
      `   Duration: ${totalDuration.toFixed(1)}s (target: ${story.targetDurationSec}s)`,
      `   Scenes: ${scenes.length} (${story.arc} arc)`,
      `   Issues: ${errors.length} errors, ${warnings.length} warnings`
    ];
    
    if (errors.length === 0) {
      summary.push('✅ All quality gates passed');
    } else {
      summary.push('❌ Quality gates failed - review errors above');
    }
    
    return summary.join('\n');
  }
}

async function main() {
  const inputPath = process.argv[2] || './output/vo.json';
  const outputDir = path.dirname(inputPath);
  
  try {
    console.log('🔍 Planning video with comprehensive linting...');
    
    // Load inputs
    const voScript = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
    const provenancePath = path.join(outputDir, 'provenance.json');
    const briefPath = path.join(outputDir, 'brief.json');
    
    const [provenance, brief] = await Promise.all([
      fs.readFile(provenancePath, 'utf-8').then(JSON.parse).catch(() => []),
      fs.readFile(briefPath, 'utf-8').then(JSON.parse)
    ]);
    
    // Generate TTS timing (if OpenAI key available)
    let ttsTimings;
    if (process.env.OPENAI_API_KEY) {
      console.log('🔊 Generating TTS timing...');
      const ttsExtractor = new TTSTimingExtractor(process.env.OPENAI_API_KEY);
      ttsTimings = await ttsExtractor.generateWithTiming(voScript);
    } else {
      console.warn('⚠️  No OpenAI key, using estimated timing');
      ttsTimings = {
        sceneTimings: voScript.scenes.map((s: any, i: number) => ({
          sceneId: s.id,
          start: i * 10000,
          end: (i + 1) * 10000,
          sentences: s.sentences.map((sent: string, j: number) => ({
            sentence: sent,
            start: i * 10000 + j * 3000,
            end: i * 10000 + (j + 1) * 3000,
            words: []
          })),
          totalDurationMs: s.estimatedDurationMs
        }))
      };
    }
    
    // Generate VideoDoc
    const videoDoc = await VideoDocGenerator.generateVideoDoc(
      voScript,
      brief,
      ttsTimings,
      provenance
    );
    
    // Run comprehensive lints
    const linter = new EnhancedVideoLinter();
    const lintResults = linter.lint(videoDoc);
    
    // Write outputs
    const videoDocPath = path.join(outputDir, 'videoDoc.json');
    const lintReportPath = path.join(outputDir, 'lint-report.json');
    
    await Promise.all([
      fs.writeFile(videoDocPath, JSON.stringify(videoDoc, null, 2)),
      fs.writeFile(lintReportPath, JSON.stringify(lintResults, null, 2))
    ]);
    
    console.log(lintResults.summary);
    console.log(`\n📄 Files generated:`);
    console.log(`   VideoDoc: ${videoDocPath}`);
    console.log(`   Lint Report: ${lintReportPath}`);
    
    if (lintResults.errors.length > 0) {
      console.log('\n❌ Errors (must fix before render):');
      lintResults.errors.forEach(error => {
        console.log(`   ${error.category}/${error.rule}: ${error.message}`);
        if (error.suggestion) {
          console.log(`      💡 ${error.suggestion}`);
        }
      });
    }
    
    if (lintResults.warnings.length > 0) {
      console.log('\n⚠️  Warnings (recommended fixes):');
      lintResults.warnings.forEach(warning => {
        console.log(`   ${warning.category}/${warning.rule}: ${warning.message}`);
        if (warning.suggestion) {
          console.log(`      💡 ${warning.suggestion}`);
        }
      });
    }
    
    process.exit(lintResults.passed ? 0 : 1);
    
  } catch (error: any) {
    console.error('❌ Planning failed:', error.message);
    process.exit(1);
  }
}

main();