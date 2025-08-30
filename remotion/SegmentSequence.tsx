import React from "react";
import { Sequence, useVideoConfig, getInputProps } from "remotion";

interface ProjectData {
  id: string;
  name: string;
  segments: {
    id: number;
    title: string;
    subtitle?: string;
    key_points: string[];
    narrative: string;
    duration_seconds: number;
    suggested_visuals?: string[];
  }[];
}
// Segment imports removed - components don't exist
// More segment imports removed

export const SegmentSequence: React.FC = () => {
  const { fps } = useVideoConfig();
  const inputProps = getInputProps() as ProjectData;
  
  // Use inputProps if available, otherwise fallback to hardcoded values
  const segmentDurations = inputProps?.segments?.length > 0 
    ? inputProps.segments.map(seg => seg.duration_seconds)
    : [
        15, // Segment 1 - veo.mp4 + voiceover
        30, // Segment 2 - Hidden Marketplace (was Segment 1)
        18, // Segment 3 - Blind Spot (was Segment 2)
        24, // Segment 4 - IAB Ecosystem (was Segment 3)
        17, // Segment 5 - Chain Broken (was Segment 4)
        18  // Segment 6 - pic1 to pic2 transition (was Segment 5)
      ];

  let currentFrame = 0;

  return (
    <>
      {/* Segment 1 - veo.mp4 with voiceover */}
      <Sequence
        from={currentFrame}
        durationInFrames={segmentDurations[0] * fps}
      >
        <Segment1 />
      </Sequence>
      {(currentFrame += segmentDurations[0] * fps)}

      {/* Segment 2 - Hidden Marketplace */}
      <Sequence
        from={currentFrame}
        durationInFrames={segmentDurations[1] * fps}
      >
        <Segment2 />
      </Sequence>
      {(currentFrame += segmentDurations[1] * fps)}

      {/* Segment 3 - Blind Spot */}
      <Sequence
        from={currentFrame}
        durationInFrames={segmentDurations[2] * fps}
      >
        <Segment3 />
      </Sequence>
      {(currentFrame += segmentDurations[2] * fps)}

      {/* Segment 4 - IAB Ecosystem */}
      <Sequence
        from={currentFrame}
        durationInFrames={segmentDurations[3] * fps}
      >
        <Segment4 />
      </Sequence>
      {(currentFrame += segmentDurations[3] * fps)}

      {/* Segment 5 - Chain Broken */}
      <Sequence
        from={currentFrame}
        durationInFrames={segmentDurations[4] * fps}
      >
        <Segment5 />
      </Sequence>
      {(currentFrame += segmentDurations[4] * fps)}

      {/* Segment 6 - pic1 to pic2 transition */}
      <Sequence
        from={currentFrame}
        durationInFrames={segmentDurations[5] * fps}
      >
        <Segment6 />
      </Sequence>
    </>
  );
};