/**
 * Typography Selector Component
 * Allows users to select from curated free fonts and upload custom fonts
 * Includes live preview functionality for video content
 */

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { CSSProperties } from 'react';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  EFFECTS, 
  Z_INDEX 
} from './DesignSystem';
import { 
  VIDEO_FONTS, 
  FONT_PAIRINGS, 
  VIDEO_TYPOGRAPHY_GUIDELINES,
  CustomFontManager,
  FontMetadata 
} from './TypographySystem';

interface TypographySelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onFontSelect: (fontConfig: FontConfiguration) => void;
  currentFont?: FontConfiguration;
  showCustomUpload?: boolean;
}

interface FontConfiguration {
  title: FontMetadata;
  subtitle: FontMetadata;
  body: FontMetadata;
  pairing?: keyof typeof FONT_PAIRINGS;
}

interface FontCardProps {
  font: FontMetadata;
  isSelected: boolean;
  onSelect: () => void;
  sampleText: string;
  size?: 'large' | 'medium' | 'small';
}

interface CustomFontUploadProps {
  onFontUploaded: (font: FontMetadata) => void;
  onClose: () => void;
}

const FontCard: React.FC<FontCardProps> = ({
  font,
  isSelected,
  onSelect,
  sampleText,
  size = 'medium'
}) => {
  const [fontLoaded, setFontLoaded] = useState(font.source === 'system');

  useEffect(() => {
    if (font.source === 'google-fonts' && font.url) {
      // Load Google Font if not already loaded
      const existingLink = document.querySelector(`link[href="${font.url}"]`);
      if (!existingLink) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = font.url;
        link.onload = () => setFontLoaded(true);
        document.head.appendChild(link);
      } else {
        setFontLoaded(true);
      }
    }
  }, [font]);

  const getSampleSize = () => {
    switch (size) {
      case 'large': return 48;
      case 'medium': return 36;
      case 'small': return 24;
      default: return 36;
    }
  };

  const cardStyle: CSSProperties = {
    padding: SPACING.lg,
    backgroundColor: isSelected ? COLORS.primary : COLORS.surface,
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`,
    borderRadius: EFFECTS.borderRadius.large,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: SPACING.md,
    minHeight: 120,
  };

  const titleStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.bodyLarge.fontSize,
    fontWeight: TYPOGRAPHY.bodyLarge.fontWeight,
    color: isSelected ? COLORS.background : COLORS.textPrimary,
    margin: `0 0 ${SPACING.xs}px 0`,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const sampleStyle: CSSProperties = {
    fontFamily: fontLoaded ? font.family : 'inherit',
    fontSize: getSampleSize(),
    color: isSelected ? COLORS.background : COLORS.textPrimary,
    marginBottom: SPACING.sm,
    lineHeight: 1.2,
    minHeight: getSampleSize() * 1.2,
    display: 'flex',
    alignItems: 'center',
  };

  const metaStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: isSelected ? COLORS.background : COLORS.textSecondary,
    marginBottom: SPACING.xs,
  };

  const badgeStyle: CSSProperties = {
    padding: `${SPACING.xs}px ${SPACING.sm}px`,
    backgroundColor: isSelected ? COLORS.background : COLORS.primary,
    color: isSelected ? COLORS.primary : COLORS.background,
    borderRadius: EFFECTS.borderRadius.small,
    fontSize: TYPOGRAPHY.caption.fontSize,
    fontWeight: 500,
  };

  return (
    <div style={cardStyle} onClick={onSelect}>
      <div style={titleStyle}>
        <span>{font.name}</span>
        <span style={badgeStyle}>{font.videoSuitability}</span>
      </div>
      
      <div style={sampleStyle}>
        {fontLoaded ? sampleText : 'Loading...'}
      </div>
      
      <div style={metaStyle}>
        <strong>Category:</strong> {font.category} • <strong>Weights:</strong> {font.weights.length} available
      </div>
      
      <div style={metaStyle}>
        <strong>Best for:</strong> {font.bestFor.slice(0, 2).join(', ')}
      </div>
    </div>
  );
};

const CustomFontUpload: React.FC<CustomFontUploadProps> = ({ onFontUploaded, onClose }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    setError(null);

    try {
      const fontName = file.name.split('.')[0];
      const customFont = await CustomFontManager.loadCustomFont(file, fontName);
      onFontUploaded(customFont);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to upload font');
    } finally {
      setUploading(false);
    }
  }, [onFontUploaded, onClose]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  }, [handleFile]);

  const uploadAreaStyle: CSSProperties = {
    border: `2px dashed ${dragActive ? COLORS.primary : COLORS.border}`,
    borderRadius: EFFECTS.borderRadius.large,
    padding: SPACING.xxl,
    textAlign: 'center',
    backgroundColor: dragActive ? `${COLORS.primary}10` : COLORS.surface,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  };

  return (
    <div>
      <h3 style={{
        fontSize: TYPOGRAPHY.h3.fontSize,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
        margin: `0 0 ${SPACING.lg}px 0`,
      }}>
        Upload Custom Font
      </h3>
      
      <div
        style={uploadAreaStyle}
        onDragEnter={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setDragActive(false);
        }}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".woff,.woff2,.ttf,.otf"
          onChange={handleChange}
          style={{ display: 'none' }}
        />
        
        <div style={{ fontSize: 48, marginBottom: SPACING.md, opacity: 0.6 }}>
          📁
        </div>
        
        <h4 style={{
          fontSize: TYPOGRAPHY.bodyLarge.fontSize,
          color: COLORS.textPrimary,
          marginBottom: SPACING.sm,
        }}>
          {uploading ? 'Uploading Font...' : 'Drop font file here or click to browse'}
        </h4>
        
        <p style={{
          fontSize: TYPOGRAPHY.bodySmall.fontSize,
          color: COLORS.textSecondary,
          marginBottom: SPACING.md,
        }}>
          Supported formats: WOFF, WOFF2, TTF, OTF (Max 2MB)
        </p>
        
        {error && (
          <p style={{
            color: COLORS.error,
            fontSize: TYPOGRAPHY.bodySmall.fontSize,
            backgroundColor: `${COLORS.error}20`,
            padding: SPACING.sm,
            borderRadius: EFFECTS.borderRadius.medium,
          }}>
            {error}
          </p>
        )}
      </div>
      
      <div style={{
        marginTop: SPACING.lg,
        padding: SPACING.md,
        backgroundColor: COLORS.background,
        borderRadius: EFFECTS.borderRadius.medium,
        border: `1px solid ${COLORS.border}`,
      }}>
        <h4 style={{
          fontSize: TYPOGRAPHY.bodyLarge.fontSize,
          color: COLORS.textPrimary,
          marginBottom: SPACING.sm,
        }}>
          💡 Custom Font Tips
        </h4>
        <ul style={{
          fontSize: TYPOGRAPHY.bodySmall.fontSize,
          color: COLORS.textSecondary,
          margin: 0,
          paddingLeft: SPACING.md,
          lineHeight: 1.5,
        }}>
          <li>Ensure you have proper licensing for commercial use</li>
          <li>Test readability at different sizes before using in videos</li>
          <li>WOFF2 format offers the best compression and performance</li>
          <li>Consider fallback fonts for systems that don't support your custom font</li>
        </ul>
      </div>
    </div>
  );
};

const TypographySelector: React.FC<TypographySelectorProps> = ({
  isOpen,
  onClose,
  onFontSelect,
  currentFont,
  showCustomUpload = true
}) => {
  const [activeTab, setActiveTab] = useState<'pairings' | 'individual' | 'custom'>('pairings');
  const [selectedPairing, setSelectedPairing] = useState<keyof typeof FONT_PAIRINGS>('corporate');
  const [customFonts, setCustomFonts] = useState<FontMetadata[]>([]);
  const [selectedFonts, setSelectedFonts] = useState({
    title: VIDEO_FONTS.inter,
    subtitle: VIDEO_FONTS.roboto,
    body: VIDEO_FONTS.openSans
  });

  const handlePairingSelect = useCallback((pairingKey: keyof typeof FONT_PAIRINGS) => {
    const pairing = FONT_PAIRINGS[pairingKey];
    const configuration: FontConfiguration = {
      title: VIDEO_FONTS[pairing.title],
      subtitle: VIDEO_FONTS[pairing.subtitle],
      body: VIDEO_FONTS[pairing.body],
      pairing: pairingKey
    };
    
    setSelectedPairing(pairingKey);
    onFontSelect(configuration);
  }, [onFontSelect]);

  const handleCustomFontUpload = useCallback((font: FontMetadata) => {
    setCustomFonts(prev => [...prev, font]);
  }, []);

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
    maxWidth: 1200,
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

  const tabStyle = (isActive: boolean): CSSProperties => ({
    padding: `${SPACING.md}px ${SPACING.lg}px`,
    backgroundColor: isActive ? COLORS.primary : 'transparent',
    color: isActive ? COLORS.background : COLORS.textPrimary,
    border: `2px solid ${isActive ? COLORS.primary : COLORS.border}`,
    borderRadius: EFFECTS.borderRadius.medium,
    cursor: 'pointer',
    fontSize: TYPOGRAPHY.body.fontSize,
    fontWeight: 500,
    marginRight: SPACING.sm,
  });

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={{
            fontSize: TYPOGRAPHY.h2.fontSize,
            color: COLORS.textPrimary,
            margin: 0,
          }}>
            Typography Selection
          </h2>
          <button 
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.textSecondary,
              fontSize: 32,
              cursor: 'pointer',
            }}
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {/* Tabs */}
        <div style={{ marginBottom: SPACING.xxl }}>
          <button
            style={tabStyle(activeTab === 'pairings')}
            onClick={() => setActiveTab('pairings')}
          >
            🎨 Font Pairings
          </button>
          <button
            style={tabStyle(activeTab === 'individual')}
            onClick={() => setActiveTab('individual')}
          >
            🔤 Individual Fonts
          </button>
          {showCustomUpload && (
            <button
              style={tabStyle(activeTab === 'custom')}
              onClick={() => setActiveTab('custom')}
            >
              📁 Custom Upload
            </button>
          )}
        </div>

        {/* Tab Content */}
        {activeTab === 'pairings' && (
          <div>
            <p style={{
              fontSize: TYPOGRAPHY.body.fontSize,
              color: COLORS.textSecondary,
              marginBottom: SPACING.xxl,
              lineHeight: 1.5,
            }}>
              Choose from professionally curated font pairings optimized for video content.
              Each pairing includes fonts for titles, subtitles, and body text.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: SPACING.lg,
            }}>
              {Object.entries(FONT_PAIRINGS).map(([key, pairing]) => (
                <div
                  key={key}
                  style={{
                    padding: SPACING.lg,
                    backgroundColor: selectedPairing === key ? COLORS.primary : COLORS.surface,
                    border: `2px solid ${selectedPairing === key ? COLORS.primary : COLORS.border}`,
                    borderRadius: EFFECTS.borderRadius.large,
                    cursor: 'pointer',
                  }}
                  onClick={() => handlePairingSelect(key as keyof typeof FONT_PAIRINGS)}
                >
                  <h3 style={{
                    fontSize: TYPOGRAPHY.h3.fontSize,
                    color: selectedPairing === key ? COLORS.background : COLORS.textPrimary,
                    textTransform: 'capitalize',
                    marginBottom: SPACING.md,
                    margin: `0 0 ${SPACING.md}px 0`,
                  }}>
                    {key} Style
                  </h3>
                  
                  <div style={{ marginBottom: SPACING.md }}>
                    <div style={{
                      fontFamily: VIDEO_FONTS[pairing.title].family,
                      fontSize: 32,
                      fontWeight: 700,
                      color: selectedPairing === key ? COLORS.background : COLORS.textPrimary,
                      marginBottom: SPACING.xs,
                    }}>
                      Sample Title
                    </div>
                    <div style={{
                      fontFamily: VIDEO_FONTS[pairing.subtitle].family,
                      fontSize: 20,
                      color: selectedPairing === key ? COLORS.background : COLORS.textSecondary,
                      marginBottom: SPACING.xs,
                    }}>
                      Sample subtitle text
                    </div>
                    <div style={{
                      fontFamily: VIDEO_FONTS[pairing.body].family,
                      fontSize: 16,
                      color: selectedPairing === key ? COLORS.background : COLORS.textSecondary,
                    }}>
                      Sample body text for readability
                    </div>
                  </div>
                  
                  <p style={{
                    fontSize: TYPOGRAPHY.bodySmall.fontSize,
                    color: selectedPairing === key ? COLORS.background : COLORS.textTertiary,
                    margin: 0,
                  }}>
                    {pairing.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'individual' && (
          <div>
            <p style={{
              fontSize: TYPOGRAPHY.body.fontSize,
              color: COLORS.textSecondary,
              marginBottom: SPACING.xxl,
              lineHeight: 1.5,
            }}>
              Browse our curated collection of the best free fonts for video content.
              Each font is optimized for readability and motion graphics.
            </p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: SPACING.md,
            }}>
              {Object.values(VIDEO_FONTS).map((font) => (
                <FontCard
                  key={font.name}
                  font={font}
                  isSelected={false}
                  onSelect={() => {
                    // Handle individual font selection
                    console.log('Selected font:', font.name);
                  }}
                  sampleText="The quick brown fox jumps over"
                />
              ))}
            </div>
          </div>
        )}

        {activeTab === 'custom' && showCustomUpload && (
          <CustomFontUpload
            onFontUploaded={handleCustomFontUpload}
            onClose={() => setActiveTab('pairings')}
          />
        )}

        {/* Typography Guidelines */}
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
            marginBottom: SPACING.sm,
          }}>
            📐 Video Typography Guidelines
          </h4>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: SPACING.md,
            marginBottom: SPACING.md,
          }}>
            {Object.entries(VIDEO_TYPOGRAPHY_GUIDELINES.sizeGuidelines).map(([type, guideline]) => (
              <div key={type} style={{
                padding: SPACING.sm,
                backgroundColor: COLORS.background,
                borderRadius: EFFECTS.borderRadius.small,
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: TYPOGRAPHY.bodyLarge.fontSize,
                  fontWeight: 600,
                  color: COLORS.primary,
                  marginBottom: SPACING.xs,
                  textTransform: 'capitalize',
                }}>
                  {type}
                </div>
                <div style={{
                  fontSize: TYPOGRAPHY.bodySmall.fontSize,
                  color: COLORS.textSecondary,
                }}>
                  {guideline.recommended}px recommended
                </div>
              </div>
            ))}
          </div>
          
          <ul style={{
            fontSize: TYPOGRAPHY.bodySmall.fontSize,
            color: COLORS.textSecondary,
            margin: 0,
            paddingLeft: SPACING.md,
            lineHeight: 1.6,
          }}>
            <li>Prioritize readability - text must be clear while in motion</li>
            <li>Limit to 2-3 font families maximum per video</li>
            <li>Use consistent sizing hierarchy throughout your video</li>
            <li>Test fonts at your target resolution before finalizing</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default TypographySelector;
export type { FontConfiguration };