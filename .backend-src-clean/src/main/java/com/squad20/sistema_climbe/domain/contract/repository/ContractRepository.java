package com.squad20.sistema_climbe.domain.contract.repository;

import com.squad20.sistema_climbe.domain.contract.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    List<Contract> findByProposal_Id(Long proposalId);
}

