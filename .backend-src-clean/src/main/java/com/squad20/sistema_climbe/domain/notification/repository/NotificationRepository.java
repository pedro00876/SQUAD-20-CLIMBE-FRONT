package com.squad20.sistema_climbe.domain.notification.repository;

import com.squad20.sistema_climbe.domain.notification.entity.Notification;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUser_Id(Long userId);
}
