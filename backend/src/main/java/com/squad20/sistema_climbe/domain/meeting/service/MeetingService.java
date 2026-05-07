package com.squad20.sistema_climbe.domain.meeting.service;

import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.enterprise.repository.EnterpriseRepository;
import com.squad20.sistema_climbe.domain.meeting.dto.MeetingCreateRequest;
import com.squad20.sistema_climbe.domain.meeting.dto.MeetingDTO;
import com.squad20.sistema_climbe.domain.meeting.dto.MeetingPatchRequest;
import com.squad20.sistema_climbe.domain.meeting.entity.Meeting;
import com.squad20.sistema_climbe.domain.meeting.mapper.MeetingMapper;
import com.squad20.sistema_climbe.domain.meeting.repository.MeetingRepository;
import com.squad20.sistema_climbe.domain.user.entity.User;
import com.squad20.sistema_climbe.domain.user.repository.UserRepository;
import com.squad20.sistema_climbe.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import com.squad20.sistema_climbe.service.GoogleCalendarService;

import java.time.LocalDateTime;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class MeetingService {

    private final MeetingRepository meetingRepository;
    private final EnterpriseRepository enterpriseRepository;
    private final UserRepository userRepository;
    private final MeetingMapper meetingMapper;
    private final GoogleCalendarService googleCalendarService;

    @Transactional(readOnly = true)
    public Page<MeetingDTO> findAll(Pageable pageable) {
        return meetingRepository.findAll(pageable).map(meetingMapper::toDTO);
    }

    @Transactional(readOnly = true)
    public List<MeetingDTO> findByEnterpriseId(Long enterpriseId) {
        return meetingRepository.findByEnterprise_Id(enterpriseId).stream()
                .map(meetingMapper::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public MeetingDTO findById(Long id) {
        Meeting meeting = findMeetingOrThrow(id);
        return meetingMapper.toDTO(meeting);
    }

    @Transactional
    public MeetingDTO save(MeetingCreateRequest request) {
        Enterprise enterprise = enterpriseRepository.findById(request.getEnterpriseId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada com id: " + request.getEnterpriseId()));

        Set<User> participants = resolveParticipants(request.getParticipantIds());
        validateNoTimeConflict(request.getDate(), request.getTime(), request.getEndTime(), request.getParticipantIds(), null);

        Meeting meeting = meetingMapper.toEntity(request);
        meeting.setId(null);
        meeting.setEnterprise(enterprise);
        meeting.setParticipants(participants != null ? participants : new HashSet<>());

        final Meeting savedMeeting = meetingRepository.save(meeting);

        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth != null && auth.getName() != null) {
                userRepository.findByEmail(auth.getName()).ifPresent(user -> {
                    if (user.getGoogleRefreshToken() != null) {
                        LocalDateTime start = LocalDateTime.of(savedMeeting.getDate(), savedMeeting.getTime());
                        LocalDateTime end = savedMeeting.getEndTime() != null 
                                ? LocalDateTime.of(savedMeeting.getDate(), savedMeeting.getEndTime()) 
                                : start.plusHours(1);
                        try {
                            googleCalendarService.createEvent(
                                user.getGoogleRefreshToken(),
                                savedMeeting.getTitle(),
                                savedMeeting.getAgenda() != null ? savedMeeting.getAgenda() : "Reunião gerada pelo Sistema Climbe",
                                start,
                                end
                            );
                        } catch (Exception e) {
                            System.err.println("Erro ao sincronizar com Google Calendar: " + e.getMessage());
                        }
                    }
                });
            }
        } catch (Exception ignored) { }

        return meetingMapper.toDTO(savedMeeting);
    }

    @Transactional
    public MeetingDTO update(Long id, MeetingPatchRequest patch) {
        Meeting existing = findMeetingOrThrow(id);

        if (patch.getTitle() != null) existing.setTitle(patch.getTitle());
        if (patch.getDate() != null) existing.setDate(patch.getDate());
        if (patch.getTime() != null) existing.setTime(patch.getTime());
        if (patch.getEndTime() != null) existing.setEndTime(patch.getEndTime());
        if (patch.getInPerson() != null) existing.setInPerson(patch.getInPerson());
        if (patch.getLocation() != null) existing.setLocation(patch.getLocation());
        if (patch.getAgenda() != null) existing.setAgenda(patch.getAgenda());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());

        if (patch.getEnterpriseId() != null) {
            Enterprise enterprise = enterpriseRepository.findById(patch.getEnterpriseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada com id: " + patch.getEnterpriseId()));
            existing.setEnterprise(enterprise);
        }

        if (patch.getParticipantIds() != null) {
            existing.setParticipants(resolveParticipants(patch.getParticipantIds()));
        }

        java.time.LocalDate checkDate = existing.getDate();
        java.time.LocalTime checkStart = existing.getTime();
        java.time.LocalTime checkEnd = existing.getEndTime();
        List<Long> participantIds = existing.getParticipants().stream().map(User::getId).toList();
        validateNoTimeConflict(checkDate, checkStart, checkEnd, participantIds, existing.getId());

        existing = meetingRepository.save(existing);
        return meetingMapper.toDTO(existing);
    }

    @Transactional
    public void delete(Long id) {
        Meeting meeting = findMeetingOrThrow(id);
        meeting.setDeletedAt(java.time.LocalDateTime.now());
        meetingRepository.save(meeting);
    }

    private Meeting findMeetingOrThrow(Long id) {
        return meetingRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reunião não encontrada com id: " + id));
    }

    private Set<User> resolveParticipants(List<Long> participantIds) {
        if (participantIds == null || participantIds.isEmpty()) {
            return new HashSet<>();
        }
        Set<User> users = new HashSet<>();
        for (Long userId : participantIds) {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ResourceNotFoundException("Usuário não encontrado com id: " + userId));
            users.add(user);
        }
        return users;
    }

    private void validateNoTimeConflict(java.time.LocalDate date, java.time.LocalTime startTime, java.time.LocalTime endTime, List<Long> participantIds, Long excludeMeetingId) {
        if (date == null || startTime == null || participantIds == null || participantIds.isEmpty()) return;
        
        java.time.LocalTime newStart = startTime;
        java.time.LocalTime newEnd = endTime != null ? endTime : startTime.plusHours(1);

        List<Meeting> dayMeetings = meetingRepository.findMeetingsByDateAndParticipants(date, participantIds);
        for (Meeting m : dayMeetings) {
            if (excludeMeetingId != null && m.getId().equals(excludeMeetingId)) continue;
            
            java.time.LocalTime existingStart = m.getTime();
            java.time.LocalTime existingEnd = m.getEndTime() != null ? m.getEndTime() : existingStart.plusHours(1);

            // A_start < B_end AND A_end > B_start => Overlap!
            if (newStart.isBefore(existingEnd) && newEnd.isAfter(existingStart)) {
                throw new com.squad20.sistema_climbe.exception.ConflictException(
                    "Conflito de agenda: Um ou mais participantes já possuem uma reunião marcada neste horário (" + 
                    existingStart + " - " + existingEnd + ")."
                );
            }
        }
    }
}

