import React from "react";
import { Composition } from "remotion";
import { Presentation } from "./Presentation";
import { VisualPresentationComponent } from "./VisualPresentation";
import { ViralVideoComponent } from "./ViralVideo";
import { ComponentSequence } from "./ComponentSequence";
import { EnhancedSequence } from "./EnhancedSequence";
import { EnhancedSequenceProper } from "./EnhancedSequenceProper";
import { calculateTotalDuration } from "./utils/ttsDuration";
import { StaticAsset } from './StaticAsset';
import CarouselSlide1 from '../projects/dukepres-pipeline-test/remotion-components/carousel-slide-1';
// Segment imports removed - these components don't exist
// import slidesData from "../dist/slides.json"; // File doesn't exist
// Demo imports removed - demos directory doesn't exist

// Try to load different data formats in priority order
let viralData;
let visualData;

// Skip analysisData loading since we're using dynamic props now

// 2. Try viral script format
try {
  viralData = require("../dist/viral-script-with-audio.json");
  console.log("Loading viral video script");
} catch {
  try {
    viralData = require("../dist/viral-script.json");
    console.log("Loading viral video script (no audio)");
  } catch {
    viralData = null;
  }
}

// 3. Try visual presentation data as fallback
try {
  visualData = require("../dist/visual-presentation-with-audio.json");
  console.log("Loading visual presentation as fallback");
} catch {
  try {
    visualData = require("../dist/visual-presentation.json");
  } catch {
    visualData = null;
  }
}

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* Manual Segments - For your ongoing project */}
      <Composition
        id="ManualSegments"
        component={EnhancedSequenceProper}
        durationInFrames={112 * 30} // Total of 6 segments: 6+17+32+23+24+10
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          useManualSegments: true
        }}
      />
      
      {/* Demo compositions removed - components don't exist */}
      
      
      {/* Segment compositions removed - components don't exist */}
      
      <Composition
        id="ComponentSequence"
        component={ComponentSequence}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{
          analysis: {
            title: '',
            executive_summary: '',
            video_segments: []
          },
          useManualSegments: false
        }}
        calculateMetadata={({ props }) => {
          const segments = props?.analysis?.video_segments ?? [];
          // Use calculateTotalDuration for proper TTS duration estimation
          const totalSeconds = calculateTotalDuration(segments);
          return Promise.resolve({
            durationInFrames: Math.max(1, Math.floor(totalSeconds * 30)),
            fps: 30,
          });
        }}
      />
      <Composition
        id="ComponentSequenceMobile"
        component={EnhancedSequence}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{
          analysis: {
            title: '',
            executive_summary: '',
            video_segments: []
          },
          useManualSegments: false
        }}
        calculateMetadata={({ props }) => {
          const segments = props?.analysis?.video_segments ?? [];
          // Use calculateTotalDuration for proper TTS duration estimation
          const totalSeconds = calculateTotalDuration(segments);
          return Promise.resolve({
            durationInFrames: Math.max(1, Math.floor(totalSeconds * 30)),
            fps: 30,
          });
        }}
      />
      {/* Universal static asset composition */}
      <Composition
        id="StaticAsset"
        component={StaticAsset as any}
        fps={30}
        width={1080}
        height={1350}
        durationInFrames={1}
      />
      
      {/* Carousel slide compositions */}
      <Composition
        id="CarouselSlide1"
        component={CarouselSlide1}
        fps={30}
        width={1080}
        height={1350}
        durationInFrames={1}
      />
    </>
  );
  
  // Original fallback logic (unreachable now)
  /*if (analysisData && analysisData.video_segments) {
    const totalDuration = analysisData.video_segments.reduce(
      (sum: number, segment: any) => sum + segment.duration_seconds, 
      0
    );
    const totalFrames = totalDuration * 30;
    
    return (
      <>
        <Composition
          id="ComponentSequenceOld"
          component={ComponentSequence}
          durationInFrames={totalFrames}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ analysis: analysisData }}
        />
      </>
    );
  }*/
  
  // 2. Fallback to viral video format
  if (viralData) {
    const totalFrames = viralData.totalDuration * 30; // Convert seconds to frames
    return (
      <>
        <Composition
          id="ViralVideo"
          component={ViralVideoComponent}
          durationInFrames={totalFrames}
          fps={30}
          width={1080}
          height={1920} // Vertical format for social media
          defaultProps={{ viralScript: viralData }}
        />
        {/* Also include horizontal version */}
        <Composition
          id="ViralVideoHorizontal"
          component={ViralVideoComponent}
          durationInFrames={totalFrames}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ viralScript: viralData }}
        />
      </>
    );
  }
  
  // 3. Fallback to visual presentation
  if (visualData) {
    return (
      <>
        <Composition
          id="VisualPresentation"
          component={VisualPresentationComponent}
          durationInFrames={visualData.totalDuration}
          fps={30}
          width={1920}
          height={1080}
          defaultProps={{ presentation: visualData }}
        />
      </>
    );
  }
  
  // 4. Final fallback to old slides format
  const slideCount = slidesData.slides.length;
  const SLIDE_DURATION = 150;
  const totalFrames = slideCount * SLIDE_DURATION;

  return (
    <>
      <Composition
        id="Presentation"
        component={Presentation}
        durationInFrames={totalFrames}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ slides: slidesData }}
      />
    </>
  );
};