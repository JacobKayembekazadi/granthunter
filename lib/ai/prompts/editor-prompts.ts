/**
 * Editor AI - Compliance Review & Polish Prompts
 * 
 * Purpose: Multi-pass review (Tone → Compliance → Formatting)
 * Technique: Structured checklist validation with FAR clause citations
 * Model: Claude 3.5 Sonnet (best for compliance, nuance, and editing)
 */

export const editorPrompts = {
  /**
   * Comprehensive compliance check with FAR/DFARS clause validation.
   * Returns detailed JSON report with specific issues and fixes.
   */
  complianceCheck: (sectionContent: string, rfpRequirements: string) => `
You are a federal contract compliance officer reviewing a proposal section.

SECTION TO REVIEW:
${sectionContent}

RFP REQUIREMENTS:
${rfpRequirements}

COMPLIANCE REVIEW CHECKLIST:

PASS 1: RFP REQUIREMENT COVERAGE
For each numbered requirement in RFP, verify:
✓ Is it addressed in the section?
✓ Is the response adequate (not just mentioned)?
✓ Is it clearly cross-referenced if required?

PASS 2: FAR/DFARS COMPLIANCE
Check for violations of:
- FAR Part 15 (Contracting by Negotiation)
- FAR 52.215-1 (Instructions to Offerors)
- Common FAR clauses (15.209 - No false statements)
- DFARS clauses if DoD contract

RED FLAGS:
❌ Unsubstantiated claims ("best in industry")
❌ False certifications
❌ Proprietary data improperly marked
❌ Discriminatory language
❌ Commitment to deliver beyond SOW
❌ Pricing information in technical volume (if separate)

PASS 3: PROFESSIONAL STANDARDS
- Clear, professional tone
- No grammatical errors
- Consistent terminology
- Proper acronym definitions
- Page limit compliance (if specified)

OUTPUT FORMAT (JSON):
{
  "complianceScore": number (0-100),
  "requirementCoverage": {
    "total": number,
    "addressed": number,
    "missing": ["req 1", "req 2"]
  },
  "farCompliance": {
    "isCompliant": boolean,
    "violations": [
      {
        "clause": "FAR 15.209",
        "issue": "description",
        "location": "paragraph 3",
        "severity": "High" | "Medium" | "Low"
      }
    ]
  },
  "qualityIssues": [
    {
      "type": "grammar" | "clarity" | "consistency" | "tone",
      "issue": "description",
      "location": "paragraph X",
      "suggestion": "how to fix"
    }
  ],
  "overallAssessment": "Clear summary in 2-3 sentences",
  "isCompliant": boolean,
  "recommendations": ["high-priority fix 1", "fix 2"]
}

Return ONLY valid JSON. Be thorough but concise.
`,

  /**
   * Polish content based on feedback - lighter touch than compliance check.
   * Maintains voice while improving clarity and professionalism.
   */
  polishContent: (content: string, feedback: string[]) => `
You are an expert proposal editor polishing this content.

ORIGINAL CONTENT:
${content}

FEEDBACK TO ADDRESS:
${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}

POLISHING GUIDELINES:

1. MAINTAIN:
   - Original structure and flow
   - Technical accuracy
   - Compliant content
   - Author's voice

2. IMPROVE:
   - Clarity: Remove ambiguity
   - Conciseness: Cut fluff
   - Impact: Stronger verbs, active voice
   - Flow: Better transitions
   - Consistency: Terminology, formatting

3. SPECIFIC EDITS:
   - Address each feedback item
   - Fix grammar/punctuation
   - Improve word choice
   - Tighten sentences (aim for 15-20 words avg)

4. DO NOT:
   - Change technical content without cause
   - Remove requirement coverage
   - Add marketing language
   - Alter compliance statements

OUTPUT:
Return the polished version of the content. NO explanations, just the improved text.
`,

  /**
   * Tone adjustment for different audiences (technical vs. executive).
   */
  adjustTone: (
    content: string,
    currentTone: 'technical' | 'executive' | 'general',
    targetTone: 'technical' | 'executive' | 'general'
  ) => `
Adjust the tone of this content from ${currentTone} to ${targetTone}.

CONTENT:
${content}

TONE GUIDELINES:

TECHNICAL:
- Detailed, precise language
- Industry-specific terminology
- Methodology focus
- Data-driven

EXECUTIVE:
- High-level, strategic
- ROI and mission impact focus
- Less jargon, more outcomes
- Concise (executives are busy)

GENERAL:
- Balanced detail level
- Defined acronyms
- Clear structure
- Accessible to non-experts

OUTPUT:
Return the tone-adjusted version. Preserve all factual content.
`,

  /**
   * Final pre-submission quality check - the "red team" review.
   */
  finalReview: (proposalSummary: string, sectionList: string[]) => `
You are the RED TEAM conducting final pre-submission review.

PROPOSAL SUMMARY:
${proposalSummary}

PROPOSAL SECTIONS:
${sectionList.map((s, i) => `${i + 1}. ${s}`).join('\n')}

FINAL REVIEW CHECKLIST:

1. SHOW-STOPPERS (These will get us kicked out):
   ❌ Missing required sections
   ❌ Over page limit
   ❌ Late submission
   ❌ Unsigned certifications
   ❌ Missing pricing (if required)

2. COMPETITIVE WEAKNESSES:
   ⚠ Generic content (sounds like every proposal)
   ⚠ No differentiators
   ⚠ Weak past performance examples
   ⚠ Unclear value proposition
   ⚠ Missing agency hot buttons

3. QUALITY ISSUES:
   - Inconsistent executive summary vs. technical approach
   - Acronyms not defined
   - Poor formatting
   - Typos in key sections

4. STRATEGIC CONCERNS:
   - Does this proposal WIN or just comply?
   - Is our solution clear and compelling?
   - Have we addressed agency pain points?
   - Is risk mitigation strong?

OUTPUT (JSON):
{
  "readyToSubmit": boolean,
  "showStoppers": ["issue 1"],
  "competitiveWeaknesses": ["weakness 1"],
  "qualityIssues": ["issue 1"],
  "strategicRecommendations": ["recommendation 1"],
  "overallRating": "Strong Win" | "Competitive" | "Weak" | "No-Go",
  "winProbability": number (0-100),
  "finalNotes": "2-3 sentence summary for leadership"
}

Be brutally honest. Better to fix now than lose.
`,

  /**
   * Generate revision notes for proposal manager.
   */
  generateRevisionNotes: (originalSection: string, revisedSection: string) => `
Generate revision notes showing what changed between these versions.

ORIGINAL:
${originalSection}

REVISED:
${revisedSection}

OUTPUT (Markdown list):
- **Added**: [what was added and why]
- **Removed**: [what was removed and why]
- **Modified**: [what changed and why]
- **Compliance Impact**: [did this improve requirement coverage?]
- **Recommendation**: [approve or request further changes]

Be specific with locations (paragraph numbers, sections).
`,
};
