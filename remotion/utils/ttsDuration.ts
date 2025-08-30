/**
 * TTS Duration Estimation Utility
 * Provides consistent duration calculation based on text content
 * to prevent audio cutoffs in video rendering
 */

/**
 * Estimates TTS duration based on text content
 * @param text - The text to be spoken
 * @param wordsPerMinute - Average speaking speed (default: 150 for clear TTS)
 * @param bufferSeconds - Additional buffer time to prevent cutoffs (default: 1.5s)
 * @returns Estimated duration in seconds
 */
export function estimateTTSDuration(
  text: string,
  wordsPerMinute: number = 150,
  bufferSeconds: number = 1.5
): number {
  // Clean and normalize text
  const cleanedText = text
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?;:'"()-]/g, '') // Keep only common punctuation
    .trim();

  // Count words (split by whitespace)
  const wordCount = cleanedText.split(/\s+/).filter(word => word.length > 0).length;
  
  // Handle empty or very short text
  if (wordCount === 0) {
    return bufferSeconds;
  }

  // Base calculation: words / words per minute * 60 seconds
  const baseDuration = (wordCount / wordsPerMinute) * 60;

  // Add pauses for punctuation
  const sentenceCount = (cleanedText.match(/[.!?]+/g) || []).length;
  const commaCount = (cleanedText.match(/[,;:]/g) || []).length;
  
  // Add 0.5s per sentence ending, 0.2s per comma/semicolon
  const punctuationPause = sentenceCount * 0.5 + commaCount * 0.2;

  // Calculate total with buffer
  const totalDuration = baseDuration + punctuationPause + bufferSeconds;

  // Ensure minimum duration of 3 seconds for any segment
  return Math.max(3, Math.ceil(totalDuration * 10) / 10); // Round to 1 decimal place
}

/**
 * Estimates duration for a segment with narrative and optional bullets
 * @param segment - The segment containing narrative and optional bullets
 * @returns Estimated duration in seconds
 */
export function estimateSegmentDuration(segment: {
  narrative?: string;
  script?: string;
  bullets?: string[];
  title?: string;
}): number {
  let fullText = '';

  // Add title if present
  if (segment.title) {
    fullText += segment.title + '. ';
  }

  // Use script if available (it's the actual TTS script), otherwise use narrative
  if (segment.script) {
    fullText += segment.script;
  } else if (segment.narrative) {
    fullText += segment.narrative;
  }

  // Add bullets if present
  if (segment.bullets && segment.bullets.length > 0) {
    fullText += ' ' + segment.bullets.join('. ');
  }

  // For complex segments with multiple elements, use slightly slower pace
  const hasMultipleElements = !!(segment.title && (segment.narrative || segment.script) && segment.bullets?.length);
  const wordsPerMinute = hasMultipleElements ? 140 : 150;

  return estimateTTSDuration(fullText, wordsPerMinute);
}

/**
 * Calculates total duration for all segments
 * @param segments - Array of segments
 * @returns Total duration in seconds
 */
export function calculateTotalDuration(segments: any[]): number {
  return segments.reduce((total, segment) => {
    // Use audio_duration if available (actual TTS duration)
    if (segment.audio_duration && typeof segment.audio_duration === 'number') {
      return total + segment.audio_duration;
    }
    
    // Otherwise estimate based on text content
    return total + estimateSegmentDuration(segment);
  }, 0);
}

/**
 * Adjusts segment durations to fit within a target total duration
 * while maintaining relative proportions
 * @param segments - Array of segments with estimated durations
 * @param targetDuration - Target total duration in seconds
 * @returns Segments with adjusted durations
 */
export function adjustSegmentDurations(
  segments: any[],
  targetDuration: number
): any[] {
  const estimatedDurations = segments.map(seg => estimateSegmentDuration(seg));
  const totalEstimated = estimatedDurations.reduce((sum, dur) => sum + dur, 0);
  
  // If estimated is close to target (within 10%), use estimates
  if (Math.abs(totalEstimated - targetDuration) / targetDuration < 0.1) {
    return segments.map((seg, i) => ({
      ...seg,
      duration_seconds: estimatedDurations[i],
      estimated_duration: estimatedDurations[i]
    }));
  }
  
  // Otherwise, scale proportionally
  const scaleFactor = targetDuration / totalEstimated;
  
  return segments.map((seg, i) => {
    const adjustedDuration = Math.max(3, estimatedDurations[i] * scaleFactor);
    return {
      ...seg,
      duration_seconds: Math.ceil(adjustedDuration * 10) / 10,
      estimated_duration: estimatedDurations[i],
      scale_factor: scaleFactor
    };
  });
}