/**
 * Scout AI - Lead Qualification Prompts
 * 
 * Purpose: Filter 100+ SAM.gov opportunities → 5-10 high-probability matches
 * Technique: Chain-of-Thought (CoT) reasoning with explicit scoring criteria
 * Model: DeepSeek-R1 or Gemini 2.0 Flash (fast, cheap)
 */

export interface ScoutAnalysisResult {
  matchScore: number;
  winProbability: number;
  effortEstimate: 'Low' | 'Medium' | 'High';
  keyRequirements: string[];
  technicalFocus: string;
  complianceNotes: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  reasoning: string;
  recommendation: 'PURSUE' | 'REVIEW' | 'REJECT';
}

export const scoutPrompts = {
  /**
   * Analyze a single opportunity with explicit scoring methodology.
   * Uses Chain-of-Thought reasoning to reduce false positives.
   */
  analyzeOpportunity: (opportunityData: string, companyCapabilities: string = '') => `
You are a federal contracting analyst evaluating opportunities for pursuit.

COMPANY CAPABILITIES:
${companyCapabilities || 'General government contracting firm with diverse technical capabilities.'}

OPPORTUNITY DATA:
${opportunityData}

EVALUATION METHODOLOGY:
Calculate scores using Chain-of-Thought reasoning. Show your work.

1. RELEVANCE SCORE (0-40 points):
   - NAICS code alignment: ___ / 15 points
   - Technical capability match: ___ / 15 points
   - Past performance relevance: ___ / 10 points
   
2. WIN PROBABILITY (0-30 points):
   - Set-aside type advantage: ___ / 10 points
   - Incumbent presence risk: ___ / 10 points
   - Competition analysis: ___ / 10 points
   
3. EFFORT VS. REWARD (0-30 points):
   - Contract value vs. proposal effort: ___ / 15 points
   - Proposal complexity: ___ / 15 points

SCORING GUIDE:
- 85-100: PURSUE - Strong strategic fit, recommend immediate action
- 70-84: REVIEW - Moderate fit, needs leadership review
- 0-69: REJECT - Poor fit or high risk, do not pursue

CRITICAL REJECTION CRITERIA (Auto-reject if ANY apply):
- Our NAICS codes completely absent
- Required past performance we lack
- Contract value < $100K (not worth effort)
- Deadline < 7 days and we're not tracking it
- Restricted competition (we're not eligible)

OUTPUT FORMAT (JSON):
{
  "matchScore": number (0-100, sum of all scores above),
  "winProbability": number (0-100, estimate based on factors),
  "effortEstimate": "Low" | "Medium" | "High",
  "keyRequirements": ["requirement 1", "requirement 2"],
  "technicalFocus": "brief description of main technical area",
  "complianceNotes": "FAR/DFARS/set-aside notes",
  "riskLevel": "Low" | "Medium" | "High",
  "reasoning": "your chain-of-thought analysis showing the math",
  "recommendation": "PURSUE" | "REVIEW" | "REJECT"
}

Think step-by-step. Show your scoring calculations in the reasoning field.
`,

  /**
   * Batch analysis: Find top matches from multiple opportunities.
   * Optimized for high-throughput screening.
   */
  findMatches: (searchCriteria: string, opportunities: string[], topN: number = 10) => `
You are screening ${opportunities.length} government contract opportunities.

SEARCH CRITERIA:
${searchCriteria}

OPPORTUNITIES:
${opportunities.map((opp, i) => `[${i + 1}] ${opp}`).join('\n\n')}

TASK:
1. Quickly score each opportunity (0-100)
2. Return ONLY the top ${topN} opportunities with scores ≥ 70
3. Sort by score (highest first)

SCORING CRITERIA:
- Keywords match: +20 points
- NAICS alignment: +20 points
- Agency history: +15 points
- Contract value in target range: +15 points
- Set-aside advantage: +15 points
- Low competition indicators: +15 points

OUTPUT (JSON array):
[
  {
    "opportunityId": "ID from [X]",
    "matchScore": number,
    "quickReason": "one-sentence justification"
  }
]

Return ONLY valid JSON. No markdown, no explanations outside JSON.
`,

  /**
   * Risk assessment for flagged opportunities.
   */
  assessRisk: (opportunityData: string) => `
Analyze this opportunity for RED FLAGS:

${opportunityData}

Check for:
❌ Incumbent with multi-year history (hard to unseat)
❌ Unrealistic timeline (submission in < 14 days)
❌ Vague requirements (high risk of scope creep)
❌ Payment terms unfavorable (long NET terms, withholds)
❌ Security clearance required (do we have cleared staff?)
❌ Unusual clauses or restrictions
❌ Agency with history of protests/cancellations

OUTPUT (JSON):
{
  "riskLevel": "Low" | "Medium" | "High",
  "redFlags": ["flag 1", "flag 2"],
  "mitigationSuggestions": ["suggestion 1"],
  "proceedWithCaution": boolean
}
`,
};
