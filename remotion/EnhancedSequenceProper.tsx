import React from "react";
import { 
  Sequence, 
  useVideoConfig, 
  getInputProps, 
  Audio, 
  staticFile, 
  AbsoluteFill, 
  interpolate, 
  useCurrentFrame,
  spring
} from "remotion";
import type { ReportAnalysis } from "../src/types/index.js";
import { estimateSegmentDuration } from "./utils/ttsDuration";

// Import manual segments for backwards compatibility - REMOVED (components don't exist)
// More segment imports removed

interface EnhancedSequenceProperProps {
  analysis?: ReportAnalysis;
  useManualSegments?: boolean;
}

// Title section component - DataStoryProper style
const TitleSection: React.FC<{ 
  title: string; 
  frame: number; 
  fps: number;
  subtitle?: string;
}> = ({ title, frame, fps, subtitle }) => {
  const titleProgress = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 180 },
  });

  const titleY = interpolate(titleProgress, [0, 1], [-30, 0]);
  const titleOpacity = titleProgress;

  return (
    <div
      style={{
        position: 'absolute',
        top: 120,
        left: 0,
        right: 0,
        width: 1920,
        textAlign: 'center',
        transform: `translateY(${titleY}px)`,
        opacity: titleOpacity,
      }}
    >
      <h1
        style={{
          fontSize: 84,
          fontWeight: 800,
          color: '#FFFFFF',
          margin: 0,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          letterSpacing: '-2px',
          textShadow: '0 4px 24px rgba(0, 0, 0, 0.5), 0 0 80px rgba(0, 212, 255, 0.3)',
        }}
      >
        {title}
      </h1>
      {subtitle && (
        <p
          style={{
            fontSize: 36,
            fontWeight: 400,
            color: 'rgba(255, 255, 255, 0.7)',
            margin: '20px 0 0 0',
            fontFamily: 'system-ui, -apple-system, sans-serif',
          }}
        >
          {subtitle}
        </p>
      )}
      <div
        style={{
          width: 300,
          height: 4,
          background: 'linear-gradient(90deg, transparent, #00D4FF, transparent)',
          margin: '40px auto 0',
          opacity: interpolate(frame, [15, 30], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
          }),
        }}
      />
    </div>
  );
};

// Cards section component - DataStoryProper style
const CardsSection: React.FC<{
  keyPoints: any[];
  narrative?: string;
  frame: number;
  fps: number;
}> = ({ keyPoints, narrative, frame, fps }) => {
  const cardWidth = 500;
  const cardHeight = 350;
  const cardGap = 60;
  const numCards = Math.min(keyPoints.length, 3);
  const totalWidth = (cardWidth * numCards) + (cardGap * (numCards - 1));
  const startX = (1920 - totalWidth) / 2;
  const cardY = 380;

  return (
    <>
      {keyPoints.slice(0, 3).map((point, index) => {
        const cardX = startX + (index * (cardWidth + cardGap));
        const entryDelay = 20 + (index * 30);
        
        const entryProgress = spring({
          frame: frame - entryDelay,
          fps,
          config: { damping: 20, stiffness: 100 },
        });

        const cardScale = entryProgress;
        const cardOpacity = entryProgress;

        // Icon bounce
        const iconScale = spring({
          frame: frame - entryDelay - 5,
          fps,
          config: { damping: 10, stiffness: 200 },
        });

        // Determine icon based on content
        const icons = ['💰', '📊', '🚀', '🎯', '⚡'];
        const icon = point.icon || icons[index] || '✨';

        // Format the point text
        const pointText = typeof point === 'string' ? point : (point.text || point.content || '');
        const pointValue = point.value || '';
        const pointChange = point.change || '';

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: cardX,
              top: cardY,
              width: cardWidth,
              height: cardHeight,
              backgroundColor: 'rgba(255, 255, 255, 0.06)',
              borderRadius: 28,
              padding: 40,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
              transform: `scale(${cardScale})`,
              opacity: cardOpacity,
              border: '2px solid rgba(0, 212, 255, 0.3)',
              boxShadow: '0 16px 64px rgba(0, 212, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              backdropFilter: 'blur(12px)',
            }}
          >
            {/* Icon */}
            <div
              style={{
                width: 90,
                height: 90,
                borderRadius: 24,
                background: 'linear-gradient(135deg, #00D4FF, #0099CC)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 48,
                transform: `scale(${iconScale})`,
                boxShadow: '0 8px 32px rgba(0, 212, 255, 0.4)',
              }}
            >
              {icon}
            </div>

            {/* Content */}
            <div
              style={{
                fontSize: 28,
                color: '#FFFFFF',
                fontWeight: 600,
                fontFamily: 'system-ui, -apple-system, sans-serif',
                textAlign: 'center',
                lineHeight: 1.4,
              }}
            >
              {pointText}
            </div>

            {/* Value if present */}
            {pointValue && (
              <div
                style={{
                  fontSize: 56,
                  fontWeight: 700,
                  color: '#00D4FF',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
                }}
              >
                {pointValue}
              </div>
            )}

            {/* Change indicator if present */}
            {pointChange && (
              <div
                style={{
                  fontSize: 24,
                  fontWeight: 600,
                  color: '#00FF88',
                  fontFamily: 'system-ui, -apple-system, sans-serif',
                  opacity: interpolate(frame - entryDelay, [20, 35], [0, 1], {
                    extrapolateLeft: 'clamp',
                    extrapolateRight: 'clamp',
                  }),
                }}
              >
                {pointChange}
              </div>
            )}
          </div>
        );
      })}
    </>
  );
};

// Narrative section for segments without cards
const NarrativeSection: React.FC<{
  narrative: string;
  frame: number;
  fps: number;
}> = ({ narrative, frame, fps }) => {
  const narrativeProgress = spring({
    frame,
    fps,
    config: { damping: 22, stiffness: 100 },
  });

  const opacity = narrativeProgress;
  const slideY = interpolate(narrativeProgress, [0, 1], [30, 0]);

  return (
    <div
      style={{
        position: 'absolute',
        top: 340,
        left: 200,
        right: 200,
        opacity,
        transform: `translateY(${slideY}px)`,
      }}
    >
      <p
        style={{
          fontSize: 42,
          color: '#FFFFFF',
          lineHeight: 1.8,
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
        }}
      >
        {narrative}
      </p>
    </div>
  );
};

// Rich animated segment with DataStoryProper formatting
const RichSegment: React.FC<{ 
  segment: any; 
  segmentIndex: number;
}> = ({ segment, segmentIndex }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Calculate segment duration
  const segmentDuration = estimateSegmentDuration(segment) * fps;
  
  // Exit animation for segments longer than 6 seconds
  const exitStartFrame = Math.max(segmentDuration - 30, segmentDuration * 0.85);
  const exitProgress = frame > exitStartFrame ? 
    spring({
      frame: frame - exitStartFrame,
      fps,
      config: { damping: 20, stiffness: 200 },
    }) : 0;
  
  const globalExitOpacity = interpolate(exitProgress, [0, 1], [1, 0]);
  const globalExitScale = interpolate(exitProgress, [0, 1], [1, 0.95]);

  // Background gradient shift
  const bgColorShift = interpolate(frame, [0, segmentDuration], [0, 15], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp'
  });

  return (
    <AbsoluteFill 
      style={{ 
        width: 1920, 
        height: 1080,
        background: `linear-gradient(135deg, 
          hsl(${230 + bgColorShift}, 60%, 8%), 
          hsl(${230 - bgColorShift}, 45%, 15%)
        )`
      }}
    >
      {/* Audio for this segment if available */}
      {segment.audio_file && (
        <Audio src={staticFile(`audio/${segment.audio_file}`)} />
      )}
      
      {/* Main container with exit animation */}
      <AbsoluteFill
        style={{
          opacity: globalExitOpacity,
          transform: `scale(${globalExitScale})`
        }}
      >
        {/* Title Section */}
        <TitleSection 
          title={segment.title || `Segment ${segmentIndex + 1}`}
          subtitle={segment.subtitle}
          frame={frame} 
          fps={fps}
        />

        {/* Cards or Narrative */}
        {segment.key_points && segment.key_points.length > 0 ? (
          <CardsSection
            keyPoints={segment.key_points}
            narrative={segment.narrative}
            frame={frame}
            fps={fps}
          />
        ) : segment.narrative ? (
          <NarrativeSection
            narrative={segment.narrative}
            frame={frame}
            fps={fps}
          />
        ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// Main Enhanced Sequence component
export const EnhancedSequenceProper: React.FC<EnhancedSequenceProperProps> = ({ 
  analysis,
  useManualSegments = false 
}) => {
  const { fps } = useVideoConfig();
  const inputProps = getInputProps();
  const data = analysis || inputProps?.analysis || { video_segments: [] };

  // Use manual segments if requested
  if (useManualSegments) {
    const manualSegments = [Segment1, Segment2, Segment3, Segment4, Segment5, Segment6];
    let currentFrame = 0;
    
    return (
      <>
        {manualSegments.map((SegmentComponent, index) => {
          const duration = 10 * fps; // Default 10 seconds per manual segment
          const sequenceElement = (
            <Sequence
              key={`manual-segment-${index}`}
              from={currentFrame}
              durationInFrames={duration}
            >
              <SegmentComponent />
            </Sequence>
          );
          currentFrame += duration;
          return sequenceElement;
        })}
      </>
    );
  }

  // Dynamic mode with rich animations
  let currentFrame = 0;
  
  return (
    <>
      {data.video_segments.map((segment: any, index: number) => {
        // Use actual audio duration if available, otherwise estimate from text
        const duration = segment.audio_duration || estimateSegmentDuration(segment);
        const durationInFrames = Math.floor(duration * fps);
        
        const sequenceElement = (
          <Sequence
            key={`segment-${index}`}
            from={currentFrame}
            durationInFrames={durationInFrames}
          >
            <RichSegment 
              segment={segment} 
              segmentIndex={index}
            />
          </Sequence>
        );
        
        currentFrame += durationInFrames;
        return sequenceElement;
      })}
    </>
  );
};