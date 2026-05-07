package com.squad20.sistema_climbe.domain.dashboard.service;

import com.squad20.sistema_climbe.domain.dashboard.dto.DashboardStatsDTO;
import com.squad20.sistema_climbe.domain.enterprise.repository.EnterpriseRepository;
import com.squad20.sistema_climbe.domain.proposal.repository.ProposalRepository;
import com.squad20.sistema_climbe.domain.contract.repository.ContractRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final EnterpriseRepository enterpriseRepository;
    private final ProposalRepository proposalRepository;
    private final ContractRepository contractRepository;

    public DashboardStatsDTO getStats() {
        long proposals = proposalRepository.count();
        long contracts = contractRepository.count();
        long enterprises = enterpriseRepository.count();

        // Status distribution
        List<Map<String, Object>> statusDist = new ArrayList<>();
        statusDist.add(Map.of("name", "Aprovadas", "value", proposalRepository.countByStatus("COMMERCIAL_PROPOSAL_APPROVED")));
        statusDist.add(Map.of("name", "Pendentes", "value", proposalRepository.countByStatus("RECEIVED")));
        statusDist.add(Map.of("name", "Recusadas", "value", proposalRepository.countByStatus("COMMERCIAL_PROPOSAL_REJECTED")));

        // Real revenue from DB
        java.math.BigDecimal totalRev = contractRepository.sumTotalValue();
        if (totalRev == null) totalRev = java.math.BigDecimal.ZERO;
        String revenue = "R$ " + totalRev.divide(new java.math.BigDecimal("1000"), 0, java.math.RoundingMode.HALF_UP) + "k";

        // Real Recent activities (example: last 5 proposals)
        List<Map<String, Object>> activities = new ArrayList<>();
        proposalRepository.findAll(org.springframework.data.domain.PageRequest.of(0, 5, org.springframework.data.domain.Sort.by(org.springframework.data.domain.Sort.Direction.DESC, "createdAt")))
            .forEach(p -> {
                String color = "bg-gray-100";
                if ("COMMERCIAL_PROPOSAL_APPROVED".equals(p.getStatus())) color = "bg-climbe-primary";
                if ("COMMERCIAL_PROPOSAL_REJECTED".equals(p.getStatus())) color = "bg-red-100";
                
                activities.add(Map.of(
                    "name", "Proposta: " + p.getEnterprise().getTradeName(),
                    "time", "ID #" + p.getId(),
                    "status", p.getStatus(),
                    "color", color
                ));
            });

        return DashboardStatsDTO.builder()
                .totalProposals(proposals)
                .totalContracts(contracts)
                .totalClients(enterprises)
                .totalRevenue(revenue)
                .proposalStatusDistribution(statusDist)
                .recentActivities(activities)
                .build();
    }
}
