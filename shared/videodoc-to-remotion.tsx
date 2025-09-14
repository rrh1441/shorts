import React from 'react';
import { Composition, Sequence, Audio, useCurrentFrame, useVideoConfig } from 'remotion';
import { VideoDoc, Scene, Element } from './scene-dsl';
import { Surface, Text, Stack, Callout, Media, Shape } from '../vds/primitives';
import { ChartFrame } from '../vds/primitives/ChartFrame';
import { getRemotionAnimation } from '../vds/motion';

interface VideoDocToRemotionProps {
  videoDoc: VideoDoc;
  audioSrc?: string;
}

/**
 * Main component that converts VideoDoc to Remotion composition
 */
export const VideoDocComposition: React.FC<VideoDocToRemotionProps> = ({
  videoDoc,
  audioSrc
}) => {
  const { fps } = useVideoConfig();
  
  // Calculate total duration in frames
  const totalDurationFrames = Math.round(
    (videoDoc.scenes.reduce((sum, scene) => sum + (scene.durationMs || 0), 0) / 1000) * fps
  );
  
  return (
    <>
      {/* Audio track */}
      {audioSrc && (
        <Audio src={audioSrc} />
      )}
      
      {/* Scene sequences */}
      {videoDoc.scenes.map((scene, index) => {
        const startFrame = videoDoc.scenes
          .slice(0, index)
          .reduce((sum, s) => sum + Math.round(((s.durationMs || 0) / 1000) * fps), 0);
        
        const durationFrames = Math.round(((scene.durationMs || 0) / 1000) * fps);
        
        return (
          <Sequence
            key={scene.id}
            from={startFrame}
            durationInFrames={durationFrames}
          >
            <SceneComponent 
              scene={scene}
              story={videoDoc.story}
            />
          </Sequence>
        );
      })}
    </>
  );
};

interface SceneComponentProps {
  scene: Scene;
  story: VideoDoc['story'];
}

/**
 * Individual scene component
 */
const SceneComponent: React.FC<SceneComponentProps> = ({ scene, story }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  // Convert aspect ratio to dimensions
  const aspect = 'horizontal'; // TODO: Get from story or config
  const totalFrames = Math.round(((scene.durationMs || 0) / 1000) * fps);
  
  return (
    <Surface
      aspect={aspect}
      safe={true}
      background="neutrals.100"
      motion={scene.motion}
      frame={frame}
      totalFrames={totalFrames}
    >
      <Stack direction="vertical" gap={6} align="center" justify="center">
        {scene.visuals.map((visual, index) => (
          <VisualElement
            key={`${scene.id}-visual-${index}`}
            element={visual}
            scene={scene}
            frame={frame}
            totalFrames={totalFrames}
            visualIndex={index}
          />
        ))}
      </Stack>
    </Surface>
  );
};

interface VisualElementProps {
  element: Element;
  scene: Scene;
  frame: number;
  totalFrames: number;
  visualIndex: number;
}

/**
 * Individual visual element renderer
 */
const VisualElement: React.FC<VisualElementProps> = ({
  element,
  scene,
  frame,
  totalFrames,
  visualIndex
}) => {
  // Calculate reveal timing based on VO cues
  const revealDelay = getRevealDelay(scene, visualIndex);
  const effectiveFrame = Math.max(0, frame - revealDelay);
  
  switch (element.kind) {
    case 'TEXT':
      return (
        <Text
          role={element.role}
          motion="standard"
          delay={revealDelay}
          frame={frame}
          totalFrames={totalFrames}
          align="center"
        >
          {element.text}
        </Text>
      );
      
    case 'CALLOUT':
      return (
        <Callout
          variant="accent"
          motion="emphasis"
          delay={revealDelay}
          frame={frame}
          totalFrames={totalFrames}
        >
          {element.text}
        </Callout>
      );
      
    case 'MEDIA':
      return (
        <Media
          src={element.src}
          fit={element.fit}
          focalPoint={element.focalPoint}
          mask={element.mask}
          motion="standard"
          delay={revealDelay}
          frame={frame}
          totalFrames={totalFrames}
          style={{ maxWidth: '60%', maxHeight: '40%' }}
        />
      );
      
    case 'CHART':
      return (
        <ChartFrame
          chart={element.chart}
          data={element.data}
          emphasize={element.emphasize}
          motion="emphasis"
          delay={revealDelay}
          frame={frame}
          totalFrames={totalFrames}
        />
      );
      
    case 'SHAPE':
      return (
        <Shape
          shape={element.shape}
          animate={element.animate}
          opacity={element.opacity}
          seed={element.seed}
          motion="gentle"
          delay={revealDelay}
          frame={frame}
          totalFrames={totalFrames}
        />
      );
      
    default:
      return null;
  }
};


/**
 * Calculate reveal delay based on VO cues
 */
function getRevealDelay(scene: Scene, visualIndex: number): number {
  const cues = scene.voiceover.cues;
  if (!cues || cues.length === 0) return 0;
  
  // Distribute visuals across available cues
  const cueIndex = Math.min(visualIndex, cues.length - 1);
  const cueTimeMs = cues[cueIndex];
  
  // Convert to frames (assuming 30fps)
  return Math.round((cueTimeMs / 1000) * 30);
}

/**
 * Generate Remotion composition definitions
 */
export function generateCompositions(videoDoc: VideoDoc, audioSrc?: string) {
  const { fps = 30 } = { fps: 30 }; // Default FPS
  
  // Calculate total duration
  const totalDurationMs = videoDoc.scenes.reduce((sum, scene) => sum + (scene.durationMs || 0), 0);
  const durationInFrames = Math.round((totalDurationMs / 1000) * fps);
  
  // Determine dimensions based on target format
  const dimensions = {
    horizontal: { width: 1920, height: 1080 },
    square: { width: 1080, height: 1080 },
    vertical: { width: 1080, height: 1920 }
  };
  
  const format = 'horizontal'; // TODO: Get from story metadata
  const { width, height } = dimensions[format];
  
  return [
    {
      id: videoDoc.story.controllingIdea.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30),
      component: VideoDocComposition,
      durationInFrames,
      fps,
      width,
      height,
      props: {
        videoDoc,
        audioSrc
      }
    }
  ];
}