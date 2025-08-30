import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { VisualScene } from "../../src/types/index.js";

interface TitleSceneProps {
  scene: VisualScene;
}

export const TitleScene: React.FC<TitleSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const titleOpacity = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: scene.animation.duration || 60,
  });
  
  const subtitleOpacity = spring({
    frame: frame - 30,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 45,
  });
  
  const backgroundScale = interpolate(
    frame,
    [0, scene.duration],
    [1, 1.1],
    { extrapolateRight: "clamp" }
  );
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: scene.style?.backgroundColor,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        overflow: "hidden",
      }}
    >
      {/* Animated background pattern */}
      <div
        style={{
          position: "absolute",
          width: "120%",
          height: "120%",
          background: `linear-gradient(45deg, ${scene.style?.backgroundColor}00 0%, ${scene.style?.accentColor}20 50%, ${scene.style?.backgroundColor}00 100%)`,
          transform: `scale(${backgroundScale}) rotate(${frame * 0.1}deg)`,
          opacity: 0.3,
        }}
      />
      
      {/* Main title */}
      <h1
        style={{
          fontSize: 72,
          fontWeight: "bold",
          color: scene.style?.textColor,
          textAlign: "center",
          maxWidth: "90%",
          lineHeight: 1.2,
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleOpacity, [0, 1], [50, 0])}px)`,
          textShadow: `0 4px 20px ${scene.style?.accentColor}40`,
        }}
      >
        {scene.title}
      </h1>
      
      {/* Subtitle */}
      <p
        style={{
          fontSize: 42,
          color: scene.style?.accentColor,
          textAlign: "center",
          marginTop: 40,
          opacity: subtitleOpacity,
          transform: `translateY(${interpolate(subtitleOpacity, [0, 1], [30, 0])}px)`,
          fontWeight: 300,
          letterSpacing: "2px",
        }}
      >
        {scene.content?.text}
      </p>
      
      {/* Decorative elements */}
      <div
        style={{
          position: "absolute",
          bottom: 100,
          left: "50%",
          transform: "translateX(-50%)",
          width: interpolate(frame, [60, 120], [0, 200]),
          height: 2,
          backgroundColor: scene.style?.accentColor,
          opacity: subtitleOpacity,
        }}
      />
    </AbsoluteFill>
  );
};