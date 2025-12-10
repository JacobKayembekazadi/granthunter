export enum Verdict {
  FOCUS = 'FOCUS',
  TRASH = 'TRASH',
}

export interface AuditItem {
  opportunityName: string;
  verdict: Verdict;
  reason: string;
  aiPitch?: string;
}

export interface AuditResponse {
  items: AuditItem[];
}
