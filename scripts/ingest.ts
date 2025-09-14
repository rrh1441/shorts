#!/usr/bin/env tsx

/**
 * Ingest content (PDFs, transcripts) and extract structured data
 * Outputs: ingest.json + provenance.json
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { z } from 'zod';

// Ingest schema
const IngestDataSchema = z.object({
  title: z.string(),
  type: z.enum(['whitepaper', 'transcript', 'markdown']),
  chunks: z.array(z.object({
    id: z.string(),
    type: z.enum(['heading', 'paragraph', 'table', 'figure', 'segment', 'quote']),
    content: z.string(),
    metadata: z.record(z.any()).optional()
  })),
  summary: z.string(),
  keyPoints: z.array(z.string()),
  audience: z.enum(['exec', 'technical', 'general']).optional()
});

const ProvenanceSchema = z.object({
  id: z.string(),
  label: z.string(),
  href: z.string().optional(),
  chunkId: z.string(),
  confidence: z.number().min(0).max(1)
});

type IngestData = z.infer<typeof IngestDataSchema>;
type Provenance = z.infer<typeof ProvenanceSchema>;

class ContentIngester {
  async ingest(inputPath: string, outputDir: string = './output'): Promise<{
    ingestPath: string;
    provenancePath: string;
  }> {
    console.log(`📖 Ingesting content from: ${inputPath}`);
    
    const ext = path.extname(inputPath).toLowerCase();
    let ingestData: IngestData;
    let provenance: Provenance[];
    
    switch (ext) {
      case '.pdf':
        ({ ingestData, provenance } = await this.ingestPDF(inputPath));
        break;
      case '.txt':
      case '.md':
        ({ ingestData, provenance } = await this.ingestText(inputPath));
        break;
      case '.json':
        ({ ingestData, provenance } = await this.ingestTranscript(inputPath));
        break;
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }
    
    // Validate data
    const validatedIngest = IngestDataSchema.parse(ingestData);
    const validatedProvenance = z.array(ProvenanceSchema).parse(provenance);
    
    // Ensure output directory exists
    await fs.mkdir(outputDir, { recursive: true });
    
    // Write output files
    const ingestPath = path.join(outputDir, 'ingest.json');
    const provenancePath = path.join(outputDir, 'provenance.json');
    
    await Promise.all([
      fs.writeFile(ingestPath, JSON.stringify(validatedIngest, null, 2)),
      fs.writeFile(provenancePath, JSON.stringify(validatedProvenance, null, 2))
    ]);
    
    console.log(`✅ Ingest complete:`);
    console.log(`   - Data: ${ingestPath}`);
    console.log(`   - Provenance: ${provenancePath}`);
    console.log(`   - Chunks: ${validatedIngest.chunks.length}`);
    console.log(`   - Citations: ${validatedProvenance.length}`);
    
    return { ingestPath, provenancePath };
  }
  
  private async ingestPDF(inputPath: string): Promise<{ ingestData: IngestData; provenance: Provenance[] }> {
    // Simplified PDF ingestion - in real implementation, use PDF parsing library
    console.log('📑 Processing PDF...');
    
    const filename = path.basename(inputPath, '.pdf');
    const content = await fs.readFile(inputPath, 'utf-8').catch(() => 'PDF content placeholder');
    
    // Mock PDF structure extraction
    const chunks = [
      {
        id: 'chunk-1',
        type: 'heading' as const,
        content: `Executive Summary: ${filename}`,
        metadata: { page: 1, level: 1 }
      },
      {
        id: 'chunk-2', 
        type: 'paragraph' as const,
        content: 'Organizations face increasing complexity in managing operational efficiency.',
        metadata: { page: 1 }
      },
      {
        id: 'chunk-3',
        type: 'figure' as const,
        content: 'Operational efficiency increased by 30% after implementation.',
        metadata: { page: 2, figure: 'Figure 1' }
      }
    ];
    
    const provenance: Provenance[] = [
      {
        id: 's1',
        label: `${filename} (Fig. 1)`,
        href: `file://${inputPath}#page=2`,
        chunkId: 'chunk-3',
        confidence: 0.9
      }
    ];
    
    const ingestData: IngestData = {
      title: filename.replace(/-/g, ' '),
      type: 'whitepaper',
      chunks,
      summary: 'Comprehensive analysis of operational efficiency improvements.',
      keyPoints: [
        'Manual processes create inefficiency',
        '30% improvement possible with automation',
        'ROI achieved within one quarter'
      ],
      audience: 'exec'
    };
    
    return { ingestData, provenance };
  }
  
  private async ingestText(inputPath: string): Promise<{ ingestData: IngestData; provenance: Provenance[] }> {
    console.log('📝 Processing text file...');
    
    const content = await fs.readFile(inputPath, 'utf-8');
    const filename = path.basename(inputPath, path.extname(inputPath));
    
    // Simple text chunking
    const paragraphs = content.split('\n\n').filter(p => p.trim().length > 0);
    const chunks = paragraphs.map((p, i) => ({
      id: `chunk-${i + 1}`,
      type: p.startsWith('#') ? 'heading' as const : 'paragraph' as const,
      content: p.trim(),
      metadata: { line: i + 1 }
    }));
    
    // Extract potential citations (simple heuristic)
    const provenance: Provenance[] = [];
    chunks.forEach(chunk => {
      if (chunk.content.includes('%') || chunk.content.match(/\d+x|\d+\.\d+x/)) {
        provenance.push({
          id: `s${provenance.length + 1}`,
          label: `${filename} (${chunk.metadata.line})`,
          chunkId: chunk.id,
          confidence: 0.7
        });
      }
    });
    
    const ingestData: IngestData = {
      title: filename.replace(/-/g, ' '),
      type: 'markdown',
      chunks,
      summary: content.substring(0, 200) + '...',
      keyPoints: this.extractKeyPoints(content),
      audience: 'general'
    };
    
    return { ingestData, provenance };
  }
  
  private async ingestTranscript(inputPath: string): Promise<{ ingestData: IngestData; provenance: Provenance[] }> {
    console.log('🎙️ Processing transcript...');
    
    const rawData = JSON.parse(await fs.readFile(inputPath, 'utf-8'));
    const filename = path.basename(inputPath, '.json');
    
    // Handle different transcript formats
    const segments = rawData.segments || rawData.transcript || [rawData];
    
    const chunks = segments.map((segment: any, i: number) => ({
      id: `segment-${i + 1}`,
      type: 'segment' as const,
      content: segment.text || segment.content || String(segment),
      metadata: {
        timestamp: segment.start || segment.timestamp || i * 30,
        speaker: segment.speaker || 'Speaker',
        duration: segment.duration || 30
      }
    }));
    
    // Extract quotable moments as provenance
    const provenance: Provenance[] = [];
    chunks.forEach(chunk => {
      if (chunk.content.length > 50 && chunk.content.includes('.')) {
        provenance.push({
          id: `q${provenance.length + 1}`,
          label: `${filename} (${Math.round(chunk.metadata.timestamp / 60)}:${String(chunk.metadata.timestamp % 60).padStart(2, '0')})`,
          chunkId: chunk.id,
          confidence: 0.8
        });
      }
    });
    
    const ingestData: IngestData = {
      title: filename.replace(/-/g, ' '),
      type: 'transcript',
      chunks,
      summary: 'Transcript analysis with key discussion points.',
      keyPoints: this.extractKeyPoints(chunks.map(c => c.content).join(' ')),
      audience: 'general'
    };
    
    return { ingestData, provenance };
  }
  
  private extractKeyPoints(content: string): string[] {
    // Simple key point extraction
    const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 20);
    return sentences
      .filter(s => 
        s.includes('important') || 
        s.includes('key') || 
        s.includes('significant') ||
        s.includes('%') ||
        s.match(/\d+x|\d+\.\d+x/)
      )
      .slice(0, 5)
      .map(s => s.trim());
  }
}

async function main() {
  const inputPath = process.argv[2];
  const outputDir = process.argv[3] || './output';
  
  if (!inputPath) {
    console.error('Usage: npm run ingest <input-file> [output-dir]');
    process.exit(1);
  }
  
  try {
    const ingester = new ContentIngester();
    await ingester.ingest(inputPath, outputDir);
  } catch (error: any) {
    console.error('❌ Ingestion failed:', error.message);
    process.exit(1);
  }
}

main();