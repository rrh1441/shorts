/**
 * Segment Export System
 * Handles individual segment downloads for external editing in Loom, Premiere, etc.
 * Supports different formats, qualities, and batch operations
 */

import { renderMedia, renderStill } from '@remotion/renderer';
import { bundle } from '@remotion/bundler';

export interface ExportConfiguration {
  format: 'mp4' | 'webm' | 'mov' | 'gif';
  quality: 'low' | 'medium' | 'high' | 'ultra';
  resolution: {
    width: number;
    height: number;
  };
  frameRate: number;
  codec?: 'h264' | 'h265' | 'vp8' | 'vp9';
  bitrate?: string; // e.g., '2M', '5M', '10M'
  includeAudio: boolean;
  filename?: string; // Custom filename pattern
}

export interface SegmentExportRequest {
  segmentId: string;
  compositionId: string;
  config: ExportConfiguration;
  outputPath?: string;
}

export interface ExportProgress {
  segmentId: string;
  progress: number; // 0-100
  status: 'queued' | 'rendering' | 'completed' | 'failed' | 'cancelled';
  outputPath?: string;
  error?: string;
  startTime?: Date;
  endTime?: Date;
}

export interface BatchExportRequest {
  segments: SegmentExportRequest[];
  outputDirectory: string;
  namingPattern: string; // e.g., "{segmentName}_{timestamp}"
  simultaneous?: number; // Max simultaneous exports
}

// Pre-configured export presets for common use cases
export const EXPORT_PRESETS: Record<string, ExportConfiguration> = {
  // For Loom and screen recording tools
  loom: {
    format: 'mp4',
    quality: 'high',
    resolution: { width: 1920, height: 1080 },
    frameRate: 30,
    codec: 'h264',
    bitrate: '8M',
    includeAudio: true,
    filename: '{segmentName}_loom'
  },

  // For social media platforms
  social: {
    format: 'mp4',
    quality: 'medium',
    resolution: { width: 1080, height: 1080 }, // Square format
    frameRate: 30,
    codec: 'h264',
    bitrate: '5M',
    includeAudio: true,
    filename: '{segmentName}_social'
  },

  // For professional editing (Premiere, Final Cut, etc.)
  professional: {
    format: 'mov',
    quality: 'ultra',
    resolution: { width: 1920, height: 1080 },
    frameRate: 30,
    codec: 'h264',
    bitrate: '15M',
    includeAudio: true,
    filename: '{segmentName}_pro'
  },

  // For web embedding (smaller file size)
  web: {
    format: 'webm',
    quality: 'medium',
    resolution: { width: 1280, height: 720 },
    frameRate: 25,
    codec: 'vp9',
    bitrate: '3M',
    includeAudio: true,
    filename: '{segmentName}_web'
  },

  // For presentations (high quality, no audio)
  presentation: {
    format: 'mp4',
    quality: 'high',
    resolution: { width: 1920, height: 1080 },
    frameRate: 24,
    codec: 'h264',
    bitrate: '10M',
    includeAudio: false,
    filename: '{segmentName}_presentation'
  },

  // For GIF creation (lower quality, shorter duration)
  gif: {
    format: 'gif',
    quality: 'medium',
    resolution: { width: 800, height: 600 },
    frameRate: 15,
    includeAudio: false,
    filename: '{segmentName}_preview'
  }
};

// Quality settings for different use cases
const QUALITY_SETTINGS = {
  low: { crf: 28, scale: 0.5 },
  medium: { crf: 23, scale: 0.75 },
  high: { crf: 18, scale: 1.0 },
  ultra: { crf: 15, scale: 1.0 }
};

export class SegmentExporter {
  private static exportQueue: SegmentExportRequest[] = [];
  private static activeExports = new Map<string, ExportProgress>();
  private static bundlePath: string | null = null;

  // Initialize the bundler (should be called once at startup)
  static async initialize(remotionRoot: string): Promise<void> {
    try {
      this.bundlePath = await bundle(remotionRoot, {
        // Bundle configuration
        webpackOverride: (config) => config,
      });
    } catch (error) {
      console.error('Failed to initialize Remotion bundle:', error);
      throw error;
    }
  }

  // Export a single segment
  static async exportSegment(request: SegmentExportRequest): Promise<ExportProgress> {
    if (!this.bundlePath) {
      throw new Error('SegmentExporter not initialized. Call initialize() first.');
    }

    const progress: ExportProgress = {
      segmentId: request.segmentId,
      progress: 0,
      status: 'queued',
      startTime: new Date(),
    };

    this.activeExports.set(request.segmentId, progress);

    try {
      progress.status = 'rendering';
      progress.progress = 10;
      this.updateProgress(progress);

      // Generate filename if not provided
      const filename = this.generateFilename(request);
      const outputPath = request.outputPath || `./exports/${filename}`;

      // Configure render settings based on quality and format
      const renderConfig = this.buildRenderConfig(request.config);

      progress.progress = 25;
      this.updateProgress(progress);

      // Render the segment
      await renderMedia({
        composition: request.compositionId,
        serveUrl: this.bundlePath,
        codec: request.config.codec || 'h264',
        outputLocation: outputPath,
        inputProps: {},
        ...renderConfig,
        onProgress: ({ progress: renderProgress }) => {
          // Map render progress (0-1) to our progress (25-90)
          progress.progress = 25 + (renderProgress * 65);
          this.updateProgress(progress);
        },
      });

      progress.progress = 100;
      progress.status = 'completed';
      progress.endTime = new Date();
      progress.outputPath = outputPath;

      this.updateProgress(progress);
      return progress;

    } catch (error) {
      progress.status = 'failed';
      progress.error = error instanceof Error ? error.message : 'Unknown error';
      progress.endTime = new Date();
      this.updateProgress(progress);
      throw error;
    }
  }

  // Export multiple segments in batch
  static async exportBatch(request: BatchExportRequest): Promise<Map<string, ExportProgress>> {
    const results = new Map<string, ExportProgress>();
    const simultaneous = request.simultaneous || 2; // Default to 2 simultaneous exports

    // Process segments in batches
    for (let i = 0; i < request.segments.length; i += simultaneous) {
      const batch = request.segments.slice(i, i + simultaneous);
      
      const batchPromises = batch.map(async (segmentRequest) => {
        try {
          const progress = await this.exportSegment(segmentRequest);
          results.set(segmentRequest.segmentId, progress);
          return progress;
        } catch (error) {
          const failedProgress: ExportProgress = {
            segmentId: segmentRequest.segmentId,
            progress: 0,
            status: 'failed',
            error: error instanceof Error ? error.message : 'Export failed',
            startTime: new Date(),
            endTime: new Date(),
          };
          results.set(segmentRequest.segmentId, failedProgress);
          return failedProgress;
        }
      });

      // Wait for current batch to complete before starting next
      await Promise.allSettled(batchPromises);
    }

    return results;
  }

  // Get export progress for a segment
  static getExportProgress(segmentId: string): ExportProgress | undefined {
    return this.activeExports.get(segmentId);
  }

  // Get all active exports
  static getAllActiveExports(): Map<string, ExportProgress> {
    return new Map(this.activeExports);
  }

  // Cancel an export
  static cancelExport(segmentId: string): boolean {
    const progress = this.activeExports.get(segmentId);
    if (progress && progress.status === 'rendering') {
      progress.status = 'cancelled';
      progress.endTime = new Date();
      this.updateProgress(progress);
      return true;
    }
    return false;
  }

  // Helper: Generate filename from pattern
  private static generateFilename(request: SegmentExportRequest): string {
    const pattern = request.config.filename || '{segmentName}_{timestamp}';
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];
    
    return pattern
      .replace('{segmentId}', request.segmentId)
      .replace('{segmentName}', request.segmentId) // In real app, would use actual segment name
      .replace('{timestamp}', timestamp)
      .replace('{format}', request.config.format)
      + '.' + request.config.format;
  }

  // Helper: Build Remotion render configuration
  private static buildRenderConfig(config: ExportConfiguration): any {
    const quality = QUALITY_SETTINGS[config.quality];
    
    return {
      width: config.resolution.width,
      height: config.resolution.height,
      fps: config.frameRate,
      crf: quality.crf,
      scale: quality.scale,
      // Additional codec-specific options
      ...(config.codec === 'h265' && { pixelFormat: 'yuv420p10le' }),
      ...(config.bitrate && { videoBitrate: config.bitrate }),
      ...(config.includeAudio === false && { muted: true }),
    };
  }

  // Helper: Update progress and notify listeners
  private static updateProgress(progress: ExportProgress): void {
    this.activeExports.set(progress.segmentId, { ...progress });
    
    // Emit progress event (in a real app, this would use EventEmitter or similar)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('segment-export-progress', {
        detail: progress
      }));
    }
  }

  // Utility: Create download link for browser downloads
  static createDownloadLink(filePath: string, filename: string): HTMLAnchorElement {
    const link = document.createElement('a');
    link.href = filePath;
    link.download = filename;
    link.style.display = 'none';
    return link;
  }

  // Utility: Trigger browser download
  static triggerDownload(filePath: string, filename: string): void {
    const link = this.createDownloadLink(filePath, filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Utility: Get file size information
  static async getExportFileInfo(outputPath: string): Promise<{
    size: number;
    duration: number;
    format: string;
  }> {
    // In a real implementation, this would use file system APIs
    // For now, returning mock data
    return {
      size: 1024 * 1024 * 5, // 5MB
      duration: 30, // 30 seconds
      format: 'mp4'
    };
  }

  // Utility: Clean up old exports
  static async cleanupOldExports(olderThanDays: number = 7): Promise<void> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    // Remove completed exports older than cutoff
    for (const [segmentId, progress] of this.activeExports.entries()) {
      if (progress.status === 'completed' && 
          progress.endTime && 
          progress.endTime < cutoffDate) {
        this.activeExports.delete(segmentId);
        
        // In a real implementation, also delete the actual files
        if (progress.outputPath) {
          console.log(`Would delete old export: ${progress.outputPath}`);
        }
      }
    }
  }
}

// Filename pattern utilities
export const FILENAME_PATTERNS = {
  simple: '{segmentName}',
  timestamped: '{segmentName}_{timestamp}',
  detailed: '{segmentName}_{quality}_{resolution}_{timestamp}',
  numbered: 'segment_{segmentId}_{timestamp}',
  branded: '{segmentName}_branded_{timestamp}',
};

// Export queue management
export const exportQueue = {
  add: (request: SegmentExportRequest) => {
    SegmentExporter['exportQueue'].push(request);
  },
  
  remove: (segmentId: string) => {
    const queue = SegmentExporter['exportQueue'];
    const index = queue.findIndex(req => req.segmentId === segmentId);
    if (index !== -1) {
      queue.splice(index, 1);
    }
  },
  
  getAll: () => {
    return [...SegmentExporter['exportQueue']];
  },
  
  clear: () => {
    SegmentExporter['exportQueue'].length = 0;
  }
};

export default {
  SegmentExporter,
  EXPORT_PRESETS,
  FILENAME_PATTERNS,
  exportQueue
};