/**
 * Asset Uploader Component
 * User interface for uploading and configuring custom video/image assets
 * For creating intro/outro segments with TTS integration
 */

import React, { useState, useCallback, useRef } from 'react';
import { CSSProperties } from 'react';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  EFFECTS, 
  Z_INDEX 
} from './DesignSystem';
import {
  AssetManager,
  AssetMetadata,
  CustomSegmentConfig,
  TTSConfiguration,
  SUPPORTED_FORMATS,
  PRESET_CONFIGS
} from './AssetManager';
import { OPENAI_VOICES } from './VoiceSelector';

interface AssetUploaderProps {
  isOpen: boolean;
  onClose: () => void;
  onSegmentCreated: (segment: CustomSegmentConfig) => void;
  onAssetUploaded?: (asset: AssetMetadata) => void;
}

interface AssetPreviewProps {
  asset: AssetMetadata;
  onRemove: () => void;
}

interface SegmentConfigurationProps {
  asset: AssetMetadata;
  onConfigurationComplete: (config: CustomSegmentConfig) => void;
  onCancel: () => void;
}

const AssetPreview: React.FC<AssetPreviewProps> = ({ asset, onRemove }) => {
  const previewStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: SPACING.md,
    backgroundColor: asset.status === 'ready' ? COLORS.surface : COLORS.background,
    border: `1px solid ${asset.status === 'error' ? COLORS.error : COLORS.border}`,
    borderRadius: EFFECTS.borderRadius.medium,
    marginBottom: SPACING.md,
  };

  const thumbnailStyle: CSSProperties = {
    width: 80,
    height: 60,
    borderRadius: EFFECTS.borderRadius.small,
    objectFit: 'cover',
    backgroundColor: COLORS.background,
    marginRight: SPACING.md,
  };

  const getStatusIcon = () => {
    switch (asset.status) {
      case 'ready': return '✅';
      case 'processing': return '⏳';
      case 'error': return '❌';
      default: return '📁';
    }
  };

  const getStatusColor = () => {
    switch (asset.status) {
      case 'ready': return COLORS.success;
      case 'processing': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  return (
    <div style={previewStyle}>
      {asset.thumbnail && (
        <img 
          src={asset.thumbnail} 
          alt={asset.name}
          style={thumbnailStyle}
        />
      )}
      
      <div style={{ flex: 1 }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          marginBottom: SPACING.xs,
        }}>
          <span style={{ marginRight: SPACING.xs }}>{getStatusIcon()}</span>
          <h4 style={{
            fontSize: TYPOGRAPHY.bodyLarge.fontSize,
            color: COLORS.textPrimary,
            margin: 0,
          }}>
            {asset.name}
          </h4>
        </div>
        
        <div style={{
          fontSize: TYPOGRAPHY.bodySmall.fontSize,
          color: COLORS.textSecondary,
          marginBottom: SPACING.xs,
        }}>
          {asset.type} • {asset.format} • {Math.round(asset.size / 1024)}KB
          {asset.duration && ` • ${asset.duration.toFixed(1)}s`}
        </div>
        
        <div style={{
          fontSize: TYPOGRAPHY.caption.fontSize,
          color: getStatusColor(),
        }}>
          {asset.dimensions.width}×{asset.dimensions.height} • {asset.status}
          {asset.errorMessage && ` - ${asset.errorMessage}`}
        </div>
      </div>
      
      <button
        onClick={onRemove}
        style={{
          background: 'none',
          border: 'none',
          color: COLORS.textSecondary,
          fontSize: 20,
          cursor: 'pointer',
          padding: SPACING.xs,
        }}
      >
        ×
      </button>
    </div>
  );
};

const SegmentConfiguration: React.FC<SegmentConfigurationProps> = ({
  asset,
  onConfigurationComplete,
  onCancel
}) => {
  const [segmentType, setSegmentType] = useState<'intro' | 'outro' | 'custom'>('intro');
  const [segmentName, setSegmentName] = useState('');
  const [duration, setDuration] = useState(asset.duration || 5);
  const [enableTTS, setEnableTTS] = useState(false);
  const [ttsScript, setTtsScript] = useState('');
  const [ttsVoice, setTtsVoice] = useState('alloy');
  const [enableOverlay, setEnableOverlay] = useState(true);
  const [overlayText, setOverlayText] = useState('');
  const [overlayPosition, setOverlayPosition] = useState<'top' | 'center' | 'bottom'>('center');

  const handlePresetSelect = useCallback((presetKey: keyof typeof PRESET_CONFIGS) => {
    const preset = PRESET_CONFIGS[presetKey];
    setSegmentType(preset.type);
    setSegmentName(preset.name);
    setDuration(preset.duration);
    setEnableOverlay(preset.overlay.enabled);
    setOverlayPosition(preset.overlay.position || 'center');
    
    // Set default text based on preset
    if (presetKey === 'intro') {
      setOverlayText('Your Brand Name\nTagline here');
      setTtsScript('Welcome! This is your brand introduction.');
    } else if (presetKey === 'outro') {
      setOverlayText('Thank you for watching\nVisit our website');
      setTtsScript('Thanks for watching! Don\'t forget to subscribe and visit our website.');
    }
  }, []);

  const handleCreateSegment = useCallback(() => {
    let ttsConfig: TTSConfiguration | undefined;
    
    if (enableTTS && ttsScript) {
      ttsConfig = {
        script: ttsScript,
        voice: ttsVoice,
        timing: { startTime: 0.5 },
        volume: 0.8,
        fadeIn: 0.2,
        fadeOut: 0.3,
      };
    }

    const config = AssetManager.createSegmentConfig(asset, {
      name: segmentName || `${segmentType} segment`,
      type: segmentType,
      duration,
      tts: ttsConfig,
      overlay: enableOverlay ? {
        enabled: true,
        text: overlayText,
        position: overlayPosition,
      } : { enabled: false }
    });

    onConfigurationComplete(config);
  }, [
    asset, segmentName, segmentType, duration, enableTTS, ttsScript, ttsVoice,
    enableOverlay, overlayText, overlayPosition, onConfigurationComplete
  ]);

  const inputStyle: CSSProperties = {
    width: '100%',
    padding: `${SPACING.sm}px ${SPACING.md}px`,
    fontSize: TYPOGRAPHY.body.fontSize,
    backgroundColor: COLORS.surface,
    border: `1px solid ${COLORS.border}`,
    borderRadius: EFFECTS.borderRadius.medium,
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  };

  const textareaStyle: CSSProperties = {
    ...inputStyle,
    minHeight: 80,
    resize: 'vertical',
    fontFamily: 'inherit',
  };

  return (
    <div>
      <h3 style={{
        fontSize: TYPOGRAPHY.h3.fontSize,
        color: COLORS.textPrimary,
        marginBottom: SPACING.lg,
        margin: `0 0 ${SPACING.lg}px 0`,
      }}>
        Configure Segment
      </h3>

      {/* Presets */}
      <div style={{ marginBottom: SPACING.lg }}>
        <label style={{
          fontSize: TYPOGRAPHY.bodySmall.fontSize,
          color: COLORS.textSecondary,
          marginBottom: SPACING.xs,
          display: 'block',
        }}>
          Quick Presets
        </label>
        <div style={{ display: 'flex', gap: SPACING.sm }}>
          {Object.entries(PRESET_CONFIGS).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetSelect(key as keyof typeof PRESET_CONFIGS)}
              style={{
                padding: `${SPACING.sm}px ${SPACING.md}px`,
                backgroundColor: COLORS.surface,
                border: `1px solid ${COLORS.border}`,
                borderRadius: EFFECTS.borderRadius.medium,
                color: COLORS.textPrimary,
                cursor: 'pointer',
                fontSize: TYPOGRAPHY.bodySmall.fontSize,
                textTransform: 'capitalize',
              }}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Configuration */}
      <div style={{ marginBottom: SPACING.lg }}>
        <label style={{
          fontSize: TYPOGRAPHY.bodySmall.fontSize,
          color: COLORS.textSecondary,
          marginBottom: SPACING.xs,
          display: 'block',
        }}>
          Segment Name
        </label>
        <input
          type="text"
          value={segmentName}
          onChange={(e) => setSegmentName(e.target.value)}
          placeholder="Enter segment name"
          style={inputStyle}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.md, marginBottom: SPACING.lg }}>
        <div>
          <label style={{
            fontSize: TYPOGRAPHY.bodySmall.fontSize,
            color: COLORS.textSecondary,
            marginBottom: SPACING.xs,
            display: 'block',
          }}>
            Type
          </label>
          <select
            value={segmentType}
            onChange={(e) => setSegmentType(e.target.value as 'intro' | 'outro' | 'custom')}
            style={inputStyle}
          >
            <option value="intro">Intro</option>
            <option value="outro">Outro</option>
            <option value="custom">Custom</option>
          </select>
        </div>

        <div>
          <label style={{
            fontSize: TYPOGRAPHY.bodySmall.fontSize,
            color: COLORS.textSecondary,
            marginBottom: SPACING.xs,
            display: 'block',
          }}>
            Duration (seconds)
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
            min={1}
            max={60}
            style={inputStyle}
          />
        </div>
      </div>

      {/* Overlay Configuration */}
      <div style={{ marginBottom: SPACING.lg }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: TYPOGRAPHY.body.fontSize,
          color: COLORS.textPrimary,
          marginBottom: SPACING.md,
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={enableOverlay}
            onChange={(e) => setEnableOverlay(e.target.checked)}
            style={{ marginRight: SPACING.sm }}
          />
          Enable Text Overlay
        </label>

        {enableOverlay && (
          <>
            <textarea
              value={overlayText}
              onChange={(e) => setOverlayText(e.target.value)}
              placeholder="Enter overlay text (use line breaks for multiple lines)"
              style={textareaStyle}
            />

            <div>
              <label style={{
                fontSize: TYPOGRAPHY.bodySmall.fontSize,
                color: COLORS.textSecondary,
                marginBottom: SPACING.xs,
                display: 'block',
              }}>
                Overlay Position
              </label>
              <select
                value={overlayPosition}
                onChange={(e) => setOverlayPosition(e.target.value as 'top' | 'center' | 'bottom')}
                style={inputStyle}
              >
                <option value="top">Top</option>
                <option value="center">Center</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>
          </>
        )}
      </div>

      {/* TTS Configuration */}
      <div style={{ marginBottom: SPACING.xxl }}>
        <label style={{
          display: 'flex',
          alignItems: 'center',
          fontSize: TYPOGRAPHY.body.fontSize,
          color: COLORS.textPrimary,
          marginBottom: SPACING.md,
          cursor: 'pointer',
        }}>
          <input
            type="checkbox"
            checked={enableTTS}
            onChange={(e) => setEnableTTS(e.target.checked)}
            style={{ marginRight: SPACING.sm }}
          />
          Add Text-to-Speech Narration
        </label>

        {enableTTS && (
          <>
            <textarea
              value={ttsScript}
              onChange={(e) => setTtsScript(e.target.value)}
              placeholder="Enter script for narration"
              style={textareaStyle}
            />

            <div>
              <label style={{
                fontSize: TYPOGRAPHY.bodySmall.fontSize,
                color: COLORS.textSecondary,
                marginBottom: SPACING.xs,
                display: 'block',
              }}>
                Voice
              </label>
              <select
                value={ttsVoice}
                onChange={(e) => setTtsVoice(e.target.value)}
                style={inputStyle}
              >
                {Object.entries(OPENAI_VOICES).map(([key, voice]) => (
                  <option key={key} value={key}>
                    {voice.name} - {voice.description}
                  </option>
                ))}
              </select>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div style={{ display: 'flex', gap: SPACING.md, justifyContent: 'flex-end' }}>
        <button
          onClick={onCancel}
          style={{
            padding: `${SPACING.md}px ${SPACING.lg}px`,
            backgroundColor: 'transparent',
            border: `1px solid ${COLORS.border}`,
            borderRadius: EFFECTS.borderRadius.medium,
            color: COLORS.textSecondary,
            cursor: 'pointer',
            fontSize: TYPOGRAPHY.body.fontSize,
          }}
        >
          Cancel
        </button>
        
        <button
          onClick={handleCreateSegment}
          style={{
            padding: `${SPACING.md}px ${SPACING.lg}px`,
            backgroundColor: COLORS.primary,
            border: 'none',
            borderRadius: EFFECTS.borderRadius.medium,
            color: COLORS.background,
            cursor: 'pointer',
            fontSize: TYPOGRAPHY.body.fontSize,
            fontWeight: 500,
          }}
        >
          Create Segment
        </button>
      </div>
    </div>
  );
};

const AssetUploader: React.FC<AssetUploaderProps> = ({
  isOpen,
  onClose,
  onSegmentCreated,
  onAssetUploaded
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [assets, setAssets] = useState<AssetMetadata[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<AssetMetadata | null>(null);
  const [configuring, setConfiguring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    try {
      const asset = await AssetManager.processAsset(file);
      setAssets(prev => [...prev, asset]);
      onAssetUploaded?.(asset);
    } catch (error) {
      console.error('Asset upload failed:', error);
      // In production, show error message to user
    } finally {
      setUploading(false);
    }
  }, [onAssetUploaded]);

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

  const handleAssetSelect = useCallback((asset: AssetMetadata) => {
    if (asset.status === 'ready') {
      setSelectedAsset(asset);
      setConfiguring(true);
    }
  }, []);

  const handleAssetRemove = useCallback((assetToRemove: AssetMetadata) => {
    AssetManager.cleanupAsset(assetToRemove);
    setAssets(prev => prev.filter(asset => asset.id !== assetToRemove.id));
  }, []);

  const handleConfigurationComplete = useCallback((config: CustomSegmentConfig) => {
    onSegmentCreated(config);
    setConfiguring(false);
    setSelectedAsset(null);
    onClose();
  }, [onSegmentCreated, onClose]);

  const handleConfigurationCancel = useCallback(() => {
    setConfiguring(false);
    setSelectedAsset(null);
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
    maxWidth: 800,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: `1px solid ${COLORS.border}`,
    boxShadow: EFFECTS.shadows.xlarge,
  };

  const uploadAreaStyle: CSSProperties = {
    border: `2px dashed ${dragActive ? COLORS.primary : COLORS.border}`,
    borderRadius: EFFECTS.borderRadius.large,
    padding: SPACING.xxl,
    textAlign: 'center',
    backgroundColor: dragActive ? `${COLORS.primary}10` : COLORS.surface,
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    marginBottom: SPACING.lg,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: SPACING.xxl,
          borderBottom: `1px solid ${COLORS.border}`,
          paddingBottom: SPACING.lg,
        }}>
          <h2 style={{
            fontSize: TYPOGRAPHY.h2.fontSize,
            color: COLORS.textPrimary,
            margin: 0,
          }}>
            {configuring ? 'Configure Segment' : 'Upload Custom Asset'}
          </h2>
          <button 
            style={{
              background: 'none',
              border: 'none',
              color: COLORS.textSecondary,
              fontSize: 32,
              cursor: 'pointer',
            }}
            onClick={configuring ? handleConfigurationCancel : onClose}
          >
            {configuring ? '←' : '×'}
          </button>
        </div>

        {configuring && selectedAsset ? (
          <SegmentConfiguration
            asset={selectedAsset}
            onConfigurationComplete={handleConfigurationComplete}
            onCancel={handleConfigurationCancel}
          />
        ) : (
          <>
            {/* Upload Area */}
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
                accept={[...SUPPORTED_FORMATS.video.formats, ...SUPPORTED_FORMATS.image.formats].join(',')}
                onChange={handleChange}
                style={{ display: 'none' }}
              />
              
              <div style={{ fontSize: 48, marginBottom: SPACING.md, opacity: 0.6 }}>
                {uploading ? '⏳' : '🎬'}
              </div>
              
              <h3 style={{
                fontSize: TYPOGRAPHY.h3.fontSize,
                color: COLORS.textPrimary,
                marginBottom: SPACING.sm,
              }}>
                {uploading ? 'Processing Asset...' : 'Drop your video or image here'}
              </h3>
              
              <p style={{
                fontSize: TYPOGRAPHY.body.fontSize,
                color: COLORS.textSecondary,
                marginBottom: SPACING.md,
              }}>
                Perfect for intros, outros, and branded content
              </p>

              <p style={{
                fontSize: TYPOGRAPHY.bodySmall.fontSize,
                color: COLORS.textTertiary,
              }}>
                Supported: {SUPPORTED_FORMATS.video.formats.join(', ')}, {SUPPORTED_FORMATS.image.formats.join(', ')}
                <br />
                Max video: 100MB, 60s | Max image: 10MB
              </p>
            </div>

            {/* Asset List */}
            {assets.length > 0 && (
              <div>
                <h3 style={{
                  fontSize: TYPOGRAPHY.h3.fontSize,
                  color: COLORS.textPrimary,
                  marginBottom: SPACING.md,
                }}>
                  Uploaded Assets
                </h3>
                
                {assets.map(asset => (
                  <div 
                    key={asset.id}
                    onClick={() => handleAssetSelect(asset)}
                    style={{ cursor: asset.status === 'ready' ? 'pointer' : 'default' }}
                  >
                    <AssetPreview
                      asset={asset}
                      onRemove={() => handleAssetRemove(asset)}
                    />
                  </div>
                ))}
                
                <p style={{
                  fontSize: TYPOGRAPHY.bodySmall.fontSize,
                  color: COLORS.textSecondary,
                  textAlign: 'center',
                  marginTop: SPACING.md,
                }}>
                  Click on a ready asset to create a segment
                </p>
              </div>
            )}

            {/* Usage Tips */}
            <div style={{
              marginTop: SPACING.lg,
              padding: SPACING.md,
              backgroundColor: COLORS.surface,
              borderRadius: EFFECTS.borderRadius.medium,
              border: `1px solid ${COLORS.border}`,
            }}>
              <h4 style={{
                fontSize: TYPOGRAPHY.bodyLarge.fontSize,
                color: COLORS.textPrimary,
                marginBottom: SPACING.sm,
              }}>
                💡 Tips for Best Results
              </h4>
              <ul style={{
                fontSize: TYPOGRAPHY.bodySmall.fontSize,
                color: COLORS.textSecondary,
                margin: 0,
                paddingLeft: SPACING.md,
                lineHeight: 1.6,
              }}>
                <li>Use 16:9 aspect ratio (1920x1080) for best video compatibility</li>
                <li>Keep video segments under 60 seconds for optimal performance</li>
                <li>High contrast images work better with text overlays</li>
                <li>MP4 format recommended for maximum compatibility</li>
                <li>Consider your brand colors when adding text overlays</li>
              </ul>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssetUploader;