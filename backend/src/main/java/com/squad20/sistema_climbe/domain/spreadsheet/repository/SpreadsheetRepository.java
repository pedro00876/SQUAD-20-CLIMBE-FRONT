package com.squad20.sistema_climbe.domain.spreadsheet.repository;

import com.squad20.sistema_climbe.domain.spreadsheet.entity.Spreadsheet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface SpreadsheetRepository extends JpaRepository<Spreadsheet, Long> {

    List<Spreadsheet> findByContract_Id(Long contractId);

    // Batch soft delete por contrato. s.contract.id usa FK direta (contrato_id), sem JOIN.
    @Modifying
    @Query("UPDATE Spreadsheet s SET s.deletedAt = :deletedAt WHERE s.contract.id = :contractId AND s.deletedAt IS NULL")
    void softDeleteByContractId(@Param("contractId") Long contractId, @Param("deletedAt") LocalDateTime deletedAt);

    // Subqueries para evitar UPDATE...FROM...JOIN (sintaxe PostgreSQL-específica que H2 não suporta).
    @Modifying
    @Query("UPDATE Spreadsheet s SET s.deletedAt = :deletedAt WHERE s.deletedAt IS NULL AND s.contract.id IN (SELECT c.id FROM Contract c WHERE c.proposal.id = :proposalId AND c.deletedAt IS NULL)")
    void softDeleteByProposalId(@Param("proposalId") Long proposalId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying
    @Query("UPDATE Spreadsheet s SET s.deletedAt = :deletedAt WHERE s.deletedAt IS NULL AND s.contract.id IN (SELECT c.id FROM Contract c WHERE c.deletedAt IS NULL AND c.proposal.id IN (SELECT p.id FROM Proposal p WHERE p.enterprise.id = :enterpriseId AND p.deletedAt IS NULL))")
    void softDeleteByEnterpriseId(@Param("enterpriseId") Long enterpriseId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying
    @Query("UPDATE Spreadsheet s SET s.deletedAt = :deletedAt WHERE s.deletedAt IS NULL AND s.contract.id IN (SELECT c.id FROM Contract c WHERE c.deletedAt IS NULL AND c.proposal.id IN (SELECT p.id FROM Proposal p WHERE p.user.id = :userId AND p.deletedAt IS NULL))")
    void softDeleteByUserId(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);
}
