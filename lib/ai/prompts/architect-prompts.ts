/**
 * Architect AI - Proposal Generation Prompts
 * 
 * Purpose: Generate FAR-compliant technical proposal sections
 * Technique: One-Shot Learning with "Gold Standard" examples from RAG
 * Model: Gemini 1.5 Pro / Gemini 2.0 Flash (balance of quality and cost)
 */

export const architectPrompts = {
  /**
   * Generate a technical proposal section using past performance as a template.
   * This is the core proposal generation prompt - heavily optimized.
   */
  generateSection: (
    sectionTitle: string,
    rfpRequirements: string,
    pastPerformance: string,
    companyProfile: string = ''
  ) => `
You are a senior proposal writer specializing in federal government technical proposals.

MISSION:
Write Section "${sectionTitle}" for a government contract proposal.

COMPANY PROFILE:
${companyProfile || 'A qualified government contractor with relevant experience.'}

RFP REQUIREMENTS (Section L - Instructions):
${rfpRequirements}

PAST PERFORMANCE EXAMPLES (Gold Standard):
${pastPerformance}

WRITING REQUIREMENTS:

1. COMPLIANCE (CRITICAL):
   ✓ Address EVERY numbered requirement from RFP
   ✓ Use requirement numbering if RFP specifies it
   ✓ Include all required elements (e.g., "must include project timeline")
   ✓ Follow FAR Part 15 best practices

2. STRUCTURE:
   - Start with brief overview paragraph
   - Create subsections for each major requirement
   - Use clear headings (e.g., "3.1.1 Technical Approach")
   - Include transition sentences between subsections

3. CONTENT GUIDELINES:
   - Mirror the TONE and STRUCTURE of the past performance examples
   - Adapt specific technical details to THIS opportunity
   - Be specific, not generic (cite tools, methodologies, team structure)
   - Use active voice ("We will implement..." not "Implementation will occur")
   - Quantify where possible (timelines, team size, deliverables)

4. COMPLIANCE MATRIX ALIGNMENT:
   For each requirement, include a subtle signal:
   "This approach addresses RFP requirement 3.2.1..." (if required by RFP)

5. AVOID:
   ❌ Marketing fluff ("We are the best...")
   ❌ Vague statements ("We have extensive experience...")
   ❌ Unexplained acronyms on first use
   ❌ Promises without methodology
   ❌ Copy-paste from past performance (adapt it!)

STYLE:
- Professional, confident, solution-oriented
- Government contracting language (use terms like "deliverables", "milestones", "SOW")
- Page target: 2-4 pages for major sections, 1-2 for minor sections

OUTPUT:
Write the complete section. NO markdown headers (###), just plain text with section numbers if needed.
Start with the section title, then the content.

BEGIN WRITING:
`,

  /**
   * Generate Executive Summary - the most critical 2 pages of any proposal.
   */
  generateExecutiveSummary: (
    opportunityTitle: string,
    proposalOverview: string,
    keyPoints: string[],
    companyDifferentiators: string[] = []
  ) => `
You are writing the Executive Summary for a government contract proposal.

OPPORTUNITY:
${opportunityTitle}

PROPOSAL OVERVIEW:
${proposalOverview}

KEY TECHNICAL POINTS:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

COMPANY DIFFERENTIATORS:
${companyDifferentiators.length > 0
      ? companyDifferentiators.map((d, i) => `${i + 1}. ${d}`).join('\n')
      : 'Qualified contractor with relevant experience'}

EXECUTIVE SUMMARY REQUIREMENTS:

1. LENGTH: Exactly 2-3 paragraphs (400-600 words)

2. STRUCTURE:
   Para 1: THE PROBLEM + OUR SOLUTION (What agency needs + our approach)
   Para 2: WHY US (Key differentiators, past performance, unique value)
   Para 3: THE OUTCOME (Benefits to agency, alignment with their mission)

3. TONE:
   - Confident but not arrogant
   - Solution-focused, not capability-bragging
   - Speak to agency's needs and mission
   - Use "we will" language (action-oriented)

4. CRITICAL ELEMENTS TO INCLUDE:
   ✓ Contract value understanding (if available)
   ✓ Timeline acknowledgment
   ✓ Key personnel mention (if known)
   ✓ Relevant past performance (specific contract)
   ✓ Risk mitigation approach
   ✓ Value proposition (cost + quality + speed)

5. AVOID:
   ❌ "We are pleased to submit..." (too generic)
   ❌ Company history lesson
   ❌ Rehashing entire technical approach
   ❌ Unsubstantiated claims

REMEMBER:
This is often the ONLY section executives read. Make it count.

Write the executive summary now:
`,

  /**
   * Generate Compliance Matrix - map every RFP requirement to proposal section.
   */
  generateComplianceMatrix: (rfpRequirements: string, proposalSections: string[]) => `
Create a compliance matrix matching RFP requirements to our proposal sections.

RFP REQUIREMENTS:
${rfpRequirements}

OUR PROPOSAL SECTIONS:
${proposalSections.map((s, i) => `${i + 1}. ${s}`).join('\n')}

OUTPUT (Markdown table):

| RFP Req # | Requirement | Proposal Section | Page # | Compliance |
|-----------|-------------|------------------|--------|------------|
| L.3.1     | [text]      | Section 3.1.2    | TBD    | ✓ Full     |

Use these compliance levels:
- ✓ Full: Completely addressed
- ⚠ Partial: Partially addressed, may need expansion
- ❌ Not Addressed: Missing, needs attention

Generate the complete matrix now:
`,

  /**
   * Improve existing section based on reviewer feedback.
   */
  improveSectionWithFeedback: (
    sectionContent: string,
    feedback: string[],
    rfpRequirements: string
  ) => `
TASK: Improve this proposal section based on reviewer feedback.

CURRENT SECTION:
${sectionContent}

RFP REQUIREMENTS (for context):
${rfpRequirements}

REVIEWER FEEDBACK:
${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}

IMPROVEMENT INSTRUCTIONS:
1. Address each feedback item specifically
2. Maintain the original structure and flow
3. Do NOT lose compliant content
4. Track changes in your mind (what did you add/remove/modify)

OUTPUT:
Provide the improved section, followed by a brief summary of changes made.

IMPROVED SECTION:
[your improved text]

CHANGES MADE:
- [bullet list of key changes]
`,
};
