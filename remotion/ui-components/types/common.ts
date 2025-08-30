import React from 'react';

export interface MotionProps {
  children?: React.ReactNode;
  startAt?: number;
  durationInFrames?: number;
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out';
  className?: string;
  style?: React.CSSProperties;
}