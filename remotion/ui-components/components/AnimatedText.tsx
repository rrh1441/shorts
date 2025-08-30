import React from 'react';
import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { AnimatedTextPropsSchema, getAnimatedTextDefaults } from './AnimatedText.schema';
import type { AnimatedTextProps } from './AnimatedText.schema';

// Export schema and defaults for AI consumption
export { AnimatedTextPropsSchema, getAnimatedTextDefaults };

export const AnimatedText: React.FC<AnimatedTextProps> = ({
  text,
  fontSize = 48,
  fontWeight = 'normal',
  color = '#000000',
  fontFamily = 'Inter, sans-serif',
  animationType = 'fade',
  direction = 'left',
  startAt = 0,
  durationInFrames = 60,
  characterDelay = 2,
  className,
  style,
  textAlign = 'left',
  lineHeight = 1.2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const currentFrame = frame - startAt;

  const baseStyle: React.CSSProperties = {
    fontSize,
    fontWeight,
    color,
    fontFamily,
    textAlign,
    lineHeight,
    margin: 0,
    ...style,
  };

  // Typewriter effect
  if (animationType === 'typewriter') {
    const progress = Math.max(0, Math.min(1, currentFrame / durationInFrames));
    const visibleCharacters = Math.floor(progress * text.length);
    const displayText = text.substring(0, visibleCharacters);
    
    const showCursor = currentFrame < durationInFrames && Math.floor(currentFrame / 15) % 2 === 0;
    
    return (
      <div className={className} style={baseStyle}>
        {displayText}
        {showCursor && (
          <span style={{ 
            animation: 'none',
            opacity: 1,
            marginLeft: '2px',
          }}>
            |
          </span>
        )}
      </div>
    );
  }

  // Character-by-character reveal
  if (animationType === 'reveal') {
    const characters = text.split('');
    
    return (
      <div className={className} style={baseStyle}>
        {characters.map((char, index) => {
          const charProgress = interpolate(
            currentFrame,
            [index * characterDelay, index * characterDelay + 20],
            [0, 1],
            {
              extrapolateLeft: 'clamp',
              extrapolateRight: 'clamp',
            }
          );

          const opacity = charProgress;
          const scale = interpolate(charProgress, [0, 1], [0.5, 1]);

          return (
            <span
              key={index}
              style={{
                display: char === ' ' ? 'inline' : 'inline-block',
                opacity,
                transform: `scale(${scale})`,
                transformOrigin: 'center',
              }}
            >
              {char === ' ' ? '\u00A0' : char}
            </span>
          );
        })}
      </div>
    );
  }

  // Standard animations
  const progress = spring({
    frame: currentFrame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: durationInFrames,
  });

  let transform = 'none';
  let opacity = 1;

  switch (animationType) {
    case 'fade':
      opacity = progress;
      break;
      
    case 'slide':
      const slideDistance = 50;
      let translateX = 0;
      let translateY = 0;
      
      switch (direction) {
        case 'left':
          translateX = interpolate(progress, [0, 1], [-slideDistance, 0]);
          break;
        case 'right':
          translateX = interpolate(progress, [0, 1], [slideDistance, 0]);
          break;
        case 'up':
          translateY = interpolate(progress, [0, 1], [-slideDistance, 0]);
          break;
        case 'down':
          translateY = interpolate(progress, [0, 1], [slideDistance, 0]);
          break;
      }
      
      transform = `translate(${translateX}px, ${translateY}px)`;
      opacity = progress;
      break;
      
    case 'scale':
      const scale = interpolate(progress, [0, 1], [0.5, 1]);
      transform = `scale(${scale})`;
      opacity = progress;
      break;
  }

  return (
    <div
      className={className}
      style={{
        ...baseStyle,
        transform,
        opacity,
        transformOrigin: 'center',
      }}
    >
      {text}
    </div>
  );
};