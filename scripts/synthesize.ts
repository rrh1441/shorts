#!/usr/bin/env tsx

/**
 * Synthesize narrative brief from ingested content
 * Input: ingest.json
 * Output: brief.json
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { NarrativeBriefGenerator, Arc, NarrativeBrief } from '../shared/narrative-brief';

async function main() {
  const inputPath = process.argv[2] || './output/ingest.json';
  const outputDir = process.argv[3] ? process.argv[3] : path.dirname(inputPath);
  
  // Parse arguments (skip outputDir if provided)
  const args = process.argv.slice(outputDir !== path.dirname(inputPath) ? 4 : 3);
  const arcArg = args.find(arg => arg.startsWith('--arc='))?.split('=')[1] as Arc;
  const durationArg = args.find(arg => arg.startsWith('--duration='))?.split('=')[1];
  
  const arc = arcArg || 'ProblemTurnProof';
  const duration = parseInt(durationArg || '60');
  
  if (!['ProblemTurnProof', 'CaseLed', 'MMS'].includes(arc)) {
    console.error('❌ Invalid arc. Use: ProblemTurnProof, CaseLed, or MMS');
    process.exit(1);
  }
  
  if (duration < 30 || duration > 90) {
    console.error('❌ Invalid duration. Must be 30-90 seconds');
    process.exit(1);
  }
  
  try {
    console.log(`🧠 Synthesizing narrative brief...`);
    console.log(`   Arc: ${arc}`);
    console.log(`   Duration: ${duration}s`);
    
    // Load ingest data
    const ingestData = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
    
    // Generate narrative brief
    const generator = new NarrativeBriefGenerator();
    const brief: NarrativeBrief = await generator.generateBrief(
      ingestData,
      duration,
      arc
    );
    
    // Write output
    const outputPath = path.join(outputDir, 'brief.json');
    await fs.writeFile(outputPath, JSON.stringify(brief, null, 2));
    
    console.log(`✅ Brief generated: ${outputPath}`);
    console.log(`   Controlling Idea: ${brief.controllingIdea}`);
    console.log(`   Proof Pillars: ${brief.proofPillars.length}`);
    console.log(`   Arc: ${brief.arc}`);
    console.log(`   Target Duration: ${brief.targetDurationSec}s`);
    
  } catch (error: any) {
    console.error('❌ Brief generation failed:', error.message);
    process.exit(1);
  }
}

main();