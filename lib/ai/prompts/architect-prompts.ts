export const architectPrompts = {
  generateSection: (sectionTitle: string, rfpRequirements: string, pastPerformance: string) => `
Generate a professional technical proposal section for: "${sectionTitle}"

RFP Requirements:
${rfpRequirements}

Relevant Past Performance:
${pastPerformance}

Write a comprehensive section that:
1. Directly addresses all RFP requirements
2. Incorporates relevant past performance examples
3. Uses professional government contracting language
4. Follows FAR/DFARS compliance standards
5. Is clear, concise, and compelling

Return only the section content, no markdown formatting.
`,

  generateExecutiveSummary: (proposalOverview: string, keyPoints: string[]) => `
Generate an executive summary for this proposal:

Overview: ${proposalOverview}
Key Points:
${keyPoints.map((p, i) => `${i + 1}. ${p}`).join('\n')}

Write a compelling executive summary (2-3 paragraphs) that highlights the value proposition and key differentiators.
`,
};

