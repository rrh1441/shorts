import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
} from "remotion";
import type { VisualScene } from "../../src/types/index.js";

interface ChartRevealSceneProps {
  scene: VisualScene;
}

export const ChartRevealScene: React.FC<ChartRevealSceneProps> = ({ scene }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const titleOpacity = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 40,
  });
  
  const chartData = scene.content?.chart;
  if (!chartData) return null;
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: scene.style?.backgroundColor,
        padding: "60px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {/* Title */}
      <h1
        style={{
          fontSize: 56,
          fontWeight: "bold",
          color: scene.style?.textColor,
          textAlign: "center",
          marginBottom: 60,
          opacity: titleOpacity,
          transform: `translateY(${interpolate(titleOpacity, [0, 1], [-40, 0])}px)`,
        }}
      >
        {scene.title}
      </h1>
      
      {/* Chart Container */}
      <div
        style={{
          flex: 1,
          width: "100%",
          maxWidth: 1000,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {chartData.type === "bar" ? (
          <BarChart scene={scene} chartData={chartData} />
        ) : chartData.type === "pie" ? (
          <PieChart scene={scene} chartData={chartData} />
        ) : (
          <BarChart scene={scene} chartData={chartData} />
        )}
      </div>
    </AbsoluteFill>
  );
};

interface ChartProps {
  scene: VisualScene;
  chartData: NonNullable<VisualScene['content']>['chart'];
}

const BarChart: React.FC<ChartProps> = ({ scene, chartData }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const buildProgress = spring({
    frame: frame - 60,
    fps,
    from: 0,
    to: 1,
    durationInFrames: scene.animation.duration || 90,
  });
  
  const maxValue = Math.max(...chartData!.data.datasets[0].data);
  
  return (
    <div style={{ width: "100%", height: 500, display: "flex", alignItems: "end", gap: 40, padding: "0 80px" }}>
      {chartData!.data.labels.map((label, index) => {
        const value = chartData!.data.datasets[0].data[index];
        const barHeight = (value / maxValue) * 400;
        const barDelay = index * 15;
        
        const barProgress = interpolate(
          frame,
          [60 + barDelay, 60 + barDelay + 60],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
        );
        
        return (
          <div
            key={index}
            style={{
              flex: 1,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 16,
            }}
          >
            {/* Value label */}
            <div
              style={{
                fontSize: 32,
                color: scene.style?.textColor,
                fontWeight: "bold",
                opacity: barProgress,
                transform: `translateY(${interpolate(barProgress, [0, 1], [-20, 0])}px)`,
              }}
            >
              {Math.round(value * barProgress)}
            </div>
            
            {/* Bar */}
            <div
              style={{
                width: "100%",
                height: barHeight * barProgress,
                backgroundColor: chartData!.data.datasets[0].backgroundColor?.[index] || scene.style?.accentColor,
                borderRadius: "8px 8px 0 0",
                position: "relative",
                boxShadow: `0 4px 20px ${chartData!.data.datasets[0].backgroundColor?.[index] || scene.style?.accentColor}40`,
              }}
            />
            
            {/* Label */}
            <div
              style={{
                fontSize: 24,
                color: scene.style?.textColor,
                textAlign: "center",
                opacity: barProgress,
                maxWidth: "100%",
                wordBreak: "break-word",
              }}
            >
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PieChart: React.FC<ChartProps> = ({ scene, chartData }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const buildProgress = spring({
    frame: frame - 60,
    fps,
    from: 0,
    to: 1,
    durationInFrames: scene.animation.duration || 90,
  });
  
  const total = chartData!.data.datasets[0].data.reduce((sum, val) => sum + val, 0);
  let currentAngle = -90; // Start from top
  
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 80 }}>
      {/* Pie Chart */}
      <div style={{ position: "relative", width: 400, height: 400 }}>
        <svg width="400" height="400" style={{ transform: "rotate(0deg)" }}>
          {chartData!.data.labels.map((label, index) => {
            const value = chartData!.data.datasets[0].data[index];
            const percentage = value / total;
            const angle = percentage * 360;
            const sliceProgress = interpolate(
              frame,
              [60 + index * 20, 60 + index * 20 + 40],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
            );
            
            const path = createPieSlice(200, 200, 150, currentAngle, currentAngle + (angle * sliceProgress), 20);
            currentAngle += angle;
            
            return (
              <path
                key={index}
                d={path}
                fill={chartData!.data.datasets[0].backgroundColor?.[index] || scene.style?.accentColor}
                stroke={scene.style?.backgroundColor}
                strokeWidth="4"
                opacity={sliceProgress}
              />
            );
          })}
        </svg>
      </div>
      
      {/* Legend */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {chartData!.data.labels.map((label, index) => {
          const value = chartData!.data.datasets[0].data[index];
          const legendProgress = interpolate(
            frame,
            [90 + index * 15, 90 + index * 15 + 30],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" }
          );
          
          return (
            <div
              key={index}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 16,
                opacity: legendProgress,
                transform: `translateX(${interpolate(legendProgress, [0, 1], [40, 0])}px)`,
              }}
            >
              <div
                style={{
                  width: 24,
                  height: 24,
                  backgroundColor: chartData!.data.datasets[0].backgroundColor?.[index] || scene.style?.accentColor,
                  borderRadius: "4px",
                }}
              />
              <span style={{ fontSize: 28, color: scene.style?.textColor }}>
                {label}: {value}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

function createPieSlice(cx: number, cy: number, radius: number, startAngle: number, endAngle: number, innerRadius: number = 0): string {
  const startAngleRad = (startAngle * Math.PI) / 180;
  const endAngleRad = (endAngle * Math.PI) / 180;
  
  const x1 = cx + radius * Math.cos(startAngleRad);
  const y1 = cy + radius * Math.sin(startAngleRad);
  const x2 = cx + radius * Math.cos(endAngleRad);
  const y2 = cy + radius * Math.sin(endAngleRad);
  
  const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
  
  if (innerRadius === 0) {
    return [
      "M", cx, cy,
      "L", x1, y1,
      "A", radius, radius, 0, largeArcFlag, 1, x2, y2,
      "Z"
    ].join(" ");
  }
  
  const x3 = cx + innerRadius * Math.cos(endAngleRad);
  const y3 = cy + innerRadius * Math.sin(endAngleRad);
  const x4 = cx + innerRadius * Math.cos(startAngleRad);
  const y4 = cy + innerRadius * Math.sin(startAngleRad);
  
  return [
    "M", x1, y1,
    "A", radius, radius, 0, largeArcFlag, 1, x2, y2,
    "L", x3, y3,
    "A", innerRadius, innerRadius, 0, largeArcFlag, 0, x4, y4,
    "Z"
  ].join(" ");
}