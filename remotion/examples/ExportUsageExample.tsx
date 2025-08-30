/**
 * Export System Usage Examples
 * Demonstrates how to download individual segments for external editing
 * Perfect for combining segments in Loom, Premiere Pro, Final Cut, etc.
 */

import React, { useState, useEffect } from 'react';
import { 
  SegmentPreview, 
  SegmentMetadata,
  SegmentExporter,
  EXPORT_PRESETS,
  ExportConfiguration,
  ExportProgress
} from '../design';

// Example: Complete workflow with export functionality
export const ExportWorkflowExample: React.FC = () => {
  const [segments] = useState<SegmentMetadata[]>([
    {
      id: 'intro-segment',
      name: 'Brand Intro',
      duration: 5,
      description: 'Company logo with brand message',
      component: () => null,
      status: 'ready',
      type: 'custom_asset'
    },
    {
      id: 'main-content',
      name: 'Main Content',
      duration: 30,
      description: 'Primary video content with data visualization',
      component: () => null,
      status: 'ready',
      type: 'standard'
    },
    {
      id: 'call-to-action',
      name: 'Call to Action',
      duration: 8,
      description: 'Closing segment with contact information',
      component: () => null,
      status: 'ready',
      type: 'custom_asset'
    }
  ]);

  const [exportProgress, setExportProgress] = useState<Map<string, ExportProgress>>(new Map());

  // Listen for export progress updates
  useEffect(() => {
    const handleProgress = (event: CustomEvent<ExportProgress>) => {
      setExportProgress(prev => {
        const updated = new Map(prev);
        updated.set(event.detail.segmentId, event.detail);
        return updated;
      });
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('segment-export-progress', handleProgress as EventListener);
      return () => {
        window.removeEventListener('segment-export-progress', handleProgress as EventListener);
      };
    }
  }, []);

  const handleSegmentUpdate = (segmentId: string, updates: Partial<SegmentMetadata>) => {
    console.log(`Updating segment ${segmentId}:`, updates);
  };

  const handleRenderSegment = async (segmentId: string) => {
    console.log(`Rendering segment: ${segmentId}`);
    // Simulate render process
    await new Promise(resolve => setTimeout(resolve, 2000));
  };

  const handleSegmentSelect = (segmentId: string) => {
    console.log(`Selected segment: ${segmentId}`);
  };

  return (
    <div style={{ padding: '20px' }}>
      <h1>Export-Ready Video Segments</h1>
      <p>Each segment can be downloaded individually for editing in external software:</p>
      
      <SegmentPreview
        segments={segments}
        onSegmentUpdate={handleSegmentUpdate}
        onRenderSegment={handleRenderSegment}
        onSegmentSelect={handleSegmentSelect}
      />

      {/* Export Progress Display */}
      {exportProgress.size > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Export Progress</h3>
          {Array.from(exportProgress.entries()).map(([segmentId, progress]) => (
            <div key={segmentId} style={{
              padding: '10px',
              margin: '10px 0',
              backgroundColor: '#f5f5f5',
              borderRadius: '8px'
            }}>
              <div style={{ fontWeight: 'bold' }}>
                {segments.find(s => s.id === segmentId)?.name || segmentId}
              </div>
              <div>Status: {progress.status}</div>
              <div>Progress: {progress.progress}%</div>
              {progress.outputPath && (
                <div style={{ marginTop: '5px' }}>
                  <button
                    onClick={() => SegmentExporter.triggerDownload(progress.outputPath!, 'segment.mp4')}
                    style={{
                      padding: '5px 15px',
                      backgroundColor: '#4CAF50',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: 'pointer'
                    }}
                  >
                    📥 Download
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Example: Batch export for complete video production
export const BatchExportExample: React.FC = () => {
  const [exporting, setExporting] = useState(false);
  const [exportResults, setExportResults] = useState<Map<string, ExportProgress>>(new Map());

  const segments = [
    'intro-segment',
    'main-content-1',
    'main-content-2',
    'call-to-action'
  ];

  const handleBatchExport = async () => {
    setExporting(true);

    try {
      // Initialize the exporter (in real app, this would be done at startup)
      await SegmentExporter.initialize('./remotion');

      // Create batch export request
      const batchRequest = {
        segments: segments.map(segmentId => ({
          segmentId,
          compositionId: segmentId,
          config: EXPORT_PRESETS.loom, // Use Loom preset for easy editing
        })),
        outputDirectory: './exports/batch',
        namingPattern: '{segmentName}_loom_{timestamp}',
        simultaneous: 2
      };

      const results = await SegmentExporter.exportBatch(batchRequest);
      setExportResults(results);

    } catch (error) {
      console.error('Batch export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Batch Export for Loom Editing</h2>
      <p>Export all segments at once, optimized for import into Loom or other editing software.</p>

      <div style={{ margin: '20px 0' }}>
        <h3>Segments to Export:</h3>
        <ul>
          {segments.map(segmentId => (
            <li key={segmentId}>{segmentId}</li>
          ))}
        </ul>
      </div>

      <button
        onClick={handleBatchExport}
        disabled={exporting}
        style={{
          padding: '10px 20px',
          fontSize: '16px',
          backgroundColor: exporting ? '#ccc' : '#2196F3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: exporting ? 'not-allowed' : 'pointer'
        }}
      >
        {exporting ? '⚙️ Exporting...' : '📦 Export All for Loom'}
      </button>

      {exportResults.size > 0 && (
        <div style={{ marginTop: '20px' }}>
          <h3>Export Results</h3>
          {Array.from(exportResults.entries()).map(([segmentId, result]) => (
            <div key={segmentId} style={{
              padding: '10px',
              margin: '5px 0',
              backgroundColor: result.status === 'completed' ? '#e8f5e8' : '#ffe8e8',
              borderRadius: '4px'
            }}>
              <strong>{segmentId}:</strong> {result.status}
              {result.outputPath && (
                <button
                  onClick={() => SegmentExporter.triggerDownload(result.outputPath!, `${segmentId}.mp4`)}
                  style={{
                    marginLeft: '10px',
                    padding: '2px 8px',
                    fontSize: '12px',
                    backgroundColor: '#4CAF50',
                    color: 'white',
                    border: 'none',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                >
                  Download
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Example: Different export presets for various use cases
export const ExportPresetsExample: React.FC = () => {
  const [selectedPreset, setSelectedPreset] = useState<keyof typeof EXPORT_PRESETS>('loom');

  const presetDescriptions = {
    loom: "Perfect for importing into Loom - optimized quality and format",
    social: "Square format for social media platforms",
    professional: "High-quality MOV files for professional editing software",
    web: "Smaller files optimized for web embedding and sharing",
    presentation: "High-quality video without audio for presentations",
    gif: "Animated GIF for previews and social sharing"
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Export Presets for Different Use Cases</h2>
      
      <div style={{ margin: '20px 0' }}>
        <h3>Available Presets:</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
          {Object.entries(EXPORT_PRESETS).map(([presetKey, preset]) => (
            <div
              key={presetKey}
              onClick={() => setSelectedPreset(presetKey as keyof typeof EXPORT_PRESETS)}
              style={{
                padding: '15px',
                border: selectedPreset === presetKey ? '2px solid #2196F3' : '1px solid #ddd',
                borderRadius: '8px',
                cursor: 'pointer',
                backgroundColor: selectedPreset === presetKey ? '#f0f8ff' : 'white'
              }}
            >
              <h4 style={{ margin: '0 0 10px 0', textTransform: 'capitalize' }}>{presetKey}</h4>
              <div style={{ fontSize: '14px', color: '#666' }}>
                <div>{preset.resolution.width}×{preset.resolution.height}</div>
                <div>{preset.format.toUpperCase()} • {preset.quality}</div>
                <div>{preset.frameRate}fps</div>
                <div>{preset.includeAudio ? 'With Audio' : 'No Audio'}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '8px' }}>
        <h4>Selected: {selectedPreset}</h4>
        <p>{presetDescriptions[selectedPreset]}</p>
        <div style={{ marginTop: '10px', fontSize: '14px', fontFamily: 'monospace' }}>
          <strong>Configuration:</strong><br/>
          Format: {EXPORT_PRESETS[selectedPreset].format}<br/>
          Quality: {EXPORT_PRESETS[selectedPreset].quality}<br/>
          Resolution: {EXPORT_PRESETS[selectedPreset].resolution.width}×{EXPORT_PRESETS[selectedPreset].resolution.height}<br/>
          Frame Rate: {EXPORT_PRESETS[selectedPreset].frameRate}fps<br/>
          Audio: {EXPORT_PRESETS[selectedPreset].includeAudio ? 'Included' : 'Excluded'}<br/>
          {EXPORT_PRESETS[selectedPreset].bitrate && `Bitrate: ${EXPORT_PRESETS[selectedPreset].bitrate}`}
        </div>
      </div>
    </div>
  );
};

// Example: Integration with external editing workflows
export const ExternalEditingWorkflowExample: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>External Editing Workflows</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        
        {/* Loom Workflow */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>🎬 Loom Integration</h3>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Export segments using "Loom" preset</li>
            <li>Download individual MP4 files</li>
            <li>Import into Loom for easy arrangement</li>
            <li>Add transitions and additional content</li>
            <li>Publish directly from Loom</li>
          </ol>
          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            <strong>Best for:</strong> Quick video creation, team presentations, customer demos
          </div>
        </div>

        {/* Professional Workflow */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>🎞️ Premiere Pro / Final Cut</h3>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Export using "Professional" preset (MOV format)</li>
            <li>Download high-quality segments</li>
            <li>Import into timeline as separate clips</li>
            <li>Add professional transitions and effects</li>
            <li>Color correction and audio mastering</li>
            <li>Export final production</li>
          </ol>
          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            <strong>Best for:</strong> Professional productions, marketing videos, documentaries
          </div>
        </div>

        {/* Web Workflow */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>🌐 Web Integration</h3>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Export using "Web" preset (WebM format)</li>
            <li>Optimize for smaller file sizes</li>
            <li>Embed directly in websites</li>
            <li>Use for social media content</li>
            <li>Create video galleries</li>
          </ol>
          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            <strong>Best for:</strong> Website embedding, social media, mobile-optimized content
          </div>
        </div>

        {/* Presentation Workflow */}
        <div style={{ padding: '20px', border: '1px solid #ddd', borderRadius: '8px' }}>
          <h3>📊 PowerPoint / Keynote</h3>
          <ol style={{ paddingLeft: '20px', lineHeight: '1.6' }}>
            <li>Export using "Presentation" preset (no audio)</li>
            <li>Download high-quality video files</li>
            <li>Insert into presentation slides</li>
            <li>Add live narration during presentation</li>
            <li>Use as visual aids for key points</li>
          </ol>
          <div style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            <strong>Best for:</strong> Business presentations, conferences, training materials
          </div>
        </div>

      </div>

      <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#e8f5e8', borderRadius: '8px' }}>
        <h3>💡 Pro Tips</h3>
        <ul style={{ paddingLeft: '20px', lineHeight: '1.8' }}>
          <li><strong>Consistent naming:</strong> Use descriptive filenames for easy organization</li>
          <li><strong>Backup exports:</strong> Keep a copy of all exported segments</li>
          <li><strong>Quality settings:</strong> Use higher quality for final productions, lower for drafts</li>
          <li><strong>Audio separation:</strong> Export versions with and without audio for flexibility</li>
          <li><strong>Batch processing:</strong> Export multiple segments simultaneously for efficiency</li>
          <li><strong>Format compatibility:</strong> Check your editing software's preferred formats</li>
        </ul>
      </div>
    </div>
  );
};

export default {
  ExportWorkflowExample,
  BatchExportExample,
  ExportPresetsExample,
  ExternalEditingWorkflowExample
};