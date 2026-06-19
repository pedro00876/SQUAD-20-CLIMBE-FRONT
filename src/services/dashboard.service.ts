import { api } from './api';

export interface DashboardStats {
  totalProposals: number;
  totalContracts: number;
  totalEnterprises: number;
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const [proposals, contracts, enterprises] = await Promise.all([
      api.get('/api/proposals', { params: { page: 0, size: 1 } }),
      api.get('/api/contracts', { params: { page: 0, size: 1 } }),
      api.get('/api/enterprises', { params: { page: 0, size: 1 } }),
    ]);
    return {
      totalProposals: proposals.data.totalElements ?? 0,
      totalContracts: contracts.data.totalElements ?? 0,
      totalEnterprises: enterprises.data.totalElements ?? 0,
    };
  },
};
