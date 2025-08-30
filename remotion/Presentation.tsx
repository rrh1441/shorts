import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  spring,
} from "remotion";
import { SlideOutline } from "../src/types";

const SLIDE_DURATION = 150;

interface PresentationProps {
  slides?: SlideOutline;
}

export const Presentation: React.FC<PresentationProps> = ({ slides }) => {
  if (!slides) {
    return (
      <AbsoluteFill style={{ backgroundColor: "#000", color: "white", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <h1>Loading slides...</h1>
      </AbsoluteFill>
    );
  }
  
  const outline: SlideOutline = slides;
  
  return (
    <AbsoluteFill style={{ backgroundColor: "#000" }}>
      {outline.slides.map((slide, index) => (
        <Sequence
          key={index}
          from={index * SLIDE_DURATION}
          durationInFrames={SLIDE_DURATION}
        >
          <Slide {...slide} />
        </Sequence>
      ))}
    </AbsoluteFill>
  );
};

const Slide: React.FC<SlideOutline["slides"][0]> = ({ title, content, type }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  
  const titleOpacity = spring({
    frame,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 30,
  });
  
  const contentOpacity = spring({
    frame: frame - 15,
    fps,
    from: 0,
    to: 1,
    durationInFrames: 30,
  });
  
  return (
    <AbsoluteFill
      style={{
        backgroundColor: "#1a1a1a",
        color: "white",
        padding: "5%",
        display: "flex",
        flexDirection: "column",
        justifyContent: type === "title" ? "center" : "flex-start",
        alignItems: type === "title" ? "center" : "flex-start",
      }}
    >
      <h1
        style={{
          fontSize: type === "title" ? 80 : 60,
          fontWeight: "bold",
          marginBottom: 40,
          opacity: titleOpacity,
          textAlign: type === "title" ? "center" : "left",
        }}
      >
        {title}
      </h1>
      
      <div style={{ opacity: contentOpacity, fontSize: 36, lineHeight: 1.6 }}>
        {Array.isArray(content) ? (
          <ul style={{ paddingLeft: 40 }}>
            {content.map((item, i) => (
              <li key={i} style={{ marginBottom: 20 }}>
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: type === "title" ? "center" : "left" }}>
            {content}
          </p>
        )}
      </div>
    </AbsoluteFill>
  );
};