import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import { 
  Shield, 
  AlertTriangle, 
  Zap, 
  Users, 
  Lock, 
  Wifi, 
  Smartphone,
  Coffee,
  Home,
  Hospital,
  DollarSign,
  Eye,
  Target
} from "lucide-react";

interface ViralSceneProps {
  scene: {
    id: string;
    type: "hook" | "reveal" | "shock" | "action";
    duration: number;
    script: string;
    visuals: {
      mainText: string;
      supportText?: string;
      graphic: "chart" | "icon" | "number" | "image";
      graphicData?: any;
      style: "danger" | "warning" | "success" | "neutral";
      animation: "flash" | "slide" | "zoom" | "pulse";
    };
  };
}

const getIcon = (iconName: string, size: number = 120) => {
  const iconProps = { size, strokeWidth: 2 };
  
  switch (iconName.toLowerCase()) {
    case "shield":
    case "shield-alert":
      return <Shield {...iconProps} />;
    case "alert":
    case "alert-triangle":
    case "warning":
      return <AlertTriangle {...iconProps} />;
    case "zap":
    case "lightning":
    case "bolt":
      return <Zap {...iconProps} />;
    case "users":
    case "people":
      return <Users {...iconProps} />;
    case "lock":
    case "security":
      return <Lock {...iconProps} />;
    case "wifi":
    case "network":
      return <Wifi {...iconProps} />;
    case "phone":
    case "smartphone":
      return <Smartphone {...iconProps} />;
    case "coffee":
    case "coffee-maker":
      return <Coffee {...iconProps} />;
    case "home":
    case "house":
      return <Home {...iconProps} />;
    case "hospital":
    case "medical":
      return <Hospital {...iconProps} />;
    case "money":
    case "dollar":
    case "cash":
      return <DollarSign {...iconProps} />;
    case "eye":
    case "watch":
      return <Eye {...iconProps} />;
    case "target":
    case "aim":
      return <Target {...iconProps} />;
    default:
      return <AlertTriangle {...iconProps} />;
  }
};

const getStyleColors = (style: string) => {
  switch (style) {
    case "danger":
      return {
        bg: "#7f1d1d", // red-900
        accent: "#ef4444", // red-500
        text: "#fca5a5", // red-300
        glow: "#dc2626" // red-600
      };
    case "warning":
      return {
        bg: "#78350f", // amber-900
        accent: "#f59e0b", // amber-500
        text: "#fcd34d", // amber-300
        glow: "#d97706" // amber-600
      };
    case "success":
      return {
        bg: "#14532d", // green-900
        accent: "#22c55e", // green-500
        text: "#86efac", // green-300
        glow: "#16a34a" // green-600
      };
    default:
      return {
        bg: "#1e293b", // slate-800
        accent: "#3b82f6", // blue-500
        text: "#cbd5e1", // slate-300
        glow: "#2563eb" // blue-600
      };
  }
};

export const ViralScene: React.FC<ViralSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const colors = getStyleColors(scene.visuals.style);
  
  // Main animation based on scene type
  const mainProgress = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 20,
  });
  
  // Text animation
  const textProgress = spring({
    frame: frame - 10,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 25,
  });
  
  // Icon animation based on visual style
  const getIconAnimation = () => {
    switch (scene.visuals.animation) {
      case "flash":
        return {
          opacity: interpolate(frame % 20, [0, 10, 20], [1, 0.3, 1]),
          scale: mainProgress,
        };
      case "pulse":
        return {
          opacity: 1,
          scale: interpolate(frame % 30, [0, 15, 30], [1, 1.2, 1]) * mainProgress,
        };
      case "zoom":
        return {
          opacity: mainProgress,
          scale: interpolate(mainProgress, [0, 1], [0.5, 1]),
        };
      case "slide":
      default:
        return {
          opacity: mainProgress,
          scale: mainProgress,
        };
    }
  };
  
  const iconAnim = getIconAnimation();
  
  // Background pulse for danger/warning
  const bgPulse = scene.visuals.style === "danger" || scene.visuals.style === "warning" 
    ? interpolate(frame % 60, [0, 30, 60], [0.8, 1, 0.8])
    : 1;

  return (
    <AbsoluteFill
      style={{
        backgroundColor: colors.bg,
        background: `radial-gradient(circle at center, ${colors.bg} 0%, #000000 100%)`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "40px",
        opacity: bgPulse,
      }}
    >
      {/* Background glow effect */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          height: "80%",
          background: `radial-gradient(circle, ${colors.glow}20 0%, transparent 70%)`,
          opacity: mainProgress,
        }}
      />
      
      {/* Main Icon */}
      {scene.visuals.graphic === "icon" && (
        <div
          style={{
            color: colors.accent,
            opacity: iconAnim.opacity,
            transform: `scale(${iconAnim.scale})`,
            marginBottom: "40px",
            filter: `drop-shadow(0 0 20px ${colors.glow})`,
          }}
        >
          {getIcon(scene.visuals.graphicData || "alert", 160)}
        </div>
      )}
      
      {/* Number display */}
      {scene.visuals.graphic === "number" && (
        <div
          style={{
            fontSize: "200px",
            fontWeight: "900",
            color: colors.accent,
            opacity: iconAnim.opacity,
            transform: `scale(${iconAnim.scale})`,
            marginBottom: "40px",
            textShadow: `0 0 40px ${colors.glow}`,
            fontFamily: "Arial Black, sans-serif",
          }}
        >
          {scene.visuals.graphicData || "?"}
        </div>
      )}
      
      {/* Main Text */}
      <div
        style={{
          fontSize: scene.visuals.mainText.length > 15 ? "80px" : "120px",
          fontWeight: "900",
          color: colors.text,
          textAlign: "center",
          lineHeight: 1.1,
          opacity: textProgress,
          transform: `translateY(${interpolate(textProgress, [0, 1], [30, 0])}px)`,
          textShadow: `0 4px 20px ${colors.glow}`,
          fontFamily: "Arial Black, sans-serif",
          letterSpacing: "-2px",
          maxWidth: "90%",
        }}
      >
        {scene.visuals.mainText.toUpperCase()}
      </div>
      
      {/* Support Text */}
      {scene.visuals.supportText && (
        <div
          style={{
            fontSize: "36px",
            fontWeight: "600",
            color: colors.accent,
            textAlign: "center",
            marginTop: "30px",
            opacity: interpolate(frame, [30, 50], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
            textShadow: `0 2px 10px ${colors.glow}50`,
          }}
        >
          {scene.visuals.supportText}
        </div>
      )}
      
      {/* Scene type indicator (subtle) */}
      <div
        style={{
          position: "absolute",
          bottom: "40px",
          right: "40px",
          fontSize: "18px",
          color: colors.accent,
          opacity: 0.6,
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "2px",
        }}
      >
        {scene.type}
      </div>
    </AbsoluteFill>
  );
};