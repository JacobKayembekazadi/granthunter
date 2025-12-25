import { generateWithModel } from '@/lib/ai/orchestrator';
import { editorPrompts } from '@/lib/ai/prompts/editor-prompts';

export interface ComplianceRequirement {
  id: string;
  text: string;
  section?: string;
  category: 'FAR' | 'DFARS' | 'RFP' | 'Other';
}

export interface ComplianceCheckResult {
  requirement: ComplianceRequirement;
  addressed: boolean;
  location?: string; // Section where requirement is addressed
  confidence: number;
  notes?: string;
}

export async function extractRequirements(rfpContent: string): Promise<ComplianceRequirement[]> {
  // Use AI to extract requirements from RFP
  const prompt = `
Extract all compliance requirements from this RFP:

${rfpContent}

Return a JSON array of requirements with:
- id: unique identifier
- text: requirement text
- section: RFP section reference (if available)
- category: "FAR", "DFARS", "RFP", or "Other"
`;

  const response = await generateWithModel({
    role: 'scout',
    prompt,
    maxTokens: 4000,
  });

  try {
    const requirements = JSON.parse(response);
    return Array.isArray(requirements) ? requirements : [];
  } catch (error) {
    console.error('Error parsing requirements:', error);
    return [];
  }
}

export async function checkCompliance(
  proposalContent: string,
  requirements: ComplianceRequirement[]
): Promise<ComplianceCheckResult[]> {
  const results: ComplianceCheckResult[] = [];

  for (const requirement of requirements) {
    // Check if requirement is addressed
    const checkResult = await generateWithModel({
      role: 'editor',
      prompt: editorPrompts.complianceCheck(proposalContent, requirement.text),
      maxTokens: 500,
    });

    try {
      const parsed = JSON.parse(checkResult);
      results.push({
        requirement,
        addressed: parsed.isCompliant || false,
        location: parsed.location,
        confidence: parsed.complianceScore || 0,
        notes: parsed.suggestions?.join('; '),
      });
    } catch (error) {
      // Fallback to simple text matching
      const requirementLower = requirement.text.toLowerCase();
      const contentLower = proposalContent.toLowerCase();
      results.push({
        requirement,
        addressed: contentLower.includes(requirementLower),
        confidence: 50,
      });
    }
  }

  return results;
}

