export const editorPrompts = {
  complianceCheck: (sectionContent: string, rfpRequirements: string) => `
Review this proposal section for FAR/DFARS compliance and RFP requirement coverage:

Section Content:
${sectionContent}

RFP Requirements:
${rfpRequirements}

Check for:
1. FAR compliance (Federal Acquisition Regulation)
2. DFARS compliance (Defense Federal Acquisition Regulation Supplement)
3. All RFP requirements addressed
4. Professional tone and clarity
5. Technical accuracy

Return a JSON object with:
- complianceScore: number (0-100)
- issues: string[]
- suggestions: string[]
- isCompliant: boolean
`,

  polishContent: (content: string, feedback: string[]) => `
Polish and improve this proposal content:

Content:
${content}

Feedback to address:
${feedback.map((f, i) => `${i + 1}. ${f}`).join('\n')}

Return the improved, polished version of the content.
`,
};

