package com.squad20.sistema_climbe.domain.dashboard.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.Map;

@Data
@Builder
public class DashboardStatsDTO {
    private long totalProposals;
    private long totalContracts;
    private long totalClients;
    private String totalRevenue; // Formatted as R$ 45k etc
    
    private List<Map<String, Object>> proposalStatusDistribution;
    private List<Map<String, Object>> recentActivities;
    private List<Map<String, Object>> monthlyRevenue;
}
