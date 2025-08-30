/**
 * Custom Asset Segment Component
 * Handles user-provided video/image assets with TTS integration
 * Perfect for intros, outros, and branded content
 */

import React, { useState, useEffect } from 'react';
import { 
  Video, 
  Img, 
  Audio, 
  Sequence, 
  useCurrentFrame, 
  useVideoConfig, 
  interpolate,
  staticFile,
  AbsoluteFill
} from 'remotion';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  EFFECTS, 
  ANIMATIONS 
} from '../design/DesignSystem';
import {
  SegmentTitle,
  SegmentSubtitle,
  Background
} from '../design/LayoutComponents';
import {
  AssetMetadata,
  CustomSegmentConfig,
  TTSConfiguration
} from '../design/AssetManager';

interface CustomAssetSegmentProps {
  config: CustomSegmentConfig;
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fontConfiguration?: {
    title: string;
    subtitle: string;
    body: string;
  };
}

interface AssetDisplayProps {
  asset: AssetMetadata;
  fit?: 'cover' | 'contain' | 'fill';
  opacity?: number;
}

interface OverlayContentProps {
  overlay: NonNullable<CustomSegmentConfig['overlay']>;
  frame: number;
  totalFrames: number;
  brandColors?: CustomAssetSegmentProps['brandColors'];
  fontConfiguration?: CustomAssetSegmentProps['fontConfiguration'];
}

const AssetDisplay: React.FC<AssetDisplayProps> = ({ 
  asset, 
  fit = 'cover', 
  opacity = 1 
}) => {
  const { width, height } = useVideoConfig();

  const assetStyle = {
    width: '100%',
    height: '100%',
    objectFit: fit,
    opacity,
  };

  if (asset.type === 'video') {
    return (
      <Video
        src={asset.url}
        style={assetStyle}
        volume={0.3} // Lower volume to allow TTS to be primary audio
        loop={false}
      />
    );
  } else {
    return (
      <Img
        src={asset.url}
        style={assetStyle}
      />
    );
  }
};

const OverlayContent: React.FC<OverlayContentProps> = ({
  overlay,
  frame,
  totalFrames,
  brandColors,
  fontConfiguration
}) => {
  if (!overlay.enabled || !overlay.text) return null;

  // Animation timing for overlay text
  const fadeInStart = 30; // 1 second
  const fadeInEnd = 60;   // 2 seconds
  const fadeOutStart = totalFrames - 60; // 2 seconds before end
  const fadeOutEnd = totalFrames - 30;   // 1 second before end

  const opacity = interpolate(
    frame,
    [0, fadeInStart, fadeInEnd, fadeOutStart, fadeOutEnd, totalFrames],
    [0, 0, 1, 1, 0, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const slideY = interpolate(
    frame,
    [fadeInStart, fadeInEnd],
    [20, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  const getOverlayPosition = () => {
    switch (overlay.position) {
      case 'top':
        return {
          top: SPACING.xxl,
          left: SPACING.xxl,
          right: SPACING.xxl,
          justifyContent: 'center',
        };
      case 'center':
        return {
          top: '50%',
          left: SPACING.xxl,
          right: SPACING.xxl,
          transform: 'translateY(-50%)',
          justifyContent: 'center',
        };
      case 'bottom':
      default:
        return {
          bottom: SPACING.xxl,
          left: SPACING.xxl,
          right: SPACING.xxl,
          justifyContent: 'center',
        };
    }
  };

  return (
    <div style={{
      position: 'absolute',
      ...getOverlayPosition(),
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      opacity,
      transform: `translateY(${slideY}px)`,
      zIndex: 10,
      ...overlay.style,
    }}>
      {/* Semi-transparent background for readability */}
      <div style={{
        position: 'absolute',
        top: -SPACING.lg,
        left: -SPACING.xxl,
        right: -SPACING.xxl,
        bottom: -SPACING.lg,
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        borderRadius: EFFECTS.borderRadius.large,
        backdropFilter: 'blur(8px)',
      }} />
      
      <div style={{
        position: 'relative',
        textAlign: 'center',
        color: COLORS.textPrimary,
        padding: SPACING.lg,
      }}>
        {overlay.text.split('\n').map((line, index) => {
          const isTitle = index === 0;
          return (
            <div
              key={index}
              style={{
                fontFamily: fontConfiguration ? 
                  (isTitle ? fontConfiguration.title : fontConfiguration.subtitle) : 
                  TYPOGRAPHY.h2.fontFamily,
                fontSize: isTitle ? TYPOGRAPHY.h2.fontSize : TYPOGRAPHY.body.fontSize,
                fontWeight: isTitle ? TYPOGRAPHY.h2.fontWeight : TYPOGRAPHY.body.fontWeight,
                color: isTitle ? (brandColors?.primary || COLORS.primary) : COLORS.textPrimary,
                marginBottom: isTitle ? SPACING.md : SPACING.sm,
                letterSpacing: isTitle ? TYPOGRAPHY.h2.letterSpacing : 'normal',
                textShadow: '0 2px 4px rgba(0, 0, 0, 0.8)',
              }}
            >
              {line}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const TTSAudio: React.FC<{ tts: TTSConfiguration }> = ({ tts }) => {
  // In production, this would use the actual TTS-generated audio file
  const audioSrc = `audio/tts-${tts.voice}-${Date.now()}.mp3`; // Mock filename
  
  return (
    <Sequence from={tts.timing.startTime * 30}> {/* Convert seconds to frames */}
      <Audio
        src={staticFile(audioSrc)}
        volume={tts.volume}
        // Additional audio processing would go here
      />
    </Sequence>
  );
};

const CustomAssetSegment: React.FC<CustomAssetSegmentProps> = ({
  config,
  brandColors = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.tertiary
  },
  fontConfiguration
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const totalFrames = config.duration * fps;

  const [ttsGenerated, setTtsGenerated] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate TTS on component mount if needed
  useEffect(() => {
    const generateTTSIfNeeded = async () => {
      if (config.tts && !ttsGenerated) {
        try {
          // In production, this would call the TTS generation API
          // const ttsResult = await AssetManager.generateTTS(config.tts);
          setTtsGenerated(true);
        } catch (err) {
          setError(err instanceof Error ? err.message : 'TTS generation failed');
        }
      }
    };

    generateTTSIfNeeded();
  }, [config.tts, ttsGenerated]);

  // Asset opacity animation for smooth transitions
  const assetOpacity = interpolate(
    frame,
    [0, 15, totalFrames - 15, totalFrames],
    [0, 1, 1, 0],
    { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }
  );

  if (error) {
    return (
      <AbsoluteFill style={{
        backgroundColor: COLORS.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: COLORS.error,
        fontSize: TYPOGRAPHY.body.fontSize,
        textAlign: 'center',
        padding: SPACING.xxl,
      }}>
        <div>
          <h3>Segment Error</h3>
          <p>{error}</p>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <>
      {/* TTS Audio */}
      {config.tts && ttsGenerated && (
        <TTSAudio tts={config.tts} />
      )}

      <AbsoluteFill>
        {/* Asset Display */}
        <AssetDisplay 
          asset={config.asset} 
          opacity={assetOpacity}
          fit={config.asset.type === 'video' ? 'cover' : 'contain'}
        />

        {/* Overlay Content */}
        {config.overlay && (
          <OverlayContent
            overlay={config.overlay}
            frame={frame}
            totalFrames={totalFrames}
            brandColors={brandColors}
            fontConfiguration={fontConfiguration}
          />
        )}

        {/* Debug Info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div style={{
            position: 'absolute',
            top: SPACING.sm,
            right: SPACING.sm,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: 'white',
            padding: SPACING.xs,
            fontSize: 12,
            borderRadius: 4,
            fontFamily: 'monospace',
          }}>
            {config.name} | Frame: {frame}/{totalFrames} | Asset: {config.asset.type}
          </div>
        )}
      </AbsoluteFill>
    </>
  );
};

// Preset Components for Common Use Cases

export const IntroSegment: React.FC<{
  asset: AssetMetadata;
  brandName: string;
  tagline?: string;
  duration?: number;
  ttsScript?: string;
  voice?: string;
  brandColors?: CustomAssetSegmentProps['brandColors'];
}> = ({
  asset,
  brandName,
  tagline,
  duration = 5,
  ttsScript,
  voice = 'alloy',
  brandColors
}) => {
  const config: CustomSegmentConfig = {
    id: 'intro-' + Date.now(),
    name: 'Brand Intro',
    asset,
    duration,
    type: 'intro',
    overlay: {
      enabled: true,
      text: tagline ? `${brandName}\n${tagline}` : brandName,
      position: 'center'
    },
    tts: ttsScript ? {
      script: ttsScript,
      voice,
      timing: { startTime: 0.5 },
      volume: 0.8,
      fadeIn: 0.2,
      fadeOut: 0.3
    } : undefined
  };

  return <CustomAssetSegment config={config} brandColors={brandColors} />;
};

export const OutroSegment: React.FC<{
  asset: AssetMetadata;
  callToAction: string;
  contact?: string;
  duration?: number;
  ttsScript?: string;
  voice?: string;
  brandColors?: CustomAssetSegmentProps['brandColors'];
}> = ({
  asset,
  callToAction,
  contact,
  duration = 8,
  ttsScript,
  voice = 'nova',
  brandColors
}) => {
  const config: CustomSegmentConfig = {
    id: 'outro-' + Date.now(),
    name: 'Call to Action',
    asset,
    duration,
    type: 'outro',
    overlay: {
      enabled: true,
      text: contact ? `${callToAction}\n${contact}` : callToAction,
      position: 'bottom'
    },
    tts: ttsScript ? {
      script: ttsScript,
      voice,
      timing: { startTime: 1.0 },
      volume: 0.9,
      fadeIn: 0.3,
      fadeOut: 0.5
    } : undefined
  };

  return <CustomAssetSegment config={config} brandColors={brandColors} />;
};

export const LogoRevealSegment: React.FC<{
  asset: AssetMetadata;
  duration?: number;
  ttsScript?: string;
  voice?: string;
  brandColors?: CustomAssetSegmentProps['brandColors'];
}> = ({
  asset,
  duration = 3,
  ttsScript,
  voice = 'echo',
  brandColors
}) => {
  const config: CustomSegmentConfig = {
    id: 'logo-' + Date.now(),
    name: 'Logo Reveal',
    asset,
    duration,
    type: 'intro',
    overlay: {
      enabled: false,
      position: 'center' as const
    },
    tts: ttsScript ? {
      script: ttsScript,
      voice,
      timing: { startTime: 0.2 },
      volume: 0.7,
      fadeIn: 0.1,
      fadeOut: 0.2
    } : undefined
  };

  return <CustomAssetSegment config={config} brandColors={brandColors} />;
};

export default CustomAssetSegment;