import { z } from 'zod';

// Arc types from PRD
export const ArcSchema = z.enum(['ProblemTurnProof', 'CaseLed', 'MMS']);

export const NarrativeBriefSchema = z.object({
  controllingIdea: z.string().max(120), // ≤ 1 sentence
  audienceChange: z.string().max(120),
  antagonist: z.string().max(120),
  stakes: z.string().max(120),
  promise: z.string().max(120),
  proofPillars: z.array(z.string().max(120)).max(3), // ≤ 3 pillars
  nextStep: z.string().max(120),
  arc: ArcSchema,
  targetDurationSec: z.number().int().min(30).max(90),
  audience: z.enum(['exec', 'technical', 'general']),
  allowResequence: z.boolean().default(true)
});

export type NarrativeBrief = z.infer<typeof NarrativeBriefSchema>;
export type Arc = z.infer<typeof ArcSchema>;

// Arc templates
export const ARC_TEMPLATES = {
  ProblemTurnProof: {
    scenes: ['HOOK', 'PROBLEM', 'TURN', 'APPROACH', 'PROOF', 'CTA'],
    turnByPercent: 0.4 // TURN must appear by 40% runtime
  },
  CaseLed: {
    scenes: ['HOOK', 'OUTCOME', 'BACKSTORY', 'PROCESS', 'RESULT', 'CTA'],
    turnByPercent: 0.3
  },
  MMS: {
    scenes: ['HOOK', 'PROBLEM', 'APPROACH', 'PROOF', 'CTA'],
    turnByPercent: 0.35
  }
} as const;

export class NarrativeBriefGenerator {
  /**
   * Generate narrative brief from universal insights
   */
  async generateBrief(
    insights: any, 
    targetDuration: number = 60,
    preferredArc: Arc = 'ProblemTurnProof'
  ): Promise<NarrativeBrief> {
    // Extract key insights for narrative construction
    const problem = this.extractProblem(insights);
    const solution = this.extractSolution(insights);
    const proof = this.extractProof(insights);
    
    const brief: NarrativeBrief = {
      controllingIdea: this.generateControllingIdea(problem, solution),
      audienceChange: this.generateAudienceChange(insights),
      antagonist: problem.antagonist || 'Status quo inefficiency',
      stakes: this.generateStakes(problem),
      promise: this.generatePromise(solution),
      proofPillars: this.extractProofPillars(proof),
      nextStep: this.generateNextStep(solution),
      arc: preferredArc,
      targetDurationSec: targetDuration,
      audience: this.determineAudience(insights),
      allowResequence: true
    };
    
    // Validate brief
    const validated = NarrativeBriefSchema.parse(brief);
    return validated;
  }
  
  private extractProblem(insights: any) {
    // Extract problem from insights data
    const challenges = insights.challenges || insights.painPoints || [];
    const mainChallenge = challenges[0];
    
    return {
      core: mainChallenge?.description || 'Current approach is inefficient',
      antagonist: mainChallenge?.cause || 'Manual processes',
      impact: mainChallenge?.impact || 'Wasted time and resources'
    };
  }
  
  private extractSolution(insights: any) {
    const solutions = insights.solutions || insights.recommendations || [];
    const mainSolution = solutions[0];
    
    return {
      approach: mainSolution?.approach || 'Automated workflow',
      mechanism: mainSolution?.mechanism || 'Smart routing',
      outcome: mainSolution?.outcome || 'Improved efficiency'
    };
  }
  
  private extractProof(insights: any) {
    const stats = insights.statistics || insights.metrics || [];
    const cases = insights.caseStudies || insights.examples || [];
    
    return {
      statistics: stats.slice(0, 2),
      cases: cases.slice(0, 1),
      metrics: insights.keyMetrics || []
    };
  }
  
  private generateControllingIdea(problem: any, solution: any): string {
    return `${solution.approach} turns ${problem.core} into ${solution.outcome}.`;
  }
  
  private generateAudienceChange(insights: any): string {
    return 'Move from reactive firefighting to proactive impact management.';
  }
  
  private generateStakes(problem: any): string {
    return `Without change, ${problem.impact} continues to compound.`;
  }
  
  private generatePromise(solution: any): string {
    return `With ${solution.approach}, achieve ${solution.outcome} systematically.`;
  }
  
  private extractProofPillars(proof: any): string[] {
    const pillars: string[] = [];
    
    if (proof.statistics.length > 0) {
      pillars.push(`${proof.statistics[0].value} improvement in efficiency`);
    }
    
    if (proof.cases.length > 0) {
      pillars.push(`${proof.cases[0].company} success story`);
    }
    
    if (proof.metrics.length > 0) {
      pillars.push(`${proof.metrics[0].improvement} measurable gain`);
    }
    
    return pillars.slice(0, 3); // Max 3 pillars
  }
  
  private generateNextStep(solution: any): string {
    return `Start with ${solution.mechanism} assessment.`;
  }
  
  private determineAudience(insights: any): 'exec' | 'technical' | 'general' {
    const level = insights.audienceLevel || insights.complexity;
    if (level === 'executive' || level === 'high-level') return 'exec';
    if (level === 'technical' || level === 'detailed') return 'technical';
    return 'general';
  }
}