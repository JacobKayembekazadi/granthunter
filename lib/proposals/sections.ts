export interface ProposalSectionTemplate {
  number: string;
  title: string;
  description: string;
  required: boolean;
  order: number;
}

export const STANDARD_PROPOSAL_SECTIONS: ProposalSectionTemplate[] = [
  {
    number: '1',
    title: 'Executive Summary',
    description: 'Overview of the proposal and value proposition',
    required: true,
    order: 1,
  },
  {
    number: '2',
    title: 'Technical Approach',
    description: 'Detailed technical solution and methodology',
    required: true,
    order: 2,
  },
  {
    number: '3',
    title: 'Management Approach',
    description: 'Project management and organizational structure',
    required: true,
    order: 3,
  },
  {
    number: '4',
    title: 'Past Performance',
    description: 'Relevant past performance examples',
    required: true,
    order: 4,
  },
  {
    number: '5',
    title: 'Staffing Plan',
    description: 'Key personnel and staffing approach',
    required: false,
    order: 5,
  },
  {
    number: '6',
    title: 'Quality Assurance',
    description: 'Quality control and assurance processes',
    required: false,
    order: 6,
  },
];

export function getSectionTemplates(rfpContent?: string): ProposalSectionTemplate[] {
  // In a real implementation, you'd parse the RFP to determine required sections
  // For now, return standard sections
  return STANDARD_PROPOSAL_SECTIONS;
}

