import { SAMGovOpportunity, SAMGovSearchParams, SAMGovSearchResponse } from './types';
import { rateLimit } from '@/lib/redis';

const SAM_GOV_API_BASE = 'https://api.sam.gov/opportunities/v2/search';

export class SAMGovClient {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.SAM_GOV_API_KEY || '';
  }

  async searchOpportunities(params: SAMGovSearchParams): Promise<SAMGovSearchResponse> {
    // Check rate limit (SAM.gov has strict limits)
    const rateLimitResult = await rateLimit('sam_gov_api', 10, 60); // 10 requests per minute
    if (!rateLimitResult.allowed) {
      throw new Error('SAM.gov API rate limit exceeded. Please wait before trying again.');
    }

    const queryParams = new URLSearchParams();
    
    if (params.naicsCodes && params.naicsCodes.length > 0) {
      queryParams.append('naics', params.naicsCodes.join(','));
    }
    
    if (params.keywords && params.keywords.length > 0) {
      queryParams.append('keyword', params.keywords.join(' '));
    }
    
    if (params.dateRange) {
      queryParams.append('postedFrom', params.dateRange.start);
      queryParams.append('postedTo', params.dateRange.end);
    }
    
    queryParams.append('limit', String(params.limit || 100));
    queryParams.append('offset', String(params.offset || 0));

    const url = `${SAM_GOV_API_BASE}?${queryParams.toString()}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Accept': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        },
      });

      if (!response.ok) {
        throw new Error(`SAM.gov API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform SAM.gov response to our format
      const opportunities: SAMGovOpportunity[] = (data.opportunitiesData || []).map((opp: any) => ({
        noticeId: opp.noticeId || opp.notice_id,
        title: opp.title || opp.subject,
        agency: opp.organizationType || opp.agency,
        postedDate: opp.postedDate || opp.posted_date,
        responseDate: opp.responseDate || opp.response_date,
        naicsCode: opp.naicsCode || opp.naics_code,
        description: opp.description || opp.synopsis,
        value: opp.awardAmount || opp.estimatedValue,
        pointOfContact: opp.pointOfContact ? {
          name: opp.pointOfContact.name || '',
          email: opp.pointOfContact.email || '',
          phone: opp.pointOfContact.phone || '',
        } : undefined,
        links: {
          opportunityUrl: opp.opportunityUrl || opp.url,
          attachments: opp.attachments || [],
        },
      }));

      return {
        opportunities,
        total: data.totalRecords || opportunities.length,
        hasMore: (params.offset || 0) + opportunities.length < (data.totalRecords || 0),
      };
    } catch (error) {
      console.error('SAM.gov API error:', error);
      throw error;
    }
  }

  async getOpportunityDetails(noticeId: string): Promise<SAMGovOpportunity | null> {
    const rateLimitResult = await rateLimit('sam_gov_api', 10, 60);
    if (!rateLimitResult.allowed) {
      throw new Error('SAM.gov API rate limit exceeded.');
    }

    try {
      const response = await fetch(`${SAM_GOV_API_BASE}/${noticeId}`, {
        headers: {
          'Accept': 'application/json',
          ...(this.apiKey && { 'X-API-Key': this.apiKey }),
        },
      });

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      return {
        noticeId: data.noticeId || data.notice_id,
        title: data.title || data.subject,
        agency: data.organizationType || data.agency,
        postedDate: data.postedDate || data.posted_date,
        responseDate: data.responseDate || data.response_date,
        naicsCode: data.naicsCode || data.naics_code,
        description: data.description || data.synopsis,
        value: data.awardAmount || data.estimatedValue,
        pointOfContact: data.pointOfContact ? {
          name: data.pointOfContact.name || '',
          email: data.pointOfContact.email || '',
          phone: data.pointOfContact.phone || '',
        } : undefined,
        links: {
          opportunityUrl: data.opportunityUrl || data.url,
          attachments: data.attachments || [],
        },
      };
    } catch (error) {
      console.error('Error fetching opportunity details:', error);
      return null;
    }
  }
}

export const samGovClient = new SAMGovClient();

