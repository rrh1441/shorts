#!/usr/bin/env tsx

/**
 * Create a new video project with proper folder structure
 * Each project contains all assets, intermediate files, and outputs
 */

import fs from 'node:fs/promises';
import path from 'node:path';

interface ProjectStructure {
  name: string;
  path: string;
  structure: {
    source: string;     // Original content files
    pipeline: string;   // Intermediate JSON files
    assets: string;     // Audio, images, etc.
    output: string;     // Final video files
    meta: string;       // Project metadata
  };
}

async function createProject(projectName: string, sourceFile?: string): Promise<ProjectStructure> {
  const timestamp = new Date().toISOString().slice(0, 16).replace(/[:-]/g, '');
  const safeName = projectName.replace(/[^a-zA-Z0-9-_]/g, '_');
  const fullName = `${safeName}_${timestamp}`;
  
  const projectPath = path.join(process.cwd(), 'projects', fullName);
  
  const structure = {
    name: fullName,
    path: projectPath,
    structure: {
      source: path.join(projectPath, 'source'),
      pipeline: path.join(projectPath, 'pipeline'),
      assets: path.join(projectPath, 'assets'),
      output: path.join(projectPath, 'output'),
      meta: path.join(projectPath, 'meta')
    }
  };
  
  // Create directory structure
  await fs.mkdir(projectPath, { recursive: true });
  await Promise.all([
    fs.mkdir(structure.structure.source, { recursive: true }),
    fs.mkdir(structure.structure.pipeline, { recursive: true }),
    fs.mkdir(structure.structure.assets, { recursive: true }),
    fs.mkdir(structure.structure.output, { recursive: true }),
    fs.mkdir(structure.structure.meta, { recursive: true })
  ]);
  
  // Copy source file if provided
  if (sourceFile) {
    const sourceFileName = path.basename(sourceFile);
    const targetPath = path.join(structure.structure.source, sourceFileName);
    await fs.copyFile(sourceFile, targetPath);
    console.log(`📄 Source file copied: ${sourceFileName}`);
  }
  
  // Create project metadata
  const metadata = {
    name: fullName,
    created: new Date().toISOString(),
    source: sourceFile ? path.basename(sourceFile) : null,
    pipeline: {
      ingest: null,
      brief: null,
      script: null,
      videoDoc: null,
      lint: null
    },
    outputs: {
      video: null,
      audio: null,
      captions: null
    },
    config: {
      aspect: 'horizontal',
      duration: 60,
      arc: 'ProblemTurnProof'
    }
  };
  
  await fs.writeFile(
    path.join(structure.structure.meta, 'project.json'),
    JSON.stringify(metadata, null, 2)
  );
  
  // Create README for the project
  const readme = `# Video Project: ${fullName}

## Structure
- \`source/\` - Original content files
- \`pipeline/\` - Intermediate processing files (JSON)
- \`assets/\` - Generated audio, images, etc.
- \`output/\` - Final video files
- \`meta/\` - Project metadata and configuration

## Pipeline Files
- \`pipeline/ingest.json\` - Parsed content chunks
- \`pipeline/provenance.json\` - Citation sources
- \`pipeline/brief.json\` - Narrative brief
- \`pipeline/vo.json\` - Voice-over script
- \`pipeline/videoDoc.json\` - Scene specifications
- \`pipeline/lint-report.json\` - Quality validation

## Commands
Run from project root (\`${projectPath}\`):

\`\`\`bash
# Generate video from source
npm run project:generate

# Render specific aspect ratio
npm run project:render --aspect=vertical

# View project status
npm run project:status
\`\`\`

Generated: ${new Date().toLocaleString()}
`;
  
  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
  
  return structure;
}

async function main() {
  const projectName = process.argv[2];
  const sourceFile = process.argv[3];
  
  if (!projectName) {
    console.error('Usage: npm run create:project <project-name> [source-file]');
    console.error('');
    console.error('Examples:');
    console.error('  npm run create:project "efficiency-explainer" content.md');
    console.error('  npm run create:project "product-demo"');
    process.exit(1);
  }
  
  try {
    console.log(`🚀 Creating video project: ${projectName}`);
    
    const project = await createProject(projectName, sourceFile);
    
    console.log(`✅ Project created successfully!`);
    console.log(`   Name: ${project.name}`);
    console.log(`   Path: ${project.path}`);
    console.log(`   Structure:`);
    
    Object.entries(project.structure).forEach(([key, path]) => {
      console.log(`     ${key}: ${path}`);
    });
    
    console.log(`\n📝 Next steps:`);
    console.log(`   cd ${project.path}`);
    console.log(`   npm run project:generate`);
    
  } catch (error: any) {
    console.error('❌ Project creation failed:', error.message);
    process.exit(1);
  }
}

main();