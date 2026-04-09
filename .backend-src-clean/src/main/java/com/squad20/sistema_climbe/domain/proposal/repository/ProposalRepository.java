package com.squad20.sistema_climbe.domain.proposal.repository;

import com.squad20.sistema_climbe.domain.proposal.entity.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    List<Proposal> findByEnterprise_Id(Long enterpriseId);

    List<Proposal> findByUser_Id(Long userId);
}
