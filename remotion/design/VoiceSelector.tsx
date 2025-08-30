/**
 * Voice Selection Modal Component
 * Allows users to select from OpenAI's different voice models with sample previews
 * Based on lessons learned from manual video generation process
 */

import React, { useState, useRef, useCallback } from 'react';
import { CSSProperties } from 'react';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  EFFECTS, 
  Z_INDEX 
} from './DesignSystem';

// OpenAI TTS Voice Models (as of 2024/2025)
export const OPENAI_VOICES = {
  alloy: {
    name: 'Alloy',
    description: 'Neutral, balanced voice suitable for professional content',
    characteristics: ['Professional', 'Clear', 'Neutral'],
    bestFor: ['Corporate videos', 'Educational content', 'Presentations'],
    gender: 'Neutral',
    accent: 'American',
    sample: 'Hello, this is the Alloy voice. I have a clear, professional tone that works well for business presentations.'
  },
  echo: {
    name: 'Echo',
    description: 'Warm, friendly voice with slight masculine tone',
    characteristics: ['Warm', 'Friendly', 'Engaging'],
    bestFor: ['Explainer videos', 'Customer-facing content', 'Tutorials'],
    gender: 'Masculine',
    accent: 'American',
    sample: 'Hi there! I\'m Echo, and I bring a warm, friendly tone to your videos that helps connect with your audience.'
  },
  fable: {
    name: 'Fable',
    description: 'Storytelling voice with dramatic flair',
    characteristics: ['Dramatic', 'Storytelling', 'Expressive'],
    bestFor: ['Narrative videos', 'Brand storytelling', 'Creative content'],
    gender: 'Neutral',
    accent: 'American',
    sample: 'Welcome to a story unlike any other. I\'m Fable, and I specialize in bringing narratives to life with expression.'
  },
  onyx: {
    name: 'Onyx',
    description: 'Deep, authoritative voice for serious content',
    characteristics: ['Authoritative', 'Deep', 'Serious'],
    bestFor: ['Financial content', 'Legal videos', 'Formal presentations'],
    gender: 'Masculine',
    accent: 'American',
    sample: 'Good day. I\'m Onyx, providing authoritative narration for your most important business communications.'
  },
  nova: {
    name: 'Nova',
    description: 'Bright, energetic voice perfect for dynamic content',
    characteristics: ['Energetic', 'Bright', 'Dynamic'],
    bestFor: ['Marketing videos', 'Product demos', 'Social media content'],
    gender: 'Feminine',
    accent: 'American',
    sample: 'Hey everyone! I\'m Nova, bringing energy and excitement to your videos with a bright, engaging delivery!'
  },
  shimmer: {
    name: 'Shimmer',
    description: 'Gentle, soothing voice ideal for wellness and lifestyle',
    characteristics: ['Gentle', 'Soothing', 'Calming'],
    bestFor: ['Wellness content', 'Meditation apps', 'Lifestyle videos'],
    gender: 'Feminine',
    accent: 'American',
    sample: 'Hello, I\'m Shimmer. My gentle, calming voice creates a peaceful atmosphere for your wellness content.'
  }
};

interface VoiceSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceSelect: (voice: keyof typeof OPENAI_VOICES) => void;
  selectedVoice?: keyof typeof OPENAI_VOICES;
  showSamples?: boolean;
}

interface VoiceCardProps {
  voiceKey: keyof typeof OPENAI_VOICES;
  voice: typeof OPENAI_VOICES[keyof typeof OPENAI_VOICES];
  isSelected: boolean;
  onSelect: () => void;
  onPlaySample?: () => void;
  isPlaying?: boolean;
}

const VoiceCard: React.FC<VoiceCardProps> = ({
  voiceKey,
  voice,
  isSelected,
  onSelect,
  onPlaySample,
  isPlaying = false
}) => {
  const cardStyle: CSSProperties = {
    padding: SPACING.lg,
    backgroundColor: isSelected ? COLORS.primary : COLORS.surface,
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`,
    borderRadius: EFFECTS.borderRadius.large,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: SPACING.md,
  };

  const titleStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.h3.fontSize,
    fontWeight: TYPOGRAPHY.h3.fontWeight,
    color: isSelected ? COLORS.background : COLORS.textPrimary,
    margin: `0 0 ${SPACING.sm}px 0`,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.body.fontSize,
    color: isSelected ? COLORS.background : COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 1.4,
  };

  const characteristicsStyle: CSSProperties = {
    display: 'flex',
    flexWrap: 'wrap',
    gap: SPACING.xs,
    marginBottom: SPACING.md,
  };

  const tagStyle: CSSProperties = {
    padding: `${SPACING.xs}px ${SPACING.sm}px`,
    backgroundColor: isSelected ? COLORS.background : COLORS.primary,
    color: isSelected ? COLORS.primary : COLORS.background,
    borderRadius: EFFECTS.borderRadius.small,
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: 500,
  };

  const metaStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: isSelected ? COLORS.background : COLORS.textTertiary,
    marginBottom: SPACING.sm,
  };

  const sampleStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    color: isSelected ? COLORS.background : COLORS.textSecondary,
    fontStyle: 'italic',
    marginBottom: SPACING.md,
    padding: SPACING.sm,
    backgroundColor: isSelected ? 'rgba(255,255,255,0.1)' : COLORS.background,
    borderRadius: EFFECTS.borderRadius.small,
    lineHeight: 1.4,
  };

  const buttonStyle: CSSProperties = {
    padding: `${SPACING.sm}px ${SPACING.md}px`,
    backgroundColor: isSelected ? COLORS.background : COLORS.primary,
    color: isSelected ? COLORS.primary : COLORS.background,
    border: 'none',
    borderRadius: EFFECTS.borderRadius.medium,
    cursor: 'pointer',
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: 500,
    marginRight: SPACING.sm,
  };

  return (
    <div style={cardStyle} onClick={onSelect}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <h3 style={titleStyle}>{voice.name}</h3>
          <p style={descriptionStyle}>{voice.description}</p>
          
          <div style={characteristicsStyle}>
            {voice.characteristics.map(char => (
              <span key={char} style={tagStyle}>{char}</span>
            ))}
          </div>
          
          <div style={metaStyle}>
            <strong>Gender:</strong> {voice.gender} • <strong>Accent:</strong> {voice.accent}
          </div>
          
          <div style={metaStyle}>
            <strong>Best for:</strong> {voice.bestFor.join(', ')}
          </div>
          
          <div style={sampleStyle}>
            "{voice.sample}"
          </div>
          
          <div>
            {onPlaySample && (
              <button
                style={buttonStyle}
                onClick={(e) => {
                  e.stopPropagation();
                  onPlaySample();
                }}
                disabled={isPlaying}
              >
                {isPlaying ? '⏸ Playing...' : '▶ Play Sample'}
              </button>
            )}
            
            <button
              style={{
                ...buttonStyle,
                backgroundColor: isSelected ? COLORS.success : 'transparent',
                border: `2px solid ${isSelected ? COLORS.success : (isSelected ? COLORS.background : COLORS.primary)}`,
              }}
              onClick={(e) => {
                e.stopPropagation();
                onSelect();
              }}
            >
              {isSelected ? '✓ Selected' : 'Select Voice'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const VoiceSelector: React.FC<VoiceSelectorProps> = ({
  isOpen,
  onClose,
  onVoiceSelect,
  selectedVoice,
  showSamples = true
}) => {
  const [playingVoice, setPlayingVoice] = useState<keyof typeof OPENAI_VOICES | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const handlePlaySample = useCallback(async (voiceKey: keyof typeof OPENAI_VOICES) => {
    if (!showSamples) return;
    
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }

    if (playingVoice === voiceKey) {
      setPlayingVoice(null);
      return;
    }

    setPlayingVoice(voiceKey);

    try {
      // In a real implementation, this would call OpenAI's TTS API
      // For now, we'll simulate with a placeholder
      console.log(`Playing sample for ${voiceKey}: "${OPENAI_VOICES[voiceKey].sample}"`);
      
      // Simulate audio duration
      setTimeout(() => {
        setPlayingVoice(null);
      }, 3000);
      
    } catch (error) {
      console.error('Error playing voice sample:', error);
      setPlayingVoice(null);
    }
  }, [playingVoice, showSamples]);

  const handleVoiceSelect = useCallback((voiceKey: keyof typeof OPENAI_VOICES) => {
    onVoiceSelect(voiceKey);
  }, [onVoiceSelect]);

  if (!isOpen) return null;

  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: Z_INDEX.modal,
    padding: SPACING.lg,
  };

  const modalStyle: CSSProperties = {
    backgroundColor: COLORS.background,
    borderRadius: EFFECTS.borderRadius.large,
    padding: SPACING.xxl,
    maxWidth: 800,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: `1px solid ${COLORS.border}`,
    boxShadow: EFFECTS.shadows.xlarge,
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xxl,
    borderBottom: `1px solid ${COLORS.border}`,
    paddingBottom: SPACING.lg,
  };

  const titleStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.h2.fontSize,
    fontWeight: TYPOGRAPHY.h2.fontWeight,
    color: COLORS.textPrimary,
    margin: 0,
  };

  const closeButtonStyle: CSSProperties = {
    background: 'none',
    border: 'none',
    color: COLORS.textSecondary,
    fontSize: 32,
    cursor: 'pointer',
    padding: SPACING.xs,
    borderRadius: EFFECTS.borderRadius.medium,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>Select Voice Model</h2>
          <button style={closeButtonStyle} onClick={onClose}>
            ×
          </button>
        </div>

        <p style={{
          fontSize: TYPOGRAPHY.body.fontSize,
          color: COLORS.textSecondary,
          marginBottom: SPACING.xxl,
          lineHeight: 1.5,
        }}>
          Choose the voice that best matches your brand and content style. Each voice has unique 
          characteristics that work better for different types of videos.
        </p>

        <div>
          {Object.entries(OPENAI_VOICES).map(([voiceKey, voice]) => (
            <VoiceCard
              key={voiceKey}
              voiceKey={voiceKey as keyof typeof OPENAI_VOICES}
              voice={voice}
              isSelected={selectedVoice === voiceKey}
              onSelect={() => handleVoiceSelect(voiceKey as keyof typeof OPENAI_VOICES)}
              onPlaySample={showSamples ? () => handlePlaySample(voiceKey as keyof typeof OPENAI_VOICES) : undefined}
              isPlaying={playingVoice === voiceKey}
            />
          ))}
        </div>

        <div style={{
          marginTop: SPACING.xxl,
          padding: SPACING.lg,
          backgroundColor: COLORS.surface,
          borderRadius: EFFECTS.borderRadius.medium,
          border: `1px solid ${COLORS.border}`,
        }}>
          <h4 style={{
            fontSize: TYPOGRAPHY.bodyLarge.fontSize,
            color: COLORS.textPrimary,
            margin: `0 0 ${SPACING.sm}px 0`,
          }}>
            💡 Voice Selection Tips
          </h4>
          <ul style={{
            fontSize: TYPOGRAPHY.bodySmall.fontSize,
            color: COLORS.textSecondary,
            margin: 0,
            paddingLeft: SPACING.md,
            lineHeight: 1.6,
          }}>
            <li>Consider your target audience and brand personality</li>
            <li>Match the voice energy to your content type</li>
            <li>Test different voices with your actual script text</li>
            <li>Ensure consistency across all video segments</li>
            <li>Consider cultural and regional preferences for global content</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;
export { OPENAI_VOICES };