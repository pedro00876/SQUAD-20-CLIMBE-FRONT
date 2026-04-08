package com.squad20.sistema_climbe.domain.notification.service;

import com.squad20.sistema_climbe.domain.notification.dto.NotificationDTO;
import com.squad20.sistema_climbe.domain.notification.entity.Notification;
import com.squad20.sistema_climbe.domain.notification.mapper.NotificationMapper;
import com.squad20.sistema_climbe.domain.notification.repository.NotificationRepository;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;

    @Transactional(readOnly = true)
    public Page<NotificationDTO> findAll(Pageable pageable) {
        return notificationRepository.findAll(pageable).map(notificationMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<NotificationDTO> findByUserId(Long userId) {
        return notificationRepository.findByUser_Id(userId).stream()
                .map(notificationMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public NotificationDTO findById(Long id) {
        Notification notification = findNotificationOrThrow(id);
        return notificationMapper.toDTO(notification);
    }

    @Transactional
    public NotificationDTO save(NotificationDTO dto) {
        User user = userRepository.findById(dto.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + dto.getUserId()));

        Notification notification = notificationMapper.toEntity(dto);
        notification.setUser(user);

        if (notification.getSentAt() == null) {
            notification.setSentAt(LocalDateTime.now());
        }

        notification = notificationRepository.save(notification);
        return notificationMapper.toDTO(notification);
    }

    @Transactional
    public NotificationDTO update(Long id, NotificationDTO dto) {
        Notification existing = findNotificationOrThrow(id);

        if (dto.getMessage() != null) existing.setMessage(dto.getMessage());
        if (dto.getSentAt() != null) existing.setSentAt(dto.getSentAt());
        if (dto.getType() != null) existing.setType(dto.getType());

        if (dto.getUserId() != null) {
            User user = userRepository.findById(dto.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + dto.getUserId()));
            existing.setUser(user);
        }

        existing = notificationRepository.save(existing);
        return notificationMapper.toDTO(existing);
    }

    @Transactional
    public void delete(Long id) {
        Notification notification = findNotificationOrThrow(id);
        notificationRepository.delete(notification);
    }

    private Notification findNotificationOrThrow(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada com id: " + id));
    }
}

