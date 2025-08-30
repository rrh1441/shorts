/**
 * Segment-Based Design Workflow Component
 * Enables rendering and previewing individual 0-30s segments within the editor
 * Key lesson: "Do all design by segment. It's impossible to really understand the issues until it's rendered"
 */

import React, { useState, useCallback, useRef } from 'react';
import { CSSProperties } from 'react';
import { 
  COLORS, 
  TYPOGRAPHY, 
  SPACING, 
  EFFECTS, 
  ANIMATIONS 
} from './DesignSystem';
import { CustomSegmentConfig } from './AssetManager';
import ExportModal from './ExportModal';
import { ExportConfiguration } from './SegmentExporter';

// Segment metadata interface (enhanced to support custom assets)
interface SegmentMetadata {
  id: string;
  name: string;
  duration: number; // in seconds
  description: string;
  component: React.ComponentType<any>;
  props?: any;
  audioFile?: string;
  status: 'draft' | 'in_progress' | 'ready' | 'error';
  type?: 'standard' | 'custom_asset';
  customConfig?: CustomSegmentConfig; // For custom asset segments
}

interface SegmentPreviewProps {
  segments: SegmentMetadata[];
  onSegmentUpdate: (segmentId: string, updates: Partial<SegmentMetadata>) => void;
  onRenderSegment: (segmentId: string) => Promise<void>;
  currentSegment?: string;
  onSegmentSelect: (segmentId: string) => void;
  onAddCustomSegment?: () => void; // For opening asset uploader
  onCustomSegmentCreated?: (config: CustomSegmentConfig) => void;
}

interface SegmentCardProps {
  segment: SegmentMetadata;
  isSelected: boolean;
  onSelect: () => void;
  onRender: () => void;
  onEdit: () => void;
  onExport: () => void;
  isRendering: boolean;
}

interface SegmentPlayerProps {
  segment: SegmentMetadata;
  onClose: () => void;
}

const SegmentCard: React.FC<SegmentCardProps> = ({
  segment,
  isSelected,
  onSelect,
  onRender,
  onEdit,
  isRendering
}) => {
  const getStatusColor = (status: SegmentMetadata['status']) => {
    switch (status) {
      case 'ready': return COLORS.success;
      case 'in_progress': return COLORS.warning;
      case 'error': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: SegmentMetadata['status']) => {
    switch (status) {
      case 'ready': return '✓';
      case 'in_progress': return '⏳';
      case 'error': return '❌';
      default: return '📝';
    }
  };

  const getSegmentTypeIcon = (type?: SegmentMetadata['type']) => {
    switch (type) {
      case 'custom_asset': return '🎬';
      default: return '📊';
    }
  };

  const cardStyle: CSSProperties = {
    padding: SPACING.lg,
    backgroundColor: isSelected ? COLORS.primary : COLORS.surface,
    border: `2px solid ${isSelected ? COLORS.primary : COLORS.border}`,
    borderRadius: EFFECTS.borderRadius.large,
    cursor: 'pointer',
    transition: `all ${ANIMATIONS.durations.normal}ms ${ANIMATIONS.easing.easeOut}`,
    marginBottom: SPACING.md,
    position: 'relative',
  };

  const titleStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.h3.fontSize,
    fontWeight: TYPOGRAPHY.h3.fontWeight,
    color: isSelected ? COLORS.background : COLORS.textPrimary,
    margin: `0 0 ${SPACING.sm}px 0`,
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.sm,
  };

  const durationStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: isSelected ? COLORS.background : COLORS.textSecondary,
    backgroundColor: isSelected ? 'rgba(255,255,255,0.2)' : COLORS.background,
    padding: `${SPACING.xs}px ${SPACING.sm}px`,
    borderRadius: EFFECTS.borderRadius.small,
    fontWeight: 500,
  };

  const descriptionStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    color: isSelected ? COLORS.background : COLORS.textSecondary,
    marginBottom: SPACING.md,
    lineHeight: 1.4,
  };

  const statusStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: SPACING.xs,
    fontSize: TYPOGRAPHY.caption.fontSize,
    color: getStatusColor(segment.status),
    marginBottom: SPACING.md,
    fontWeight: 500,
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
    transition: `all ${ANIMATIONS.durations.fast}ms`,
  };

  return (
    <div style={cardStyle} onClick={onSelect}>
      <div style={titleStyle}>
        <div style={{ display: 'flex', alignItems: 'center', gap: SPACING.sm }}>
          <span>{getSegmentTypeIcon(segment.type)}</span>
          <span>{segment.name}</span>
        </div>
        <span style={durationStyle}>{segment.duration}s</span>
      </div>
      
      <div style={statusStyle}>
        <span>{getStatusIcon(segment.status)}</span>
        <span style={{ textTransform: 'capitalize' }}>{segment.status.replace('_', ' ')}</span>
      </div>
      
      <p style={descriptionStyle}>{segment.description}</p>
      
      <div style={{ display: 'flex', gap: SPACING.sm }}>
        <button
          style={{
            ...buttonStyle,
            backgroundColor: isRendering ? COLORS.textSecondary : buttonStyle.backgroundColor,
            cursor: isRendering ? 'not-allowed' : 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            if (!isRendering) onRender();
          }}
          disabled={isRendering}
        >
          {isRendering ? '⏳ Rendering...' : '🎬 Render Preview'}
        </button>
        
        <button
          style={buttonStyle}
          onClick={(e) => {
            e.stopPropagation();
            onEdit();
          }}
        >
          ✏️ Edit
        </button>
        
        <button
          style={buttonStyle}
          onClick={(e) => {
            e.stopPropagation();
            onExport();
          }}
        >
          📥 Export
        </button>
      </div>
    </div>
  );
};

const SegmentPlayer: React.FC<SegmentPlayerProps> = ({ segment, onClose }) => {
  const overlayStyle: CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: SPACING.lg,
  };

  const playerStyle: CSSProperties = {
    backgroundColor: COLORS.background,
    borderRadius: EFFECTS.borderRadius.large,
    padding: SPACING.xxl,
    maxWidth: 1200,
    width: '100%',
    position: 'relative',
  };

  const headerStyle: CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  };

  const titleStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.h2.fontSize,
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
  };

  const videoContainerStyle: CSSProperties = {
    width: '100%',
    height: 400,
    backgroundColor: COLORS.surface,
    borderRadius: EFFECTS.borderRadius.medium,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.lg,
    border: `1px solid ${COLORS.border}`,
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={playerStyle} onClick={(e) => e.stopPropagation()}>
        <div style={headerStyle}>
          <h2 style={titleStyle}>{segment.name} Preview</h2>
          <button style={closeButtonStyle} onClick={onClose}>×</button>
        </div>
        
        <div style={videoContainerStyle}>
          {/* This would contain the actual Remotion Player component */}
          <div style={{ 
            textAlign: 'center',
            color: COLORS.textSecondary,
            fontSize: TYPOGRAPHY.body.fontSize,
          }}>
            <div style={{ fontSize: 48, marginBottom: SPACING.md }}>🎬</div>
            <div>Segment Preview Player</div>
            <div style={{ fontSize: TYPOGRAPHY.bodySmall.fontSize, marginTop: SPACING.sm }}>
              Duration: {segment.duration} seconds
            </div>
          </div>
        </div>
        
        <div style={{
          display: 'flex',
          gap: SPACING.md,
          justifyContent: 'center',
        }}>
          <button style={{
            padding: `${SPACING.md}px ${SPACING.lg}px`,
            backgroundColor: COLORS.primary,
            color: COLORS.background,
            border: 'none',
            borderRadius: EFFECTS.borderRadius.medium,
            cursor: 'pointer',
            fontSize: TYPOGRAPHY.body.fontSize,
          }}>
            ▶️ Play
          </button>
          
          <button style={{
            padding: `${SPACING.md}px ${SPACING.lg}px`,
            backgroundColor: COLORS.surface,
            color: COLORS.textPrimary,
            border: `1px solid ${COLORS.border}`,
            borderRadius: EFFECTS.borderRadius.medium,
            cursor: 'pointer',
            fontSize: TYPOGRAPHY.body.fontSize,
          }}>
            📥 Export Segment
          </button>
        </div>
      </div>
    </div>
  );
};

const SegmentPreview: React.FC<SegmentPreviewProps> = ({
  segments,
  onSegmentUpdate,
  onRenderSegment,
  currentSegment,
  onSegmentSelect,
  onAddCustomSegment,
  onCustomSegmentCreated
}) => {
  const [renderingSegments, setRenderingSegments] = useState<Set<string>>(new Set());
  const [playingSegment, setPlayingSegment] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [exportingSegment, setExportingSegment] = useState<SegmentMetadata | null>(null);
  const [showBatchExport, setShowBatchExport] = useState(false);

  const handleRenderSegment = useCallback(async (segmentId: string) => {
    setRenderingSegments(prev => new Set(prev).add(segmentId));
    
    try {
      await onRenderSegment(segmentId);
      onSegmentUpdate(segmentId, { status: 'ready' });
    } catch (error) {
      console.error('Error rendering segment:', error);
      onSegmentUpdate(segmentId, { status: 'error' });
    } finally {
      setRenderingSegments(prev => {
        const newSet = new Set(prev);
        newSet.delete(segmentId);
        return newSet;
      });
    }
  }, [onRenderSegment, onSegmentUpdate]);

  const handleEditSegment = useCallback((segmentId: string) => {
    onSegmentSelect(segmentId);
    // In a real implementation, this would open an editor interface
    console.log('Opening editor for segment:', segmentId);
  }, [onSegmentSelect]);

  const handleCustomSegmentCreated = useCallback((config: CustomSegmentConfig) => {
    // Convert CustomSegmentConfig to SegmentMetadata
    const segmentMetadata: SegmentMetadata = {
      id: config.id,
      name: config.name,
      duration: config.duration,
      description: `Custom ${config.type} segment with ${config.asset.type} asset`,
      component: () => null, // Will be handled by CustomAssetSegment
      status: 'ready',
      type: 'custom_asset',
      customConfig: config
    };
    
    // Add to segments list (in a real implementation, this would be handled by parent)
    onCustomSegmentCreated?.(config);
    
    console.log('Custom segment created:', config);
  }, [onCustomSegmentCreated]);

  const handleExportSegment = useCallback((segment: SegmentMetadata) => {
    setExportingSegment(segment);
  }, []);

  const handleExportStarted = useCallback((segmentId: string, config: ExportConfiguration) => {
    console.log(`Export started for segment ${segmentId} with config:`, config);
  }, []);

  const handleExportCompleted = useCallback((segmentId: string, outputPath: string) => {
    console.log(`Export completed for segment ${segmentId}:`, outputPath);
    // In a real implementation, you might want to show a success notification
  }, []);

  const containerStyle: CSSProperties = {
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    minHeight: '100vh',
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
    fontSize: TYPOGRAPHY.h1.fontSize,
    color: COLORS.textPrimary,
    margin: 0,
  };

  const toolbarStyle: CSSProperties = {
    display: 'flex',
    gap: SPACING.md,
    alignItems: 'center',
  };

  const buttonStyle: CSSProperties = {
    padding: `${SPACING.sm}px ${SPACING.md}px`,
    backgroundColor: COLORS.primary,
    color: COLORS.background,
    border: 'none',
    borderRadius: EFFECTS.borderRadius.medium,
    cursor: 'pointer',
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    fontWeight: 500,
  };

  const statsStyle: CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: SPACING.lg,
    marginBottom: SPACING.xxl,
  };

  const statCardStyle: CSSProperties = {
    padding: SPACING.lg,
    backgroundColor: COLORS.surface,
    borderRadius: EFFECTS.borderRadius.medium,
    border: `1px solid ${COLORS.border}`,
    textAlign: 'center',
  };

  const statValueStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.h2.fontSize,
    fontWeight: TYPOGRAPHY.h2.fontWeight,
    color: COLORS.primary,
    margin: `0 0 ${SPACING.xs}px 0`,
  };

  const statLabelStyle: CSSProperties = {
    fontSize: TYPOGRAPHY.bodySmall.fontSize,
    color: COLORS.textSecondary,
  };

  // Calculate stats
  const totalDuration = segments.reduce((sum, seg) => sum + seg.duration, 0);
  const readySegments = segments.filter(seg => seg.status === 'ready').length;
  const inProgressSegments = segments.filter(seg => seg.status === 'in_progress').length;

  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h1 style={titleStyle}>Segment-Based Video Editor</h1>
        <div style={toolbarStyle}>
          <button 
            style={{
              ...buttonStyle,
              backgroundColor: viewMode === 'list' ? COLORS.primary : COLORS.surface,
            }}
            onClick={() => setViewMode('list')}
          >
            📋 List View
          </button>
          <button 
            style={{
              ...buttonStyle,
              backgroundColor: viewMode === 'grid' ? COLORS.primary : COLORS.surface,
            }}
            onClick={() => setViewMode('grid')}
          >
            🎯 Grid View
          </button>
          <button 
            style={buttonStyle}
            onClick={onAddCustomSegment}
          >
            🎬 Add Custom Asset
          </button>
          <button style={buttonStyle}>
            ➕ Add Segment
          </button>
          <button 
            style={buttonStyle}
            onClick={() => setShowBatchExport(true)}
          >
            📦 Batch Export
          </button>
          <button style={buttonStyle}>
            🎬 Render All
          </button>
        </div>
      </div>

      {/* Statistics Dashboard */}
      <div style={statsStyle}>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{segments.length}</div>
          <div style={statLabelStyle}>Total Segments</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{totalDuration}s</div>
          <div style={statLabelStyle}>Total Duration</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{readySegments}</div>
          <div style={statLabelStyle}>Ready Segments</div>
        </div>
        <div style={statCardStyle}>
          <div style={statValueStyle}>{inProgressSegments}</div>
          <div style={statLabelStyle}>In Progress</div>
        </div>
      </div>

      {/* Key Lesson Reminder */}
      <div style={{
        padding: SPACING.lg,
        backgroundColor: COLORS.primary,
        color: COLORS.background,
        borderRadius: EFFECTS.borderRadius.medium,
        marginBottom: SPACING.xxl,
        border: `1px solid ${COLORS.primary}`,
      }}>
        <h3 style={{
          fontSize: TYPOGRAPHY.h3.fontSize,
          margin: `0 0 ${SPACING.sm}px 0`,
        }}>
          💡 Key Lesson: Segment-Based Design
        </h3>
        <p style={{
          fontSize: TYPOGRAPHY.body.fontSize,
          margin: 0,
          lineHeight: 1.4,
        }}>
          "Do all design by segment. It's impossible to really understand the issues until it's rendered 
          and rendering a segment (0-30s) takes way less time and compute than rendering the whole thing."
        </p>
      </div>

      {/* Segments List */}
      <div style={{
        display: viewMode === 'grid' ? 'grid' : 'block',
        gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fit, minmax(400px, 1fr))' : undefined,
        gap: SPACING.lg,
      }}>
        {segments.map(segment => (
          <SegmentCard
            key={segment.id}
            segment={segment}
            isSelected={currentSegment === segment.id}
            onSelect={() => onSegmentSelect(segment.id)}
            onRender={() => handleRenderSegment(segment.id)}
            onEdit={() => handleEditSegment(segment.id)}
            onExport={() => handleExportSegment(segment)}
            isRendering={renderingSegments.has(segment.id)}
          />
        ))}
      </div>

      {/* Segment Player Modal */}
      {playingSegment && (
        <SegmentPlayer
          segment={segments.find(s => s.id === playingSegment)!}
          onClose={() => setPlayingSegment(null)}
        />
      )}

      {/* Export Modal */}
      {exportingSegment && (
        <ExportModal
          isOpen={true}
          onClose={() => setExportingSegment(null)}
          segment={exportingSegment}
          onExportStarted={handleExportStarted}
          onExportCompleted={handleExportCompleted}
        />
      )}
    </div>
  );
};

export default SegmentPreview;
export type { SegmentMetadata };