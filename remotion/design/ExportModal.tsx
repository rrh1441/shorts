/**
 * Export Modal Component
 * Interface for downloading individual segments with configuration options
 * Optimized for external editing in Loom, Premiere, Final Cut, etc.
 */

import React, { useState, useCallback, useEffect } from 'react';
import { CSSProperties } from 'react';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  EFFECTS, 
  Z_INDEX 
} from './DesignSystem';
import {
  SegmentExporter,
  EXPORT_PRESETS,
  FILENAME_PATTERNS,
  ExportConfiguration,
  ExportProgress,
  SegmentExportRequest
} from './SegmentExporter';
import { SegmentMetadata } from './SegmentPreview';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  segment: SegmentMetadata;
  onExportStarted?: (segmentId: string, config: ExportConfiguration) => void;
  onExportCompleted?: (segmentId: string, outputPath: string) => void;
}

interface ExportProgressProps {
  progress: ExportProgress;
  onCancel: () => void;
}

const ExportProgressComponent: React.FC<ExportProgressProps> = ({ progress, onCancel }) => {
  const getStatusColor = () => {
    switch (progress.status) {
      case 'completed': return COLORS.success;
      case 'failed': return COLORS.error;
      case 'cancelled': return COLORS.textSecondary;
      case 'rendering': return COLORS.primary;
      default: return COLORS.warning;
    }
  };

  const getStatusIcon = () => {
    switch (progress.status) {
      case 'completed': return '✅';
      case 'failed': return '❌';
      case 'cancelled': return '⏹️';
      case 'rendering': return '⚙️';
      default: return '⏳';
    }
  };

  return (
    <div style={{
      padding: SPACING.lg,
      backgroundColor: COLORS.surface,
      borderRadius: EFFECTS.borderRadius.medium,
      border: `1px solid ${COLORS.border}`,
      marginTop: SPACING.lg,
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: SPACING.md,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
          <span>{getStatusIcon()}</span>
          <span style={{
            fontSize: TYPOGRAPHY.bodyLarge.fontSize,
            color: COLORS.textPrimary,
            textTransform: 'capitalize',
          }}>
            {progress.status.replace('_', ' ')} Export
          </span>
        </div>
        
        {progress.status === 'rendering' && (
          <button
            onClick={onCancel}
            style={{
              padding: `${SPACING.xs}px ${SPACING.sm}px`,
              backgroundColor: 'transparent',
              border: `1px solid ${COLORS.border}`,
              borderRadius: EFFECTS.borderRadius.small,
              color: COLORS.textSecondary,
              cursor: 'pointer',
              fontSize: TYPOGRAPHY.bodySmall.fontSize,
            }}
          >
            Cancel
          </button>
        )}
      </div>

      {/* Progress Bar */}
      <div style={{
        width: '100%',
        height: 8,
        backgroundColor: COLORS.background,
        borderRadius: 4,
        overflow: 'hidden',
        marginBottom: SPACING.sm,
      }}>
        <div style={{
          width: `${progress.progress}%`,
          height: '100%',
          backgroundColor: getStatusColor(),
          borderRadius: 4,
          transition: 'width 0.3s ease',
        }} />
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: TYPOGRAPHY.bodySmall.fontSize,
        color: COLORS.textSecondary,
      }}>
        <span>{Math.round(progress.progress)}% complete</span>
        {progress.endTime && progress.startTime && (
          <span>
            Duration: {Math.round((progress.endTime.getTime() - progress.startTime.getTime()) / 1000)}s
          </span>
        )}
      </div>

      {progress.status === 'completed' && progress.outputPath && (
        <div style={{
          marginTop: SPACING.md,
          padding: SPACING.sm,
          backgroundColor: COLORS.background,
          borderRadius: EFFECTS.borderRadius.small,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <span style={{
            fontSize: TYPOGRAPHY.bodySmall.fontSize,
            color: COLORS.textPrimary,
            fontFamily: 'monospace',
          }}>
            {progress.outputPath}
          </span>
          <button
            onClick={() => SegmentExporter.triggerDownload(progress.outputPath!, 'segment.mp4')}
            style={{
              padding: `${SPACING.sm}px ${SPACING.md}px`,
              backgroundColor: COLORS.success,
              border: 'none',
              borderRadius: EFFECTS.borderRadius.medium,
              color: COLORS.background,
              cursor: 'pointer',
              fontSize: TYPOGRAPHY.bodySmall.fontSize,
              fontWeight: 500,
            }}
          >
            📥 Download
          </button>
        </div>
      )}

      {progress.status === 'failed' && progress.error && (
        <div style={{
          marginTop: SPACING.md,
          padding: SPACING.sm,
          backgroundColor: `${COLORS.error}20`,
          borderRadius: EFFECTS.borderRadius.small,
          color: COLORS.error,
          fontSize: TYPOGRAPHY.bodySmall.fontSize,
        }}>
          Error: {progress.error}
        </div>
      )}
    </div>
  );
};

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  segment,
  onExportStarted,
  onExportCompleted
}) => {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof EXPORT_PRESETS>('loom');
  const [customConfig, setCustomConfig] = useState<ExportConfiguration>(EXPORT_PRESETS.loom);
  const [useCustomConfig, setUseCustomConfig] = useState(false);
  const [exportProgress, setExportProgress] = useState<ExportProgress | null>(null);
  const [exporting, setExporting] = useState(false);

  // Update custom config when preset changes
  useEffect(() => {
    if (!useCustomConfig) {
      setCustomConfig(EXPORT_PRESETS[selectedPreset]);
    }
  }, [selectedPreset, useCustomConfig]);

  // Listen for export progress updates
  useEffect(() => {
    const handleProgress = (event: CustomEvent<ExportProgress>) => {
      if (event.detail.segmentId === segment.id) {
        setExportProgress(event.detail);
        
        if (event.detail.status === 'completed' && event.detail.outputPath) {
          onExportCompleted?.(segment.id, event.detail.outputPath);
        }
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('segment-export-progress', handleProgress as EventListener);
      return () => {
        window.removeEventListener('segment-export-progress', handleProgress as EventListener);
      };
    }
  }, [segment.id, onExportCompleted]);

  const handleExport = useCallback(async () => {
    const config = useCustomConfig ? customConfig : EXPORT_PRESETS[selectedPreset];
    
    const exportRequest: SegmentExportRequest = {
      segmentId: segment.id,
      compositionId: segment.id, // Assuming composition ID matches segment ID
      config,
    };

    setExporting(true);
    onExportStarted?.(segment.id, config);

    try {
      await SegmentExporter.exportSegment(exportRequest);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  }, [segment.id, selectedPreset, customConfig, useCustomConfig, onExportStarted]);

  const handleCancel = useCallback(() => {
    if (exportProgress?.status === 'rendering') {
      SegmentExporter.cancelExport(segment.id);
    }
  }, [segment.id, exportProgress]);

  const handlePresetSelect = useCallback((preset: keyof typeof EXPORT_PRESETS) => {
    setSelectedPreset(preset);
    setUseCustomConfig(false);
  }, []);

  const handleCustomConfigChange = useCallback((field: keyof ExportConfiguration, value: any) => {
    setCustomConfig(prev => ({ ...prev, [field]: value }));
    setUseCustomConfig(true);
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
    maxWidth: 700,
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: `1px solid ${COLORS.border}`,
    boxShadow: EFFECTS.shadows.xlarge,
  };

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
            Export: {segment.name}
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

        {/* Segment Info */}
        <div style={{
          padding: SPACING.md,
          backgroundColor: COLORS.surface,
          borderRadius: EFFECTS.borderRadius.medium,
          marginBottom: SPACING.lg,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: TYPOGRAPHY.bodySmall.fontSize,
            color: COLORS.textSecondary,
          }}>
            <span>Duration: {segment.duration}s</span>
            <span>Type: {segment.type || 'standard'}</span>
            <span>Status: {segment.status}</span>
          </div>
        </div>

        {/* Export Presets */}
        <div style={{ marginBottom: SPACING.lg }}>
          <h3 style={{
            fontSize: TYPOGRAPHY.h3.fontSize,
            color: COLORS.textPrimary,
            marginBottom: SPACING.md,
            margin: `0 0 ${SPACING.md}px 0`,
          }}>
            Export Presets
          </h3>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: SPACING.sm,
            marginBottom: SPACING.md,
          }}>
            {Object.entries(EXPORT_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                onClick={() => handlePresetSelect(key as keyof typeof EXPORT_PRESETS)}
                style={{
                  padding: SPACING.md,
                  backgroundColor: selectedPreset === key && !useCustomConfig 
                    ? COLORS.primary 
                    : COLORS.surface,
                  border: `2px solid ${
                    selectedPreset === key && !useCustomConfig 
                      ? COLORS.primary 
                      : COLORS.border
                  }`,
                  borderRadius: EFFECTS.borderRadius.medium,
                  color: selectedPreset === key && !useCustomConfig 
                    ? COLORS.background 
                    : COLORS.textPrimary,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
              >
                <div style={{
                  fontSize: TYPOGRAPHY.bodyLarge.fontSize,
                  fontWeight: 600,
                  marginBottom: SPACING.xs,
                  textTransform: 'capitalize',
                }}>
                  {key}
                </div>
                <div style={{
                  fontSize: TYPOGRAPHY.bodySmall.fontSize,
                  opacity: 0.8,
                }}>
                  {preset.resolution.width}×{preset.resolution.height} • {preset.format.toUpperCase()}
                </div>
              </button>
            ))}
          </div>

          {/* Preset descriptions */}
          <div style={{
            padding: SPACING.sm,
            backgroundColor: COLORS.background,
            borderRadius: EFFECTS.borderRadius.small,
            fontSize: TYPOGRAPHY.bodySmall.fontSize,
            color: COLORS.textSecondary,
          }}>
            <strong>Loom:</strong> Perfect for Loom editing • 
            <strong> Social:</strong> Square format for social media • 
            <strong> Professional:</strong> High quality for editing software • 
            <strong> Web:</strong> Optimized for web embedding • 
            <strong> Presentation:</strong> High quality, no audio • 
            <strong> GIF:</strong> Animated preview
          </div>
        </div>

        {/* Custom Configuration Toggle */}
        <div style={{ marginBottom: SPACING.lg }}>
          <label style={{
            display: 'flex',
            alignItems: 'center',
            fontSize: TYPOGRAPHY.body.fontSize,
            color: COLORS.textPrimary,
            cursor: 'pointer',
          }}>
            <input
              type="checkbox"
              checked={useCustomConfig}
              onChange={(e) => setUseCustomConfig(e.target.checked)}
              style={{ marginRight: SPACING.sm }}
            />
            Custom Configuration
          </label>
        </div>

        {/* Custom Configuration Fields */}
        {useCustomConfig && (
          <div style={{ 
            marginBottom: SPACING.lg,
            padding: SPACING.md,
            backgroundColor: COLORS.surface,
            borderRadius: EFFECTS.borderRadius.medium,
            border: `1px solid ${COLORS.border}`,
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: SPACING.md }}>
              <div>
                <label style={{
                  fontSize: TYPOGRAPHY.bodySmall.fontSize,
                  color: COLORS.textSecondary,
                  marginBottom: SPACING.xs,
                  display: 'block',
                }}>
                  Format
                </label>
                <select
                  value={customConfig.format}
                  onChange={(e) => handleCustomConfigChange('format', e.target.value)}
                  style={inputStyle}
                >
                  <option value="mp4">MP4</option>
                  <option value="webm">WebM</option>
                  <option value="mov">MOV</option>
                  <option value="gif">GIF</option>
                </select>
              </div>

              <div>
                <label style={{
                  fontSize: TYPOGRAPHY.bodySmall.fontSize,
                  color: COLORS.textSecondary,
                  marginBottom: SPACING.xs,
                  display: 'block',
                }}>
                  Quality
                </label>
                <select
                  value={customConfig.quality}
                  onChange={(e) => handleCustomConfigChange('quality', e.target.value)}
                  style={inputStyle}
                >
                  <option value="low">Low (Fast)</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="ultra">Ultra (Slow)</option>
                </select>
              </div>

              <div>
                <label style={{
                  fontSize: TYPOGRAPHY.bodySmall.fontSize,
                  color: COLORS.textSecondary,
                  marginBottom: SPACING.xs,
                  display: 'block',
                }}>
                  Width
                </label>
                <input
                  type="number"
                  value={customConfig.resolution.width}
                  onChange={(e) => handleCustomConfigChange('resolution', {
                    ...customConfig.resolution,
                    width: Number(e.target.value)
                  })}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={{
                  fontSize: TYPOGRAPHY.bodySmall.fontSize,
                  color: COLORS.textSecondary,
                  marginBottom: SPACING.xs,
                  display: 'block',
                }}>
                  Height
                </label>
                <input
                  type="number"
                  value={customConfig.resolution.height}
                  onChange={(e) => handleCustomConfigChange('resolution', {
                    ...customConfig.resolution,
                    height: Number(e.target.value)
                  })}
                  style={inputStyle}
                />
              </div>
            </div>

            <label style={{
              display: 'flex',
              alignItems: 'center',
              fontSize: TYPOGRAPHY.body.fontSize,
              color: COLORS.textPrimary,
              marginTop: SPACING.md,
              cursor: 'pointer',
            }}>
              <input
                type="checkbox"
                checked={customConfig.includeAudio}
                onChange={(e) => handleCustomConfigChange('includeAudio', e.target.checked)}
                style={{ marginRight: SPACING.sm }}
              />
              Include Audio
            </label>
          </div>
        )}

        {/* Export Progress */}
        {exportProgress && (
          <ExportProgressComponent
            progress={exportProgress}
            onCancel={handleCancel}
          />
        )}

        {/* Action Buttons */}
        <div style={{ 
          display: 'flex', 
          gap: SPACING.md, 
          justifyContent: 'flex-end',
          marginTop: SPACING.lg,
        }}>
          <button
            onClick={onClose}
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
            Close
          </button>
          
          <button
            onClick={handleExport}
            disabled={exporting || exportProgress?.status === 'rendering'}
            style={{
              padding: `${SPACING.md}px ${SPACING.lg}px`,
              backgroundColor: exporting ? COLORS.textSecondary : COLORS.primary,
              border: 'none',
              borderRadius: EFFECTS.borderRadius.medium,
              color: COLORS.background,
              cursor: exporting ? 'not-allowed' : 'pointer',
              fontSize: TYPOGRAPHY.body.fontSize,
              fontWeight: 500,
            }}
          >
            {exporting ? '⚙️ Exporting...' : '📥 Export Segment'}
          </button>
        </div>

        {/* Export Tips */}
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
            💡 Export Tips
          </h4>
          <ul style={{
            fontSize: TYPOGRAPHY.bodySmall.fontSize,
            color: COLORS.textSecondary,
            margin: 0,
            paddingLeft: SPACING.md,
            lineHeight: 1.6,
          }}>
            <li><strong>Loom preset:</strong> Optimized for easy import into Loom</li>
            <li><strong>Professional preset:</strong> High quality MOV for Premiere/Final Cut</li>
            <li><strong>Web preset:</strong> Smaller files for online sharing</li>
            <li><strong>Segments export independently:</strong> Perfect for mixing in other editors</li>
            <li><strong>Include audio:</strong> Turn off for background music replacement</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ExportModal;