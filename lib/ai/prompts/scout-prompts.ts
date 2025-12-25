export const scoutPrompts = {
  analyzeOpportunity: (opportunityData: string) => `
Analyze this government contracting opportunity and extract key information:

${opportunityData}

Return a JSON object with:
- matchScore: number (0-100)
- keyRequirements: string[]
- technicalFocus: string
- complianceNotes: string
- riskLevel: "Low" | "Medium" | "High"
`,

  findMatches: (searchCriteria: string, opportunities: string[]) => `
Find opportunities matching these criteria: ${searchCriteria}

Opportunities to analyze:
${opportunities.map((opp, i) => `${i + 1}. ${opp}`).join('\n')}

Return a JSON array of opportunity IDs with match scores above 70.
`,
};

