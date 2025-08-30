import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
} from "remotion";
import { TitleScene } from "./scenes/TitleScene";
import { BulletRevealScene } from "./scenes/BulletRevealScene";
import { ChartRevealScene } from "./scenes/ChartRevealScene";
import type { VisualPresentation } from "../src/types/index.js";

interface VisualPresentationProps {
  presentation: VisualPresentation;
}

export const VisualPresentationComponent: React.FC<VisualPresentationProps> = ({ presentation }) => {
  let currentFrame = 0;
  
  return (
    <AbsoluteFill style={{ backgroundColor: presentation.theme.backgroundColor }}>
      {presentation.scenes.map((scene, index) => {
        const sceneStart = currentFrame;
        const sceneDuration = Math.max(1, scene.duration); // Ensure positive duration
        currentFrame += sceneDuration;
        
        return (
          <Sequence
            key={scene.id}
            from={sceneStart}
            durationInFrames={sceneDuration}
          >
            {/* Audio track for each scene */}
            {scene.audio?.file && (
              <Audio
                src={staticFile(scene.audio.file)}
                startFrom={0}
                endAt={sceneDuration}
              />
            )}
            
            {/* Visual components */}
            {scene.type === "title" && <TitleScene scene={scene} />}
            {scene.type === "bullet_reveal" && <BulletRevealScene scene={scene} />}
            {scene.type === "conclusion" && <BulletRevealScene scene={scene} />}
            {scene.type === "chart_reveal" && <ChartRevealScene scene={scene} />}
            {scene.type === "data_visualization" && <ChartRevealScene scene={scene} />}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};