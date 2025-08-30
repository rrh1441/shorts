import { interpolate } from 'remotion';

export type EasingFunction = 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';

export function interpolateWithEasing(
  frame: number,
  inputRange: [number, number],
  outputRange: [number, number],
  easing: EasingFunction = 'linear'
): number {
  const easingFunctions = {
    linear: (t: number) => t,
    ease: (t: number) => t * t * (3 - 2 * t),
    'ease-in': (t: number) => t * t,
    'ease-out': (t: number) => t * (2 - t),
    'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  };

  const progress = interpolate(frame, inputRange, [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
  });

  const easedProgress = easingFunctions[easing](progress);
  
  return interpolate(easedProgress, [0, 1], outputRange);
}