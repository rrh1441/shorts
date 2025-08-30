/**
 * Enhanced Segment Component with Dynamic Typography
 * Demonstrates the complete design system with typography selection capabilities
 */

import React, { useEffect, useState } from 'react';
import { interpolate, useCurrentFrame, useVideoConfig, Audio, staticFile } from 'remotion';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  EFFECTS, 
  FONTS,
  fontUtils,
  DynamicFonts
} from '../design/DesignSystem';
import { 
  CenteredLayout, 
  SegmentTitle, 
  SegmentSubtitle, 
  ContentContainer,
  IconContainer,
  BulletList,
  Background,
  createSharedStyles
} from '../design/LayoutComponents';
import { 
  VIDEO_FONTS, 
  FONT_PAIRINGS, 
  FontConfiguration 
} from '../design/TypographySystem';

interface EnhancedSegmentProps {
  brandColors?: {
    primary: string;
    secondary: string;
    accent: string;
  };
  fontConfiguration?: FontConfiguration;
  content?: {
    title: string;
    subtitle: string;
    bulletPoints: string[];
    callToAction: {
      title: string;
      description: string;
    };
  };
}

const EnhancedSegmentExample: React.FC<EnhancedSegmentProps> = ({ 
  brandColors = {
    primary: COLORS.primary,
    secondary: COLORS.secondary,
    accent: COLORS.tertiary
  },
  fontConfiguration,
  content = {
    title: "Professional Video Content",
    subtitle: "With consistent typography and design",
    bulletPoints: [
      "Curated selection of video-optimized fonts",
      "Custom font upload capability with validation",
      "Professional font pairings for different content types",
      "Consistent design system across all segments"
    ],
    callToAction: {
      title: "Typography Matters",
      description: "Choose the right fonts to enhance your message and maintain brand consistency"
    }
  }
}) => {
  const frame = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [fontsLoaded, setFontsLoaded] = useState(false);
  
  // Load selected fonts
  useEffect(() => {
    const loadFonts = async () => {
      if (fontConfiguration) {
        const fontsToLoad = [
          fontConfiguration.title,
          fontConfiguration.subtitle,
          fontConfiguration.body
        ].filter(font => font.source === 'google-fonts' && font.url);

        try {
          await Promise.all(
            fontsToLoad.map(font => fontUtils.loadGoogleFont(font.url!))
          );
          setFontsLoaded(true);
        } catch (error) {
          console.warn('Some fonts failed to load:', error);
          setFontsLoaded(true); // Proceed with fallback fonts
        }
      } else {
        setFontsLoaded(true);
      }
    };

    loadFonts();
  }, [fontConfiguration]);

  // Create dynamic font configuration
  const dynamicFonts: DynamicFonts | undefined = fontConfiguration ? {
    title: fontConfiguration.title.family,
    subtitle: fontConfiguration.subtitle.family,
    body: fontConfiguration.body.family,
    pairing: fontConfiguration.pairing
  } : undefined;

  // Create styles with dynamic fonts
  const styles = createSharedStyles(dynamicFonts);

  // Coordinated animation timing following lessons learned
  const titleOpacity = interpolate(frame, [0, 60], [0, 1], { 
    extrapolateLeft: 'clamp', 
    extrapolateRight: 'clamp' 
  });
  
  const contentOpacity = interpolate(frame, [60, 120], [0, 1], { 
    extrapolateLeft: 'clamp', 
    extrapolateRight: 'clamp' 
  });
  
  const actionOpacity = interpolate(frame, [120, 180], [0, 1], { 
    extrapolateLeft: 'clamp', 
    extrapolateRight: 'clamp' 
  });

  // Smooth title animation from lessons
  const titleY = interpolate(frame, [0, 60], [30, 0], { 
    extrapolateLeft: 'clamp', 
    extrapolateRight: 'clamp' 
  });

  if (!fontsLoaded) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.background,
        color: COLORS.textPrimary,
        fontFamily: FONTS.primary,
        fontSize: TYPOGRAPHY.h2.fontSize,
      }}>
        Loading Typography...
      </div>
    );
  }

  return (
    <>
      {/* Audio track for segment */}
      <Audio src={staticFile('audio/segment-typography-example.mp3')} />
      
      {/* Background with consistent styling */}
      <Background color={COLORS.background} gradient={false} />
      
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: dynamicFonts?.body || FONTS.body,
        position: 'relative',
        overflow: 'hidden'
      }}>
        
        {/* Subtle background pattern following best practices */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: `radial-gradient(circle at 30% 70%, ${brandColors.primary}15 0%, transparent 50%),
                      radial-gradient(circle at 70% 30%, ${brandColors.secondary}10 0%, transparent 50%)`,
          zIndex: 0
        }} />

        <ContentContainer style={{ zIndex: 1 }}>
          
          {/* Title with dynamic typography */}
          <div style={{
            opacity: titleOpacity,
            transform: `translateY(${titleY}px)`,
            textAlign: 'center',
            marginBottom: SPACING.xxxl // Standard 80px margin from lessons
          }}>
            <SegmentTitle 
              color={brandColors.primary}
              fontFamily={dynamicFonts?.title}
              style={{
                fontSize: TYPOGRAPHY.h1.fontSize, // 120px from design system
                fontWeight: TYPOGRAPHY.h1.fontWeight, // 800 from design system
                letterSpacing: TYPOGRAPHY.h1.letterSpacing,
                lineHeight: TYPOGRAPHY.h1.lineHeight,
                marginBottom: SPACING.xxxl
              }}
            >
              {content.title}
            </SegmentTitle>
            
            <SegmentSubtitle 
              color={COLORS.textSecondary}
              fontFamily={dynamicFonts?.subtitle}
              style={{
                fontSize: TYPOGRAPHY.h2.fontSize, // 60px from design system
                fontWeight: TYPOGRAPHY.h2.fontWeight,
                letterSpacing: TYPOGRAPHY.h2.letterSpacing
              }}
            >
              {content.subtitle}
            </SegmentSubtitle>
          </div>

          {/* Content section with coordinated timing */}
          <div style={{
            opacity: contentOpacity,
            display: 'flex',
            alignItems: 'center',
            gap: SPACING.xxl,
            marginBottom: SPACING.xxl
          }}>
            
            {/* Typography icon */}
            <IconContainer size="large" style={{
              backgroundColor: brandColors.primary,
              borderRadius: '50%',
              boxShadow: EFFECTS.shadows.large,
              opacity: contentOpacity
            }}>
              <svg width="60" height="60" viewBox="0 0 24 24" fill="none">
                <path 
                  d="M8.5 2h7L20 12l-4.5 10h-7L4 12L8.5 2z" 
                  fill={COLORS.background}
                />
                <text
                  x="12"
                  y="14"
                  textAnchor="middle"
                  fontSize="8"
                  fill={brandColors.primary}
                  fontWeight="bold"
                >
                  Aa
                </text>
              </svg>
            </IconContainer>
            
            {/* Bullet list with dynamic typography */}
            <div style={{
              maxWidth: 800,
              opacity: contentOpacity
            }}>
              <BulletList 
                items={content.bulletPoints}
                style={{
                  fontFamily: dynamicFonts?.body,
                  fontSize: TYPOGRAPHY.body.fontSize, // 36px from design system
                  lineHeight: TYPOGRAPHY.body.lineHeight
                }}
                itemStyle={{
                  color: COLORS.textPrimary,
                  marginBottom: SPACING.md
                }}
              />
            </div>
          </div>

          {/* Call to action with proper timing */}
          <div style={{
            opacity: actionOpacity,
            textAlign: 'center'
          }}>
            <div style={{
              ...styles.card,
              backgroundColor: brandColors.accent,
              color: COLORS.background,
              padding: SPACING.lg,
              borderRadius: EFFECTS.borderRadius.large,
              maxWidth: 600,
              margin: '0 auto'
            }}>
              <h3 style={{
                fontFamily: dynamicFonts?.title,
                fontSize: TYPOGRAPHY.h3.fontSize,
                fontWeight: TYPOGRAPHY.h3.fontWeight,
                margin: `0 0 ${SPACING.md}px 0`
              }}>
                {content.callToAction.title}
              </h3>
              <p style={{
                fontFamily: dynamicFonts?.body,
                fontSize: TYPOGRAPHY.body.fontSize,
                lineHeight: TYPOGRAPHY.body.lineHeight,
                margin: 0
              }}>
                {content.callToAction.description}
              </p>
            </div>
          </div>

          {/* Typography information display */}
          {fontConfiguration && (
            <div style={{
              opacity: actionOpacity,
              marginTop: SPACING.xl,
              padding: SPACING.md,
              backgroundColor: COLORS.surface,
              borderRadius: EFFECTS.borderRadius.medium,
              border: `1px solid ${COLORS.border}`,
              maxWidth: 800,
              width: '100%'
            }}>
              <h4 style={{
                fontSize: TYPOGRAPHY.bodyLarge.fontSize,
                color: COLORS.textPrimary,
                marginBottom: SPACING.sm,
                textAlign: 'center'
              }}>
                Typography Configuration
              </h4>
              
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: SPACING.sm,
                fontSize: TYPOGRAPHY.bodySmall.fontSize,
                color: COLORS.textSecondary,
              }}>
                <div>
                  <strong>Title:</strong> {fontConfiguration.title.name}
                </div>
                <div>
                  <strong>Subtitle:</strong> {fontConfiguration.subtitle.name}
                </div>
                <div>
                  <strong>Body:</strong> {fontConfiguration.body.name}
                </div>
                {fontConfiguration.pairing && (
                  <div>
                    <strong>Pairing:</strong> {fontConfiguration.pairing}
                  </div>
                )}
              </div>
            </div>
          )}
          
        </ContentContainer>

        {/* Consistent animation styles */}
        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
          }
          
          @keyframes slideIn {
            from { transform: translateY(30px); opacity: 0; }
            to { transform: translateY(0); opacity: 1; }
          }
        `}</style>
      </div>
    </>
  );
};

// Example usage with different font configurations
export const CorporateExample: React.FC = () => {
  const corporateFonts: FontConfiguration = {
    title: VIDEO_FONTS.inter,
    subtitle: VIDEO_FONTS.roboto,
    body: VIDEO_FONTS.openSans,
    pairing: 'corporate'
  };

  return (
    <EnhancedSegmentExample
      fontConfiguration={corporateFonts}
      content={{
        title: "Corporate Excellence",
        subtitle: "Professional communication that builds trust",
        bulletPoints: [
          "Clean, readable typography for business content",
          "Professional font pairings that convey authority",
          "Consistent branding across all communications",
          "Optimized for readability in motion graphics"
        ],
        callToAction: {
          title: "Professional Typography",
          description: "The Inter + Roboto + Open Sans combination provides maximum readability and professional appeal"
        }
      }}
    />
  );
};

export const CreativeExample: React.FC = () => {
  const creativeFonts: FontConfiguration = {
    title: VIDEO_FONTS.bebasNeue,
    subtitle: VIDEO_FONTS.raleway,
    body: VIDEO_FONTS.openSans,
    pairing: 'creative'
  };

  return (
    <EnhancedSegmentExample
      fontConfiguration={creativeFonts}
      brandColors={{
        primary: '#FF6B35',
        secondary: '#F8AC8C',
        accent: '#FF8A65'
      }}
      content={{
        title: "CREATIVE IMPACT",
        subtitle: "Bold typography that demands attention",
        bulletPoints: [
          "High-impact display fonts for creative industries",
          "Bold typography that stands out in crowded feeds",
          "Perfect for agencies and creative professionals",
          "Dramatic contrast between title and body fonts"
        ],
        callToAction: {
          title: "Bold & Beautiful",
          description: "Bebas Neue headlines with elegant Raleway subtitles create perfect creative tension"
        }
      }}
    />
  );
};

export default EnhancedSegmentExample;