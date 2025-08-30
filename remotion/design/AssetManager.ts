/**
 * Asset Management System
 * Handles uploading, validation, and processing of user-provided video/image assets
 * For custom intro/outro segments with TTS integration
 */

export interface AssetMetadata {
  id: string;
  name: string;
  originalName: string;
  type: 'video' | 'image';
  format: string;
  size: number; // in bytes
  duration?: number; // for videos, in seconds
  dimensions: {
    width: number;
    height: number;
  };
  url: string; // Object URL or processed URL
  thumbnail?: string; // Thumbnail URL for preview
  uploadDate: Date;
  status: 'uploading' | 'processing' | 'ready' | 'error';
  errorMessage?: string;
}

export interface TTSConfiguration {
  script: string;
  voice: string; // OpenAI voice model
  timing: {
    startTime: number; // seconds from start
    duration?: number; // auto-calculated from TTS
  };
  volume: number; // 0-1
  fadeIn?: number; // seconds
  fadeOut?: number; // seconds
}

export interface CustomSegmentConfig {
  id: string;
  name: string;
  asset: AssetMetadata;
  tts?: TTSConfiguration;
  overlay?: {
    enabled: boolean;
    text?: string;
    position: 'top' | 'center' | 'bottom';
    style?: any;
  };
  duration: number; // total segment duration
  type: 'intro' | 'outro' | 'custom';
}

// Supported file formats and their specifications
export const SUPPORTED_FORMATS = {
  video: {
    formats: ['.mp4', '.mov', '.webm', '.avi', '.mkv'],
    maxSize: 100 * 1024 * 1024, // 100MB
    maxDuration: 60, // 60 seconds
    recommendedFormats: ['.mp4', '.webm'],
    codecs: {
      video: ['h264', 'vp8', 'vp9'],
      audio: ['aac', 'opus', 'vorbis']
    }
  },
  image: {
    formats: ['.jpg', '.jpeg', '.png', '.webp', '.gif'],
    maxSize: 10 * 1024 * 1024, // 10MB
    minDimensions: { width: 480, height: 270 }, // 16:9 minimum
    maxDimensions: { width: 3840, height: 2160 }, // 4K maximum
    recommendedDimensions: { width: 1920, height: 1080 }
  }
};

// Asset validation and processing utilities
export class AssetManager {
  private static generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  static async validateAsset(file: File): Promise<{ valid: boolean; error?: string; warnings?: string[] }> {
    const warnings: string[] = [];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    // Determine asset type
    const isVideo = SUPPORTED_FORMATS.video.formats.includes(extension);
    const isImage = SUPPORTED_FORMATS.image.formats.includes(extension);
    
    if (!isVideo && !isImage) {
      return {
        valid: false,
        error: `Unsupported format. Supported formats: ${[...SUPPORTED_FORMATS.video.formats, ...SUPPORTED_FORMATS.image.formats].join(', ')}`
      };
    }

    // Check file size
    const maxSize = isVideo ? SUPPORTED_FORMATS.video.maxSize : SUPPORTED_FORMATS.image.maxSize;
    if (file.size > maxSize) {
      return {
        valid: false,
        error: `File size exceeds ${Math.round(maxSize / 1024 / 1024)}MB limit`
      };
    }

    // Additional validation based on type
    if (isVideo) {
      // Video-specific validation would go here
      // For now, we'll accept valid video formats
      if (!SUPPORTED_FORMATS.video.recommendedFormats.includes(extension)) {
        warnings.push(`${extension} format may have compatibility issues. Recommended: ${SUPPORTED_FORMATS.video.recommendedFormats.join(', ')}`);
      }
    } else if (isImage) {
      // Image-specific validation
      try {
        const dimensions = await this.getImageDimensions(file);
        const { minDimensions, maxDimensions, recommendedDimensions } = SUPPORTED_FORMATS.image;
        
        if (dimensions.width < minDimensions.width || dimensions.height < minDimensions.height) {
          return {
            valid: false,
            error: `Image dimensions too small. Minimum: ${minDimensions.width}x${minDimensions.height}`
          };
        }
        
        if (dimensions.width > maxDimensions.width || dimensions.height > maxDimensions.height) {
          return {
            valid: false,
            error: `Image dimensions too large. Maximum: ${maxDimensions.width}x${maxDimensions.height}`
          };
        }

        // Check aspect ratio
        const aspectRatio = dimensions.width / dimensions.height;
        const recommendedAspectRatio = recommendedDimensions.width / recommendedDimensions.height;
        
        if (Math.abs(aspectRatio - recommendedAspectRatio) > 0.1) {
          warnings.push(`Image aspect ratio (${aspectRatio.toFixed(2)}) differs from recommended 16:9. Consider cropping for best results.`);
        }

      } catch (error) {
        return {
          valid: false,
          error: 'Could not read image dimensions. File may be corrupted.'
        };
      }
    }

    return { valid: true, warnings: warnings.length > 0 ? warnings : undefined };
  }

  static async processAsset(file: File): Promise<AssetMetadata> {
    const validation = await this.validateAsset(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const id = this.generateId();
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    const isVideo = SUPPORTED_FORMATS.video.formats.includes(extension);
    
    // Create object URL for immediate use
    const url = URL.createObjectURL(file);
    
    const metadata: AssetMetadata = {
      id,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      originalName: file.name,
      type: isVideo ? 'video' : 'image',
      format: extension,
      size: file.size,
      dimensions: { width: 0, height: 0 }, // Will be updated
      url,
      uploadDate: new Date(),
      status: 'processing'
    };

    try {
      if (isVideo) {
        const videoInfo = await this.getVideoInfo(file);
        metadata.duration = videoInfo.duration;
        metadata.dimensions = videoInfo.dimensions;
        metadata.thumbnail = videoInfo.thumbnail;
      } else {
        const dimensions = await this.getImageDimensions(file);
        metadata.dimensions = dimensions;
        metadata.thumbnail = url; // Use the image itself as thumbnail
      }
      
      metadata.status = 'ready';
    } catch (error) {
      metadata.status = 'error';
      metadata.errorMessage = error instanceof Error ? error.message : 'Processing failed';
    }

    return metadata;
  }

  private static getImageDimensions(file: File): Promise<{ width: number; height: number }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.naturalWidth, height: img.naturalHeight });
        URL.revokeObjectURL(img.src);
      };
      img.onerror = () => {
        reject(new Error('Failed to load image'));
        URL.revokeObjectURL(img.src);
      };
      img.src = URL.createObjectURL(file);
    });
  }

  private static getVideoInfo(file: File): Promise<{
    duration: number;
    dimensions: { width: number; height: number };
    thumbnail: string;
  }> {
    return new Promise((resolve, reject) => {
      const video = document.createElement('video');
      video.preload = 'metadata';
      
      video.onloadedmetadata = () => {
        const duration = video.duration;
        const dimensions = {
          width: video.videoWidth,
          height: video.videoHeight
        };

        // Create thumbnail at 1 second or 10% into video, whichever is shorter
        const thumbnailTime = Math.min(1, duration * 0.1);
        video.currentTime = thumbnailTime;
      };

      video.onseeked = () => {
        // Create canvas to capture frame
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        
        ctx.drawImage(video, 0, 0);
        
        const thumbnail = canvas.toDataURL('image/jpeg', 0.8);
        
        resolve({
          duration: video.duration,
          dimensions: {
            width: video.videoWidth,
            height: video.videoHeight
          },
          thumbnail
        });
        
        URL.revokeObjectURL(video.src);
      };

      video.onerror = () => {
        reject(new Error('Failed to load video metadata'));
        URL.revokeObjectURL(video.src);
      };

      video.src = URL.createObjectURL(file);
    });
  }

  // TTS Integration utilities
  static async generateTTS(config: TTSConfiguration): Promise<{
    audioUrl: string;
    duration: number;
  }> {
    // This would integrate with OpenAI's TTS API
    // For now, returning a mock response
    const estimatedDuration = config.script.length / 15; // Rough estimate: 15 chars per second
    
    // In production, this would call OpenAI TTS API:
    // const response = await openai.audio.speech.create({
    //   model: "tts-1",
    //   voice: config.voice,
    //   input: config.script,
    // });
    
    return {
      audioUrl: 'mock-tts-audio-url.mp3', // Would be actual audio URL
      duration: estimatedDuration
    };
  }

  // Asset optimization utilities
  static async optimizeForVideo(asset: AssetMetadata): Promise<AssetMetadata> {
    if (asset.status !== 'ready') {
      throw new Error('Asset must be processed successfully before optimization');
    }

    // For images, this could resize to optimal video dimensions
    // For videos, this could re-encode for better compatibility
    
    // Mock optimization process
    return {
      ...asset,
      // Potentially updated URL with optimized version
    };
  }

  // Cleanup utility
  static cleanupAsset(asset: AssetMetadata): void {
    if (asset.url.startsWith('blob:')) {
      URL.revokeObjectURL(asset.url);
    }
    if (asset.thumbnail && asset.thumbnail.startsWith('blob:')) {
      URL.revokeObjectURL(asset.thumbnail);
    }
  }

  // Export configuration for segment creation
  static createSegmentConfig(
    asset: AssetMetadata, 
    options: {
      name: string;
      type: 'intro' | 'outro' | 'custom';
      duration?: number;
      tts?: Omit<TTSConfiguration, 'timing'> & { timing?: Partial<TTSConfiguration['timing']> };
      overlay?: CustomSegmentConfig['overlay'];
    }
  ): CustomSegmentConfig {
    const duration = options.duration || asset.duration || 10; // Default to 10 seconds for images
    
    let ttsConfig: TTSConfiguration | undefined;
    if (options.tts) {
      ttsConfig = {
        ...options.tts,
        timing: {
          startTime: options.tts.timing?.startTime || 0,
          duration: options.tts.timing?.duration // Will be calculated after TTS generation
        }
      };
    }

    return {
      id: AssetManager.generateId(),
      name: options.name,
      asset,
      tts: ttsConfig,
      overlay: options.overlay,
      duration,
      type: options.type
    };
  }
}

// Preset configurations for common use cases
export const PRESET_CONFIGS = {
  intro: {
    name: 'Brand Intro',
    type: 'intro' as const,
    duration: 5,
    overlay: {
      enabled: true,
      position: 'center' as const,
    }
  },
  outro: {
    name: 'Call to Action',
    type: 'outro' as const,
    duration: 8,
    overlay: {
      enabled: true,
      position: 'bottom' as const,
    }
  },
  logo: {
    name: 'Logo Reveal',
    type: 'intro' as const,
    duration: 3,
    overlay: {
      enabled: false,
    }
  }
};

export default {
  AssetManager,
  SUPPORTED_FORMATS,
  PRESET_CONFIGS
};