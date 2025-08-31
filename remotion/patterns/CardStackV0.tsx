import React, { useMemo } from 'react';
import { AbsoluteFill, interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { tokensFor, type VideoFormat } from '../design/Tokens';

export type StackItem = {
  id: string;
  title: string;
  subtitle?: string;
};

type Beats = {
  intro: number;
  perCard: number;
  outro: number;
};

type Props = {
  format?: VideoFormat;
  items: StackItem[];
  beats?: Beats;
};

const Grain: React.FC<{ opacity: number }> = ({ opacity }) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      pointerEvents: 'none',
      backgroundImage:
        "url('data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%224%22 height=%224%22><filter id=%22n%22><feTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%222%22 stitchTiles=%22stitch%22/></filter><rect width=%224%22 height=%224%22 filter=%22url(%23n)%22 opacity=%220.5%22/></svg>')",
      opacity,
      mixBlendMode: 'overlay',
    }}
  />
);

export const CardStackV0: React.FC<Props> = ({
  format = 'vertical',
  items,
  beats = { intro: 45, perCard: 90, outro: 45 },
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const t = tokensFor(format);

  const total = beats.intro + items.length * beats.perCard + beats.outro;

  // Intro presence of the whole stack
  const intro = spring({ frame, fps, durationInFrames: Math.max(18, Math.floor(beats.intro * 0.8)), config: { damping: 200, stiffness: 120, mass: 0.8 } });

  // Subtle camera drift
  const driftX = interpolate(frame, [0, total], [-14, 14], { extrapolateRight: 'clamp' });
  const driftY = interpolate(frame, [0, total], [8, -8], { extrapolateRight: 'clamp' });

  // Stack layout (relative to safe area)
  const stackGap = 36; // px between cards for clearer layering
  const baseTilt = 3; // deg
  const baseShift = 12; // px

  const offsets = useMemo(() => items.map((_, i) => ((i * 37) % 9) - 4), [items]);

  const maxCardWidth = Math.min(980, t.canvas.width - t.layout.side * 2);
  const cardHeight = Math.round(maxCardWidth * 0.68); // Taller for readability

  const renderCard = (item: StackItem, i: number) => {
    const start = beats.intro + i * beats.perCard;
    const end = start + beats.perCard;

    const inProg = interpolate(frame, [start, start + beats.perCard * 0.25], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const outProg = interpolate(frame, [end - beats.perCard * 0.2, end], [1, 0], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' });
    const focus = Math.min(inProg, outProg);

    // Base stack pos
    const yStack = i * stackGap;
    const rotStack = (i % 2 === 0 ? 1 : -1) * (baseTilt + offsets[i] * 0.2);
    const xStack = (i % 2 === 0 ? 1 : -1) * (baseShift + Math.abs(offsets[i]) * 0.6);

    // Focus transforms
    const y = interpolate(focus, [0, 1], [yStack, -Math.round(cardHeight * 0.08)]);
    const rot = interpolate(focus, [0, 1], [rotStack, 0]);
    const x = interpolate(focus, [0, 1], [xStack, 0]);
    const scale = interpolate(focus, [0, 1], [1, 1.04]);

    // Per-card intro lift
    const introStart = Math.max(0, beats.intro - (items.length - i) * 3);
    const cardIntro = spring({ frame: frame - introStart, fps, durationInFrames: 20, config: { damping: 200, stiffness: 120, mass: 0.9 } });

    const opacity = intro * interpolate(focus, [0, 0.05, 1], [0.9, 1, 1]);
    const zIndex = Math.round(100 + i + focus * 100);

    return (
      <div
        key={item.id}
        style={{
          position: 'absolute',
          left: t.layout.side + (t.canvas.width - t.layout.side * 2 - maxCardWidth) / 2 + x + driftX,
          top: t.layout.top + y + driftY,
          width: maxCardWidth,
          height: cardHeight,
          borderRadius: 24,
          transform: `scale(${scale}) rotate(${rot}deg)`,
          transformOrigin: 'center',
          opacity,
          zIndex,
          // Gradient surface
          background: 'linear-gradient(135deg, #111827 0%, #0f172a 60%, #1f2937 100%)',
          boxShadow: '0 2px 0 rgba(255,255,255,0.02) inset',
          overflow: 'hidden',
        }}
      >
        {/* Accent ring */}
        <div style={{ position: 'absolute', inset: 0, borderRadius: 24, boxShadow: '0 0 0 2px rgba(255,255,255,0.08) inset' }} />
        {/* Headline area */}
        <div style={{ position: 'absolute', left: 32, right: 32, top: 32, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div style={{ fontSize: t.headline.size, fontWeight: 800, letterSpacing: 0.2, color: '#e5e7eb', textShadow: '0 1px 0 rgba(0,0,0,0.35)', lineHeight: 1.04 }}>
            {item.title}
          </div>
          {item.subtitle && (
            <div style={{ fontSize: t.subhead.size, fontWeight: 600, color: '#cbd5e1', lineHeight: 1.15 }}>
              {item.subtitle}
            </div>
          )}
        </div>
        {/* Minimal accent bar bottom */}
        <div style={{ position: 'absolute', left: 32, bottom: 24, width: 200, height: 8, background: '#e5e7eb', borderRadius: 9999, opacity: 0.9 }} />
      </div>
    );
  };

  return (
    <AbsoluteFill style={{ background: '#0b0f13' }}>
      {/* Background radial vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(60% 50% at 50% 35%, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.0) 70%)',
          opacity: 1,
        }}
      />
      <Grain opacity={0.06} />
      {/* Stack */}
      <div style={{ position: 'absolute', inset: 0, opacity: intro }}>
        {items.map((it, i) => renderCard(it, i))}
      </div>
    </AbsoluteFill>
  );
};

export default CardStackV0;
