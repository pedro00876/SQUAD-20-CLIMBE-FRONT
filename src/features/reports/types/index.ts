import type { Report } from '@/services/report.service';

export interface EnrichedReport extends Report {
  enterpriseId: number;
  enterpriseName: string;
  proposalId: number;
}

export interface ReportCompanyGroup {
  enterpriseId: number;
  enterpriseName: string;
  reports: EnrichedReport[];
}
