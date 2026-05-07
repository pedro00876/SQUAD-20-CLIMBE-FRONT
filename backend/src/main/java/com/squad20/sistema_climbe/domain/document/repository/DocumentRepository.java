package com.squad20.sistema_climbe.domain.document.repository;

import com.squad20.sistema_climbe.domain.document.entity.Document;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface DocumentRepository extends JpaRepository<Document, Long> {

    List<Document> findByEnterprise_Id(Long enterpriseId);

    List<Document> findByProposal_Id(Long proposalId);

    List<Document> findByAnalyst_Id(Long analystId);

    // Batch soft delete por empresa. @SQLRestriction não se aplica a UPDATE — a cláusula IS NULL é explícita aqui.
    @Modifying
    @Query("UPDATE Document d SET d.deletedAt = :deletedAt WHERE d.enterprise.id = :enterpriseId AND d.deletedAt IS NULL")
    void softDeleteByEnterpriseId(@Param("enterpriseId") Long enterpriseId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying
    @Query("UPDATE Document d SET d.deletedAt = :deletedAt WHERE d.analyst.id = :userId AND d.deletedAt IS NULL")
    void softDeleteByAnalystId(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);
}
