import { OpenAI } from 'openai';
import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';
import { VOScript, VOScene } from './vo-script';

export interface WordTiming {
  word: string;
  start: number; // ms
  end: number; // ms
}

export interface SentenceTiming {
  sentence: string;
  start: number; // ms
  end: number; // ms
  words: WordTiming[];
}

export interface SceneTiming {
  sceneId: string;
  start: number; // ms
  end: number; // ms
  sentences: SentenceTiming[];
  totalDurationMs: number;
}

export interface TTSResult {
  audioBuffer: Buffer;
  sceneTimings: SceneTiming[];
  totalDurationMs: number;
  cacheHit: boolean;
}

export class TTSTimingExtractor {
  private openai: OpenAI;
  private cacheDir: string;
  
  constructor(apiKey: string, cacheDir: string = './cache/tts') {
    this.openai = new OpenAI({ apiKey });
    this.cacheDir = cacheDir;
  }
  
  /**
   * Generate TTS audio with sentence-level timing extraction
   */
  async generateWithTiming(voScript: VOScript): Promise<TTSResult> {
    // Ensure cache directory exists
    await fs.mkdir(this.cacheDir, { recursive: true });
    
    const fullText = voScript.scenes.map(s => s.text).join(' ');
    const cacheKey = this.getCacheKey(fullText);
    const cacheFile = path.join(this.cacheDir, `${cacheKey}.json`);
    const audioFile = path.join(this.cacheDir, `${cacheKey}.mp3`);
    
    // Check cache first
    const cached = await this.getCachedResult(cacheFile, audioFile);
    if (cached) {
      return { ...cached, cacheHit: true };
    }
    
    // Generate TTS audio
    console.log('🔊 Generating TTS audio...');
    const audioBuffer = await this.generateTTSAudio(fullText);
    
    // Extract timing information from sentences
    const sceneTimings = await this.extractSceneTimings(voScript.scenes, audioBuffer);
    const totalDurationMs = Math.max(...sceneTimings.map(s => s.end));
    
    const result: TTSResult = {
      audioBuffer,
      sceneTimings,
      totalDurationMs,
      cacheHit: false
    };
    
    // Cache the result
    await this.cacheResult(cacheFile, audioFile, result);
    
    return result;
  }
  
  private async generateTTSAudio(text: string): Promise<Buffer> {
    try {
      const mp3 = await this.openai.audio.speech.create({
        model: 'tts-1',
        voice: 'nova', // Professional female voice
        input: text,
        response_format: 'mp3',
        speed: 1.0 // Normal speed for timing accuracy
      });
      
      const buffer = Buffer.from(await mp3.arrayBuffer());
      return buffer;
    } catch (error) {
      throw new Error(`TTS generation failed: ${error}`);
    }
  }
  
  private async extractSceneTimings(scenes: VOScene[], audioBuffer: Buffer): Promise<SceneTiming[]> {
    const sceneTimings: SceneTiming[] = [];
    let currentTimeMs = 0;
    
    for (const scene of scenes) {
      const sentences = await this.extractSentenceTimings(
        scene.sentences,
        scene.estimatedDurationMs,
        currentTimeMs
      );
      
      const sceneDuration = sentences.reduce((max, s) => Math.max(max, s.end), 0) - currentTimeMs;
      
      const sceneTiming: SceneTiming = {
        sceneId: scene.id,
        start: currentTimeMs,
        end: currentTimeMs + sceneDuration,
        sentences,
        totalDurationMs: sceneDuration
      };
      
      sceneTimings.push(sceneTiming);
      currentTimeMs += sceneDuration;
    }
    
    return sceneTimings;
  }
  
  private async extractSentenceTimings(
    sentences: string[],
    totalSceneDurationMs: number,
    sceneStartMs: number
  ): Promise<SentenceTiming[]> {
    const sentenceTimings: SentenceTiming[] = [];
    const avgSentenceDuration = totalSceneDurationMs / sentences.length;
    let currentMs = sceneStartMs;
    
    for (const sentence of sentences) {
      // Estimate timing based on word count and speaking rate
      const words = sentence.split(/\s+/).filter(w => w.length > 0);
      const sentenceDuration = this.estimateSentenceDuration(words.length);
      
      const wordTimings = await this.extractWordTimings(
        words,
        currentMs,
        sentenceDuration
      );
      
      const sentenceTiming: SentenceTiming = {
        sentence: sentence.trim(),
        start: currentMs,
        end: currentMs + sentenceDuration,
        words: wordTimings
      };
      
      sentenceTimings.push(sentenceTiming);
      currentMs += sentenceDuration;
    }
    
    return sentenceTimings;
  }
  
  private async extractWordTimings(
    words: string[],
    startMs: number,
    totalDurationMs: number
  ): Promise<WordTiming[]> {
    const wordTimings: WordTiming[] = [];
    let currentMs = startMs;
    
    for (const word of words) {
      // Estimate word duration based on syllable count and speaking rate
      const wordDuration = this.estimateWordDuration(word);
      
      wordTimings.push({
        word: word.replace(/[^\w]/g, ''), // Clean punctuation
        start: currentMs,
        end: currentMs + wordDuration
      });
      
      currentMs += wordDuration;
    }
    
    // Normalize to fit total duration
    const totalEstimated = wordTimings.reduce((sum, w) => sum + (w.end - w.start), 0);
    const scaleFactor = totalDurationMs / totalEstimated;
    
    currentMs = startMs;
    for (const timing of wordTimings) {
      const duration = (timing.end - timing.start) * scaleFactor;
      timing.start = currentMs;
      timing.end = currentMs + duration;
      currentMs += duration;
    }
    
    return wordTimings;
  }
  
  private estimateSentenceDuration(wordCount: number): number {
    // Average 110 WPM = 1.83 words per second
    // Add pauses for punctuation and natural speaking rhythm
    const baseMs = (wordCount / 1.83) * 1000;
    const pauseMs = 200; // Natural pause between sentences
    return baseMs + pauseMs;
  }
  
  private estimateWordDuration(word: string): number {
    // Estimate based on syllable count and average speaking rate
    const syllables = this.countSyllables(word);
    const baseMs = (syllables / 3.5) * 1000; // ~3.5 syllables per second
    return Math.max(baseMs, 150); // Minimum 150ms per word
  }
  
  private countSyllables(word: string): number {
    // Simple syllable counting heuristic
    const vowelGroups = word.toLowerCase().match(/[aeiouy]+/g);
    let syllables = vowelGroups ? vowelGroups.length : 1;
    
    // Adjust for silent e
    if (word.toLowerCase().endsWith('e') && syllables > 1) {
      syllables--;
    }
    
    return Math.max(syllables, 1);
  }
  
  private getCacheKey(text: string): string {
    return crypto.createHash('sha256').update(text).digest('hex').substring(0, 16);
  }
  
  private async getCachedResult(cacheFile: string, audioFile: string): Promise<Omit<TTSResult, 'cacheHit'> | null> {
    try {
      const [cacheData, audioBuffer] = await Promise.all([
        fs.readFile(cacheFile, 'utf-8'),
        fs.readFile(audioFile)
      ]);
      
      const parsed = JSON.parse(cacheData);
      return {
        audioBuffer,
        sceneTimings: parsed.sceneTimings,
        totalDurationMs: parsed.totalDurationMs
      };
    } catch {
      return null;
    }
  }
  
  private async cacheResult(cacheFile: string, audioFile: string, result: TTSResult): Promise<void> {
    const cacheData = {
      sceneTimings: result.sceneTimings,
      totalDurationMs: result.totalDurationMs,
      timestamp: Date.now()
    };
    
    await Promise.all([
      fs.writeFile(cacheFile, JSON.stringify(cacheData, null, 2)),
      fs.writeFile(audioFile, result.audioBuffer)
    ]);
  }
  
  /**
   * Convert timing data to Remotion-compatible cues
   */
  convertToRemotionCues(sceneTimings: SceneTiming[]): Array<{
    sceneId: string;
    cues: number[]; // Frame-based cues at 30fps
  }> {
    const FPS = 30;
    
    return sceneTimings.map(scene => ({
      sceneId: scene.sceneId,
      cues: scene.sentences.map(sentence => Math.round((sentence.start / 1000) * FPS))
    }));
  }
}