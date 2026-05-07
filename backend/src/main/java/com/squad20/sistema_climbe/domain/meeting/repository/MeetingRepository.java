package com.squad20.sistema_climbe.domain.meeting.repository;

import com.squad20.sistema_climbe.domain.meeting.entity.Meeting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface MeetingRepository extends JpaRepository<Meeting, Long> {

    List<Meeting> findByEnterprise_Id(Long enterpriseId);

    @Query("SELECT DISTINCT m FROM Meeting m JOIN m.participants p WHERE m.date = :date AND p.id IN :participantIds AND m.deletedAt IS NULL")
    List<Meeting> findMeetingsByDateAndParticipants(@Param("date") LocalDate date, @Param("participantIds") java.util.Collection<Long> participantIds);

    // Batch soft delete por empresa. @SQLRestriction não se aplica a UPDATE — a cláusula IS NULL é explícita aqui.
    @Modifying
    @Query("UPDATE Meeting m SET m.deletedAt = :deletedAt WHERE m.enterprise.id = :enterpriseId AND m.deletedAt IS NULL")
    void softDeleteByEnterpriseId(@Param("enterpriseId") Long enterpriseId, @Param("deletedAt") LocalDateTime deletedAt);
}
