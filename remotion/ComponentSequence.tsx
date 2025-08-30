import React from "react";
import { EnhancedSequenceProper } from "./EnhancedSequenceProper";
import type { ReportAnalysis } from "../src/types/index.js";

interface ComponentSequenceProps {
  analysis: ReportAnalysis;
}

// ComponentSequence now uses EnhancedSequenceProper for consistent DataStoryProper formatting
export const ComponentSequence: React.FC<ComponentSequenceProps> = ({
  analysis,
}) => {
  return <EnhancedSequenceProper analysis={analysis} useManualSegments={false} />;
};