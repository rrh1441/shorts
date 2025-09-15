#!/usr/bin/env tsx

/**
 * Generate video from project source files
 * Runs the complete VO-led pipeline within a project context
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { exec } from 'node:child_process';
import { promisify } from 'node:util';

const execAsync = promisify(exec);

interface ProjectMetadata {
  name: string;
  created: string;
  source: string | null;
  pipeline: {
    ingest: string | null;
    brief: string | null;
    script: string | null;
    videoDoc: string | null;
    lint: string | null;
  };
  outputs: {
    video: string | null;
    audio: string | null;
    captions: string | null;
  };
  config: {
    aspect: 'horizontal' | 'vertical' | 'square';
    duration: number;
    arc: 'ProblemTurnProof' | 'CaseLed' | 'MMS';
  };
}

async function findProjectRoot(): Promise<string> {
  let currentDir = process.cwd();
  
  while (currentDir !== '/') {
    const metaPath = path.join(currentDir, 'meta', 'project.json');
    try {
      await fs.access(metaPath);
      return currentDir;
    } catch {
      currentDir = path.dirname(currentDir);
    }
  }
  
  throw new Error('Not in a video project directory. Run from a project folder or create one with: npm run create:project');
}

async function loadProjectMetadata(projectRoot: string): Promise<ProjectMetadata> {
  const metaPath = path.join(projectRoot, 'meta', 'project.json');
  const content = await fs.readFile(metaPath, 'utf-8');
  return JSON.parse(content);
}

async function saveProjectMetadata(projectRoot: string, metadata: ProjectMetadata): Promise<void> {
  const metaPath = path.join(projectRoot, 'meta', 'project.json');
  await fs.writeFile(metaPath, JSON.stringify(metadata, null, 2));
}

async function runPipelineStep(
  command: string,
  args: string[],
  description: string,
  cwd: string
): Promise<void> {
  console.log(`🔄 ${description}...`);
  
  const fullCommand = `npm run ${command} ${args.join(' ')}`;
  
  try {
    const { stdout, stderr } = await execAsync(fullCommand, { 
      cwd: path.dirname(cwd), // Run from shorts root, not project
      maxBuffer: 1024 * 1024 * 10 // 10MB buffer
    });
    
    if (stdout) console.log(stdout);
    if (stderr) console.warn(stderr);
    
  } catch (error: any) {
    console.error(`❌ ${description} failed:`, error.message);
    throw error;
  }
}

async function main() {
  try {
    // Find project root
    const projectRoot = await findProjectRoot();
    const metadata = await loadProjectMetadata(projectRoot);
    
    console.log(`🎬 Generating video for project: ${metadata.name}`);
    console.log(`   Source: ${metadata.source || 'No source file'}`);
    console.log(`   Config: ${metadata.config.aspect}, ${metadata.config.duration}s, ${metadata.config.arc}`);
    
    // Define paths
    const paths = {
      source: path.join(projectRoot, 'source'),
      pipeline: path.join(projectRoot, 'pipeline'),
      assets: path.join(projectRoot, 'assets'),
      output: path.join(projectRoot, 'output')
    };
    
    // Find source file
    const sourceFiles = await fs.readdir(paths.source);
    if (sourceFiles.length === 0) {
      throw new Error('No source files found. Add content to the source/ directory.');
    }
    
    const sourceFile = path.join(paths.source, sourceFiles[0]);
    console.log(`📄 Processing: ${sourceFiles[0]}`);
    
    // Step 1: Ingest
    await runPipelineStep(
      'ingest',
      [sourceFile, paths.pipeline],
      'Ingesting content',
      projectRoot
    );
    metadata.pipeline.ingest = 'ingest.json';
    
    // Step 2: Synthesize
    await runPipelineStep(
      'synthesize',
      [`${paths.pipeline}/ingest.json`, `--arc=${metadata.config.arc}`, `--duration=${metadata.config.duration}`],
      'Synthesizing narrative brief',
      projectRoot
    );
    metadata.pipeline.brief = 'brief.json';
    
    // Step 3: Script
    await runPipelineStep(
      'script',
      [`${paths.pipeline}/brief.json`],
      'Generating VO script',
      projectRoot
    );
    metadata.pipeline.script = 'vo.json';
    
    // Step 4: Plan
    await runPipelineStep(
      'plan:new',
      [`${paths.pipeline}/vo.json`],
      'Planning scenes and linting',
      projectRoot
    );
    metadata.pipeline.videoDoc = 'videoDoc.json';
    metadata.pipeline.lint = 'lint-report.json';
    
    // Step 5: Render
    const outputVideo = path.join(paths.output, `${metadata.name}.mp4`);
    await runPipelineStep(
      'render:videodoc',
      [`${paths.pipeline}/videoDoc.json`, outputVideo, `--aspect=${metadata.config.aspect}`],
      'Rendering video',
      projectRoot
    );
    metadata.outputs.video = `${metadata.name}.mp4`;
    
    // Update metadata
    await saveProjectMetadata(projectRoot, metadata);
    
    // Show results
    console.log(`\n✅ Video generation complete!`);
    console.log(`   Project: ${projectRoot}`);
    console.log(`   Video: ${outputVideo}`);
    
    // Check file size
    const stats = await fs.stat(outputVideo);
    const sizeMB = (stats.size / (1024 * 1024)).toFixed(1);
    console.log(`   Size: ${sizeMB} MB`);
    
    console.log(`\n📁 Generated files:`);
    console.log(`   Pipeline: ${paths.pipeline}/`);
    console.log(`   Output: ${paths.output}/`);
    
  } catch (error: any) {
    console.error('❌ Video generation failed:', error.message);
    process.exit(1);
  }
}

main();