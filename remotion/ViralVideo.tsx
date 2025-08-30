import React from "react";
import {
  AbsoluteFill,
  Sequence,
  Audio,
  staticFile,
} from "remotion";
import { ViralScene } from "./scenes/ViralScene";

interface ViralVideoProps {
  viralScript: {
    title: string;
    totalDuration: number;
    scenes: Array<{
      id: string;
      type: "hook" | "reveal" | "shock" | "action";
      duration: number;
      script: string;
      audioFile?: string;
      audioFrames?: number;
      visuals: {
        mainText: string;
        supportText?: string;
        graphic: "chart" | "icon" | "number" | "image";
        graphicData?: any;
        style: "danger" | "warning" | "success" | "neutral";
        animation: "flash" | "slide" | "zoom" | "pulse";
      };
    }>;
  };
}

export const ViralVideoComponent: React.FC<ViralVideoProps> = ({ viralScript }) => {
  let currentFrame = 0;
  
  return (
    <AbsoluteFill style={{ backgroundColor: "#000000" }}>
      {viralScript.scenes.map((scene, index) => {
        const sceneStart = currentFrame;
        const sceneDuration = scene.audioFrames || (scene.duration * 30); // Use actual audio duration
        currentFrame += sceneDuration;
        
        return (
          <Sequence
            key={scene.id}
            from={sceneStart}
            durationInFrames={sceneDuration}
          >
            {/* Audio track */}
            {scene.audioFile && (
              <Audio
                src={staticFile(scene.audioFile)}
                startFrom={0}
                endAt={sceneDuration}
              />
            )}
            
            {/* Visual component */}
            <ViralScene scene={scene} />
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};