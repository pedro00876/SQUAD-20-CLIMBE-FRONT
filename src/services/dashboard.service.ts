import { api } from './api';

export interface DashboardStats {
  totalProposals: number;
  totalContracts: number;
  totalClients: number;
  totalRevenue: string;
  monthlyRevenue: { name: string; value: number; color?: string }[];
  proposalStatusDistribution: { name: string; value: number }[];
  recentActivities: { name: string; time: string; status: string; color: string }[];
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const response = await api.get<DashboardStats>('/api/dashboard/stats');
    return response.data;
  },
};
