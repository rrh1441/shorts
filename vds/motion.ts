/**
 * Motion Grammar for Video Design System
 * Standardized animation patterns and timing
 */

import { TIMING, getCubicBezier } from './tokens';

export type MotionVariant = 'standard' | 'emphasis' | 'gentle';
export type EntranceType = 'fade' | 'slide' | 'scale' | 'mask-wipe';
export type ExitType = 'fade' | 'slide' | 'scale';

// Animation frame timing at 30fps
export const FRAME_TIMING = {
  entrance: {
    fast: 15,    // 0.5s at 30fps
    normal: 18,  // 0.6s at 30fps
    slow: 24     // 0.8s at 30fps
  },
  exit: {
    fast: 8,     // 0.27s at 30fps
    normal: 12,  // 0.4s at 30fps
    slow: 15     // 0.5s at 30fps
  },
  reveal: {
    fast: 6,     // 0.2s at 30fps
    normal: 9,   // 0.3s at 30fps
    slow: 12     // 0.4s at 30fps
  }
} as const;

// Camera drift settings
export const CAMERA_DRIFT = {
  scale: {
    min: 1.02,
    max: 1.06
  },
  duration: 8000, // 8 seconds for full drift
  easing: 'gentle' as const
} as const;

export interface AnimationConfig {
  type: EntranceType | ExitType;
  duration: number; // frames
  easing: keyof typeof TIMING.easings;
  delay?: number; // frames
  transform?: {
    x?: number;
    y?: number;
    scale?: number;
    opacity?: number;
  };
}

export interface MotionPreset {
  entrance: AnimationConfig;
  exit: AnimationConfig;
  reveal?: AnimationConfig;
}

// Motion presets by variant
export const MOTION_PRESETS: Record<MotionVariant, MotionPreset> = {
  standard: {
    entrance: {
      type: 'fade',
      duration: FRAME_TIMING.entrance.normal,
      easing: 'standard',
      transform: { y: 24, opacity: 0 }
    },
    exit: {
      type: 'fade',
      duration: FRAME_TIMING.exit.normal,
      easing: 'standard',
      transform: { opacity: 0 }
    },
    reveal: {
      type: 'fade',
      duration: FRAME_TIMING.reveal.normal,
      easing: 'standard',
      transform: { opacity: 0 }
    }
  },
  
  emphasis: {
    entrance: {
      type: 'scale',
      duration: FRAME_TIMING.entrance.fast,
      easing: 'emphasis',
      transform: { scale: 0.96, opacity: 0 }
    },
    exit: {
      type: 'scale',
      duration: FRAME_TIMING.exit.fast,
      easing: 'sharp',
      transform: { scale: 0.96, opacity: 0 }
    },
    reveal: {
      type: 'scale',
      duration: FRAME_TIMING.reveal.fast,
      easing: 'emphasis',
      transform: { scale: 0.98, opacity: 0 }
    }
  },
  
  gentle: {
    entrance: {
      type: 'slide',
      duration: FRAME_TIMING.entrance.slow,
      easing: 'gentle',
      transform: { y: 36, opacity: 0 }
    },
    exit: {
      type: 'slide',
      duration: FRAME_TIMING.exit.slow,
      easing: 'gentle',
      transform: { y: -24, opacity: 0 }
    },
    reveal: {
      type: 'fade',
      duration: FRAME_TIMING.reveal.slow,
      easing: 'gentle',
      transform: { opacity: 0 }
    }
  }
} as const;

// Stagger timing for multiple elements
export const STAGGER = {
  tight: 3,    // 0.1s at 30fps
  normal: 6,   // 0.2s at 30fps
  loose: 9     // 0.3s at 30fps
} as const;

/**
 * Generate Remotion-compatible animation props
 */
export function getRemotionAnimation(
  variant: MotionVariant,
  type: 'entrance' | 'exit' | 'reveal' = 'entrance',
  frame: number,
  totalFrames: number
): {
  opacity: number;
  transform: string;
} {
  const preset = MOTION_PRESETS[variant][type];
  if (!preset) return { opacity: 1, transform: 'none' };
  
  const progress = Math.min(frame / preset.duration, 1);
  const eased = applyEasing(progress, preset.easing);
  
  const opacity = interpolate(eased, preset.transform?.opacity ?? 0, 1);
  const transforms: string[] = [];
  
  if (preset.transform?.x !== undefined) {
    const x = interpolate(eased, preset.transform.x, 0);
    transforms.push(`translateX(${x}px)`);
  }
  
  if (preset.transform?.y !== undefined) {
    const y = interpolate(eased, preset.transform.y, 0);
    transforms.push(`translateY(${y}px)`);
  }
  
  if (preset.transform?.scale !== undefined) {
    const scale = interpolate(eased, preset.transform.scale, 1);
    transforms.push(`scale(${scale})`);
  }
  
  return {
    opacity,
    transform: transforms.length > 0 ? transforms.join(' ') : 'none'
  };
}

/**
 * Generate camera drift animation for background elements
 */
export function getCameraDrift(frame: number, totalFrames: number): {
  transform: string;
} {
  const progress = frame / totalFrames;
  const scale = interpolate(
    progress,
    CAMERA_DRIFT.scale.min,
    CAMERA_DRIFT.scale.max
  );
  
  return {
    transform: `scale(${scale})`
  };
}

/**
 * Calculate staggered delay for multiple elements
 */
export function getStaggerDelay(
  index: number,
  stagger: keyof typeof STAGGER = 'normal'
): number {
  return index * STAGGER[stagger];
}

/**
 * Ensure animations don't exceed concurrent limit
 */
export function validateConcurrentAnimations(
  animations: Array<{ start: number; end: number }>,
  maxConcurrent: number = 3
): { valid: boolean; violations: string[] } {
  const violations: string[] = [];
  
  for (let frame = 0; frame < Math.max(...animations.map(a => a.end)); frame++) {
    const activeCount = animations.filter(
      a => frame >= a.start && frame <= a.end
    ).length;
    
    if (activeCount > maxConcurrent) {
      violations.push(
        `Frame ${frame}: ${activeCount} concurrent animations (max ${maxConcurrent})`
      );
    }
  }
  
  return {
    valid: violations.length === 0,
    violations
  };
}

/**
 * Align reveals to VO cues with tolerance
 */
export function alignToCues(
  reveals: Array<{ frame: number; id: string }>,
  cues: Array<{ frame: number; id: string }>,
  tolerance: number = 6 // ±0.2s at 30fps
): Array<{ revealId: string; cueId: string; aligned: boolean; offset: number }> {
  return reveals.map(reveal => {
    const closestCue = cues.reduce((closest, cue) => {
      const offset = Math.abs(reveal.frame - cue.frame);
      const closestOffset = Math.abs(reveal.frame - closest.frame);
      return offset < closestOffset ? cue : closest;
    }, cues[0]);
    
    const offset = reveal.frame - closestCue.frame;
    const aligned = Math.abs(offset) <= tolerance;
    
    return {
      revealId: reveal.id,
      cueId: closestCue.id,
      aligned,
      offset
    };
  });
}

// Utility functions
function interpolate(progress: number, from: number, to: number): number {
  return from + (to - from) * progress;
}

function applyEasing(
  progress: number,
  easing: keyof typeof TIMING.easings
): number {
  // Simplified cubic-bezier approximation
  // In real implementation, use proper cubic-bezier calculation
  const [x1, y1, x2, y2] = TIMING.easings[easing];
  
  switch (easing) {
    case 'gentle':
      return progress * progress * (3 - 2 * progress); // smoothstep
    case 'emphasis':
      return progress < 0.5 
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;
    case 'sharp':
      return progress * progress;
    default:
      return progress; // linear fallback
  }
}

// Exports already declared above with individual export statements