package com.squad20.sistema_climbe.domain.notification.repository;

import com.squad20.sistema_climbe.domain.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_Id(Long userId);

    // Batch soft delete por usuário. @SQLRestriction não se aplica a UPDATE — a cláusula IS NULL é explícita aqui.
    @Modifying
    @Query("UPDATE Notification n SET n.deletedAt = :deletedAt WHERE n.user.id = :userId AND n.deletedAt IS NULL")
    void softDeleteByUserId(@Param("userId") Long userId, @Param("deletedAt") LocalDateTime deletedAt);
}
