package com.squad20.sistema_climbe.domain.contract.repository;

import com.squad20.sistema_climbe.domain.contract.entity.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ContractRepository extends JpaRepository<Contract, Long> {

    List<Contract> findByProposal_Id(Long proposalId);

    // Batch soft delete por proposta. @SQLRestriction não se aplica a UPDATE — a cláusula IS NULL é explícita aqui.
    // c.proposal.id usa FK direta (proposta_id), sem JOIN — geração SQL simples.
    @Modifying
    @Query("UPDATE Contract c SET c.deletedAt = :deletedAt WHERE c.proposal.id = :proposalId AND c.deletedAt IS NULL")
    void softDeleteByProposalId(@Param("proposalId") Long proposalId, @Param("deletedAt") LocalDateTime deletedAt);

    // Subquery para evitar UPDATE...FROM...JOIN (sintaxe PostgreSQL-específica que H2 não suporta).
    @Modifying
    @Query("UPDATE Contract c SET c.deletedAt = :deletedAt WHERE c.deletedAt IS NULL AND c.proposal.id IN (SELECT p.id FROM Proposal p WHERE p.enterprise.id = :enterpriseId AND p.deletedAt IS NULL)")
    void softDeleteByEnterpriseId(@Param("enterpriseId") Long enterpriseId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying
    @Query("UPDATE Contract c SET c.deletedAt = :deletedAt WHERE c.deletedAt IS NULL AND c.proposal.id IN (SELECT p.id FROM Proposal p WHERE p.user.id = :userId AND p.deletedAt IS NULL)")
    void softDeleteByUserId(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);
}
