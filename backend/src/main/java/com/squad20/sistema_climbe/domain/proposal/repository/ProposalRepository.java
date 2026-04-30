package com.squad20.sistema_climbe.domain.proposal.repository;

import com.squad20.sistema_climbe.domain.proposal.entity.Proposal;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ProposalRepository extends JpaRepository<Proposal, Long> {

    List<Proposal> findByEnterprise_Id(Long enterpriseId);

    List<Proposal> findByUser_Id(Long userId);

    // Batch soft delete por empresa. @SQLRestriction não se aplica a UPDATE — a cláusula IS NULL é explícita aqui.
    @Modifying
    @Query("UPDATE Proposal p SET p.deletedAt = :deletedAt WHERE p.enterprise.id = :enterpriseId AND p.deletedAt IS NULL")
    void softDeleteByEnterpriseId(@Param("enterpriseId") Long enterpriseId, @Param("deletedAt") LocalDateTime deletedAt);

    @Modifying
    @Query("UPDATE Proposal p SET p.deletedAt = :deletedAt WHERE p.user.id = :userId AND p.deletedAt IS NULL")
    void softDeleteByUserId(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);
}
