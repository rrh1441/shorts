import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { Shield, AlertTriangle, CheckCircle, Info } from "lucide-react";
import type { VisualScene } from "../../src/types/index.js";

interface BulletRevealSceneProps {
  scene: VisualScene;
}

const getIcon = (iconName: string, emphasis: "warning" | "success" | "info") => {
  const iconProps = {
    size: 48, // Larger icons for better visibility
    color: emphasis === "warning" ? "#ef4444" : emphasis === "success" ? "#22c55e" : "#3b82f6"
  };
  
  switch (iconName) {
    case "shield":
    case "shield-alert":
      return <Shield {...iconProps} />;
    case "alert-triangle":
    case "bug":
    case "zap":
      return <AlertTriangle {...iconProps} />;
    case "check-circle":
      return <CheckCircle {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
};

export const BulletRevealScene: React.FC<BulletRevealSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const titleOpacity = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 40,
  });
  
  const bullets = scene.content?.bullets || [];
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: scene.style?.backgroundColor,
        padding: "80px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Background gradient */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "300px",
          background: `linear-gradient(180deg, ${scene.style?.accentColor}10 0%, transparent 100%)`,
          opacity: 0.8,
        }}
      />
      
      {/* Title */}
      <h1
        style={{
          fontSize: 64,
          fontWeight: "bold",
          color: scene.style?.textColor,
          marginBottom: 80,
          opacity: titleOpacity,
          transform: `translateX(${interpolate(titleOpacity, [0, 1], [-100, 0])}px)`,
        }}
      >
        {scene.title}
      </h1>
      
      {/* Animated bullets - More visual focus with larger icons */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 60, justifyContent: "center" }}>
        {bullets.map((bullet, index) => {
          return (
            <BulletItem
              key={index}
              bullet={bullet}
              scene={scene}
              index={index}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

interface BulletItemProps {
  bullet: { text: string; icon?: string; emphasis?: "warning" | "success" | "info" };
  scene: VisualScene;
  index: number;
}

const BulletItem: React.FC<BulletItemProps> = ({ bullet, scene, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const bulletDelay = 60 + (index * (scene.animation.stagger || 30));
  
  const itemOpacity = spring({
    frame: frame - bulletDelay,
    fps,
    from: 0,
    to: 1,
    durationInFrames: scene.animation.duration || 50,
  });
  
  const slideDistance = scene.animation.type === "slide_up" ? 60 : 0;
  
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 24,
        opacity: itemOpacity,
        transform: `translateY(${interpolate(itemOpacity, [0, 1], [slideDistance, 0])}px)`,
      }}
    >
      {/* Icon - Larger for more visual impact */}
      <div
        style={{
          minWidth: 100,
          height: 100,
          borderRadius: "50%",
          backgroundColor: scene.style?.accentColor + "20",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          transform: `scale(${interpolate(itemOpacity, [0, 1], [0, 1])})`,
          boxShadow: `0 8px 32px ${scene.style?.accentColor}30`,
        }}
      >
        {getIcon(bullet.icon || "info", bullet.emphasis || "info")}
      </div>
      
      {/* Text - Larger and more prominent */}
      <p
        style={{
          fontSize: 48,
          fontWeight: "600",
          color: scene.style?.textColor,
          lineHeight: 1.4,
          margin: 0,
          flex: 1,
          paddingTop: 20,
          textShadow: `0 2px 8px ${scene.style?.backgroundColor}80`,
        }}
      >
        {bullet.text}
      </p>
    </div>
  );
};