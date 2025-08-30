import React from "react";
import { Sequence, useVideoConfig, getInputProps, Audio, staticFile, AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { RESOLUTIONS, calculateCardPositions, type ResolutionConfig } from "./config/resolutions";
import type { ReportAnalysis } from "../src/types/index.js";
import { estimateSegmentDuration, calculateTotalDuration } from "./utils/ttsDuration";

// Import manual segments for backwards compatibility - REMOVED (components don't exist)

interface EnhancedSequenceProps {
  analysis?: ReportAnalysis;
  useManualSegments?: boolean; // Flag to use manual segments 1-6
}

// Rich animated component with proper absolute positioning
const RichSegment: React.FC<{ 
  segment: any; 
  segmentIndex: number;
  resolution?: ResolutionConfig;
}> = ({ segment, segmentIndex, resolution = RESOLUTIONS.hd }) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();

  // Rich animations
  const titleOpacity = interpolate(frame, [0, 30], [0, 1], { 
    extrapolateLeft: 'clamp', 
    extrapolateRight: 'clamp' 
  });
  
  const slideInY = interpolate(frame, [0, 60], [50, 0], { 
    extrapolateLeft: 'clamp', 
    extrapolateRight: 'clamp' 
  });

  // Calculate positions for cards/elements using absolute positioning
  const hasCards = segment.cards || segment.key_points?.length > 0;
  const numCards = segment.cards?.length || segment.key_points?.length || 0;
  const cardPositions = hasCards ? calculateCardPositions(resolution, Math.min(numCards, 3)) : [];

  return (
    <AbsoluteFill style={{ width, height }}>
      {/* Audio for this segment if available */}
      {segment.audio_file && (
        <Audio src={staticFile(`audio/${segment.audio_file}`)} />
      )}
      
      {/* Background with gradient */}
      <div style={{
        position: 'absolute',
        width,
        height,
        background: segment.background_gradient || 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
        overflow: 'hidden'
      }}>
        {/* Animated background pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 20% 20%, rgba(59, 130, 246, 0.15) 0%, transparent 50%),
                      radial-gradient(circle at 80% 80%, rgba(239, 68, 68, 0.15) 0%, transparent 50%)`,
          opacity: interpolate(frame, [0, 90], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })
        }} />
      </div>

      {/* Title - Absolute positioned */}
      <div style={{
        position: 'absolute',
        top: resolution.zones.contentPadding,
        left: 0,
        width,
        opacity: titleOpacity,
        transform: `translateY(${slideInY}px)`,
      }}>
        <h1 style={{
          fontSize: resolution.fonts.title,
          fontWeight: 800,
          letterSpacing: '-0.02em',
          lineHeight: 1.1,
          margin: 0,
          textAlign: 'center',
          color: '#ffffff',
          textShadow: '0 4px 20px rgba(0,0,0,0.3)'
        }}>
          {segment.title || `Segment ${segmentIndex + 1}`}
        </h1>
        {segment.subtitle && (
          <p style={{
            fontSize: resolution.fonts.subtitle,
            fontWeight: 400,
            color: '#94a3b8',
            margin: '16px 0 0 0',
            letterSpacing: '0.01em',
            textAlign: 'center'
          }}>
            {segment.subtitle}
          </p>
        )}
      </div>

      {/* Cards/Content - Absolute positioned */}
      {hasCards && cardPositions.map((pos, index) => {
        const cardOpacity = interpolate(
          frame, 
          [60 + index * 20, 90 + index * 20], 
          [0, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );
        
        const cardScale = interpolate(
          frame,
          [60 + index * 20, 90 + index * 20],
          [0.8, 1],
          { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
        );

        const content = segment.cards?.[index] || segment.key_points?.[index];
        if (!content) return null;

        return (
          <div
            key={index}
            style={{
              position: 'absolute',
              left: pos.x,
              top: pos.y,
              width: resolution.cards.width,
              height: resolution.cards.height,
              opacity: cardOpacity,
              transform: `scale(${cardScale})`,
            }}
          >
            <div style={{
              width: '100%',
              height: '100%',
              background: 'rgba(255,255,255,0.1)',
              backdropFilter: 'blur(10px)',
              borderRadius: 20,
              border: '1px solid rgba(255,255,255,0.2)',
              padding: 30,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              boxShadow: '0 20px 40px -10px rgba(0,0,0,0.3)'
            }}>
              {typeof content === 'object' && content.icon && (
                <div style={{
                  fontSize: 60,
                  marginBottom: 20,
                  textAlign: 'center'
                }}>
                  {content.icon}
                </div>
              )}
              <h3 style={{
                fontSize: resolution.fonts.body,
                fontWeight: 600,
                color: '#ffffff',
                marginBottom: 12,
                textAlign: 'center'
              }}>
                {typeof content === 'object' ? content.title : content}
              </h3>
              {typeof content === 'object' && content.description && (
                <p style={{
                  fontSize: resolution.fonts.small,
                  color: '#cbd5e1',
                  textAlign: 'center',
                  lineHeight: 1.5
                }}>
                  {content.description}
                </p>
              )}
            </div>
          </div>
        );
      })}

      {/* Key statistic - Absolute positioned */}
      {segment.key_statistic && (
        <div style={{
          position: 'absolute',
          bottom: resolution.zones.footerHeight,
          left: 0,
          width,
          opacity: interpolate(frame, [120, 180], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          }),
          textAlign: 'center'
        }}>
          <div style={{
            fontSize: resolution.fonts.title * 1.5,
            fontWeight: 900,
            letterSpacing: '-0.05em',
            lineHeight: 1,
            background: 'linear-gradient(135deg, #10b981 0%, #06b6d4 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: 16
          }}>
            {segment.key_statistic.value}
          </div>
          <div style={{
            fontSize: resolution.fonts.subtitle,
            fontWeight: 600,
            color: '#cbd5e1',
            letterSpacing: '0.02em'
          }}>
            {segment.key_statistic.description}
          </div>
        </div>
      )}

      {/* Chart visualization if present */}
      {segment.chart_data && (
        <div style={{
          position: 'absolute',
          left: (width - 800) / 2,
          top: resolution.zones.headerHeight + 100,
          width: 800,
          height: 400,
          opacity: interpolate(frame, [90, 150], [0, 1], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp'
          })
        }}>
          {/* Placeholder for chart - would integrate with recharts or similar */}
          <div style={{
            width: '100%',
            height: '100%',
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 20,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: resolution.fonts.body,
            color: '#64748b'
          }}>
            Chart: {segment.chart_data.type}
          </div>
        </div>
      )}
    </AbsoluteFill>
  );
};

export const EnhancedSequence: React.FC<EnhancedSequenceProps> = ({
  analysis,
  useManualSegments = false
}) => {
  const { fps } = useVideoConfig();
  const inputProps = getInputProps() as any;
  
  // Use passed analysis or get from inputProps
  const data = analysis || inputProps?.analysis || inputProps;
  
  // Check if we should use manual segments (for your ongoing project)
  if (useManualSegments || !data?.video_segments) {
    // Fallback to manual segments with hardcoded durations
    const segmentDurations = [15, 30, 18, 24, 17, 18];
    let currentFrame = 0;
    
    const manualSegments = [Segment1, Segment2, Segment3, Segment4, Segment5, Segment6];
    
    return (
      <>
        {manualSegments.map((SegmentComponent, index) => {
          if (index >= segmentDurations.length) return null;
          
          const durationInFrames = segmentDurations[index] * fps;
          const sequenceElement = (
            <Sequence
              key={`manual-segment-${index}`}
              from={currentFrame}
              durationInFrames={durationInFrames}
            >
              <SegmentComponent />
            </Sequence>
          );
          
          currentFrame += durationInFrames;
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
              resolution={RESOLUTIONS.hd}
            />
          </Sequence>
        );
        
        currentFrame += durationInFrames;
        return sequenceElement;
      })}
    </>
  );
};