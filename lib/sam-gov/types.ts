export interface SAMGovOpportunity {
  noticeId: string;
  title: string;
  agency: string;
  postedDate: string;
  responseDate: string;
  naicsCode?: string;
  description: string;
  value?: string;
  pointOfContact?: {
    name: string;
    email: string;
    phone: string;
  };
  links?: {
    opportunityUrl: string;
    attachments?: string[];
  };
}

export interface SAMGovSearchParams {
  naicsCodes?: string[];
  keywords?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  limit?: number;
  offset?: number;
}

export interface SAMGovSearchResponse {
  opportunities: SAMGovOpportunity[];
  total: number;
  hasMore: boolean;
}

