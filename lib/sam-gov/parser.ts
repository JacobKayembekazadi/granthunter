import { SAMGovOpportunity } from './types';
import { generateWithModel } from '@/lib/ai/orchestrator';
import { scoutPrompts } from '@/lib/ai/prompts/scout-prompts';

export interface ParsedOpportunity {
  opportunity: SAMGovOpportunity;
  matchScore: number;
  keyRequirements: string[];
  technicalFocus: string;
  complianceNotes: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export async function parseOpportunity(opportunity: SAMGovOpportunity): Promise<ParsedOpportunity> {
  const opportunityData = `
Title: ${opportunity.title}
Agency: ${opportunity.agency}
Description: ${opportunity.description}
NAICS: ${opportunity.naicsCode || 'N/A'}
Value: ${opportunity.value || 'N/A'}
Due Date: ${opportunity.responseDate}
  `.trim();

  // Use AI to analyze the opportunity
  const analysis = await generateWithModel({
    role: 'scout',
    prompt: scoutPrompts.analyzeOpportunity(opportunityData),
  });

  // Parse the JSON response
  let parsedAnalysis;
  try {
    parsedAnalysis = JSON.parse(analysis);
  } catch (error) {
    // Fallback if JSON parsing fails
    parsedAnalysis = {
      matchScore: 75,
      keyRequirements: [],
      technicalFocus: opportunity.description.slice(0, 200),
      complianceNotes: 'Analysis pending',
      riskLevel: 'Medium' as const,
    };
  }

  return {
    opportunity,
    matchScore: parsedAnalysis.matchScore || 75,
    keyRequirements: parsedAnalysis.keyRequirements || [],
    technicalFocus: parsedAnalysis.technicalFocus || opportunity.description.slice(0, 200),
    complianceNotes: parsedAnalysis.complianceNotes || '',
    riskLevel: parsedAnalysis.riskLevel || 'Medium',
  };
}

export async function downloadRFPDocument(url: string): Promise<string> {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to download RFP: ${response.statusText}`);
    }
    
    // For PDF/text documents, return as text
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('text') || contentType.includes('pdf')) {
      return await response.text();
    }
    
    // For binary documents, we'd need to handle differently
    const buffer = await response.arrayBuffer();
    return Buffer.from(buffer).toString('base64');
  } catch (error) {
    console.error('Error downloading RFP document:', error);
    throw error;
  }
}

