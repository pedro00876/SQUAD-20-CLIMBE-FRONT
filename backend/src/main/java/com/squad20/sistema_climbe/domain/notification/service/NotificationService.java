package com.squad20.sistema_climbe.domain.notification.service;

import com.squad20.sistema_climbe.domain.notification.dto.NotificationCreateRequest;
import com.squad20.sistema_climbe.domain.notification.dto.NotificationDTO;
import com.squad20.sistema_climbe.domain.notification.dto.NotificationPatchRequest;
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
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final NotificationMapper notificationMapper;
    private final EmailSenderService emailSenderService;
    private final SimpMessagingTemplate messagingTemplate;

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
    public NotificationDTO save(NotificationCreateRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + request.getUserId()));

        Notification notification = notificationMapper.toEntity(request);
        notification.setId(null);
        notification.setUser(user);

        if (notification.getSentAt() == null) {
            notification.setSentAt(LocalDateTime.now());
        }

        notification = notificationRepository.save(notification);

        try {
            String subject = "Nova Notificação: Sistema Climbe";
            emailSenderService.sendEmail(user.getEmail(), subject, notification.getMessage());
        } catch (Exception e) {
            System.err.println("Erro ao enviar e-mail de notificação: " + e.getMessage());
        }

        NotificationDTO notificationDTO = notificationMapper.toDTO(notification);

        
        messagingTemplate.convertAndSendToUser(
                user.getEmail(),
                "/queue/notifications",
                notificationDTO
        );

        return notificationDTO;
    }

    @Transactional
    public NotificationDTO update(Long id, NotificationPatchRequest patch) {
        Notification existing = findNotificationOrThrow(id);

        if (patch.getMessage() != null) existing.setMessage(patch.getMessage());
        if (patch.getSentAt() != null) existing.setSentAt(patch.getSentAt());
        if (patch.getType() != null) existing.setType(patch.getType());

        if (patch.getUserId() != null) {
            User user = userRepository.findById(patch.getUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + patch.getUserId()));
            existing.setUser(user);
        }

        existing = notificationRepository.save(existing);
        return notificationMapper.toDTO(existing);
    }

    @Transactional
    public void delete(Long id) {
        Notification notification = findNotificationOrThrow(id);
        notification.setDeletedAt(LocalDateTime.now());
        notificationRepository.save(notification);
    }

    private Notification findNotificationOrThrow(Long id) {
        return notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notificação não encontrada com id: " + id));
    }
}

