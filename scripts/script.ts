#!/usr/bin/env tsx

/**
 * Generate VO script with word budgets
 * Input: brief.json + provenance.json
 * Output: vo.json
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { VOScriptGenerator, FormatBudget, WORD_BUDGETS } from '../shared/vo-script';

async function main() {
  const inputPath = process.argv[2] || './output/brief.json';
  const outputDir = process.argv[3] ? process.argv[3] : path.dirname(inputPath);
  
  // Parse arguments (skip outputDir if provided)
  const args = process.argv.slice(outputDir !== path.dirname(inputPath) ? 4 : 3);
  const budgetArg = args.find(arg => arg.startsWith('--budget='))?.split('=')[1];
  
  // Determine format budget
  let format: FormatBudget;
  if (budgetArg) {
    const budget = parseInt(budgetArg);
    if (budget <= 55) format = 'clip30';
    else if (budget <= 110) format = 'micro60';
    else if (budget <= 130) format = 'micro75';
    else format = 'micro90';
  } else {
    // Auto-detect from brief duration
    const briefData = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
    const duration = briefData.targetDurationSec || 60;
    
    if (duration <= 30) format = 'clip30';
    else if (duration <= 60) format = 'micro60';
    else if (duration <= 75) format = 'micro75';
    else format = 'micro90';
  }
  
  try {
    console.log(`✍️ Generating VO script...`);
    console.log(`   Format: ${format} (${WORD_BUDGETS[format].min}-${WORD_BUDGETS[format].max} words)`);
    
    // Load inputs
    const brief = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
    const provenancePath = path.join(outputDir, 'provenance.json');
    
    let provenance = [];
    try {
      provenance = JSON.parse(await fs.readFile(provenancePath, 'utf-8'));
    } catch {
      console.warn('⚠️  No provenance.json found, proceeding without citations');
    }
    
    // Generate script
    const generator = new VOScriptGenerator();
    const voScript = await generator.generateScript(brief, format, provenance);
    
    // Validate script
    const validation = generator.validateScript(voScript, format);
    // Enforce word budget as a hard gate
    const within = voScript.withinBudget;
    if (!validation.valid || !within) {
      console.error('❌ Script validation failed:');
      validation.issues.forEach(issue => console.error(`   - ${issue}`));
      if (!within) {
        const b = WORD_BUDGETS[format];
        const delta = voScript.totalWords - (voScript.totalWords > b.max ? b.max : b.min);
        console.error(`   - Word budget violation: ${voScript.totalWords} words (target ${b.min}-${b.max}). ${voScript.totalWords > b.max ? 'Remove' : 'Add'} ~${Math.abs(delta)} words.`);
      }
      console.log('💡 Suggestions:');
      validation.suggestions.forEach(suggestion => console.log(`   - ${suggestion}`));
      if (!within) {
        console.log(`   - Adjust VO to meet ${format} budget and retry.`);
      }
      process.exit(1);
    }
    
    // Write output
    const outputPath = path.join(outputDir, 'vo.json');
    await fs.writeFile(outputPath, JSON.stringify(voScript, null, 2));
    
    console.log(`✅ VO script generated: ${outputPath}`);
    console.log(`   Total words: ${voScript.totalWords} (${voScript.withinBudget ? '✓' : '✗'} within budget)`);
    console.log(`   Scenes: ${voScript.scenes.length}`);
    console.log(`   Estimated duration: ${Math.round(voScript.totalEstimatedMs / 1000)}s`);
    
    // Show scene breakdown
    console.log('\n📋 Scene breakdown:');
    voScript.scenes.forEach((scene, i) => {
      console.log(`   ${i + 1}. ${scene.id}: ${scene.wordCount} words, ${Math.round(scene.estimatedDurationMs / 1000)}s`);
      if (scene.evidenceTokens.length > 0) {
        console.log(`      Citations: ${scene.evidenceTokens.map(t => t.token).join(', ')}`);
      }
    });
    
  } catch (error: any) {
    console.error('❌ Script generation failed:', error.message);
    process.exit(1);
  }
}

main();
