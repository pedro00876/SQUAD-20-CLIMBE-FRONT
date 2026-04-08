package com.squad20.sistema_climbe.domain.meeting.service;

import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.enterprise.repository.EnterpriseRepository;
import com.squad20.sistema_climbe.domain.meeting.dto.MeetingDTO;
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
    public MeetingDTO save(MeetingDTO dto) {
        Enterprise enterprise = enterpriseRepository.findById(dto.getEnterpriseId())
                .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada com id: " + dto.getEnterpriseId()));

        Set<User> participants = resolveParticipants(dto.getParticipantIds());

        Meeting meeting = meetingMapper.toEntity(dto);
        meeting.setEnterprise(enterprise);
        meeting.setParticipants(participants != null ? participants : new HashSet<>());

        meeting = meetingRepository.save(meeting);
        return meetingMapper.toDTO(meeting);
    }

    @Transactional
    public MeetingDTO update(Long id, MeetingDTO dto) {
        Meeting existing = findMeetingOrThrow(id);

        if (dto.getTitle() != null) existing.setTitle(dto.getTitle());
        if (dto.getDate() != null) existing.setDate(dto.getDate());
        if (dto.getTime() != null) existing.setTime(dto.getTime());
        if (dto.getInPerson() != null) existing.setInPerson(dto.getInPerson());
        if (dto.getLocation() != null) existing.setLocation(dto.getLocation());
        if (dto.getAgenda() != null) existing.setAgenda(dto.getAgenda());
        if (dto.getStatus() != null) existing.setStatus(dto.getStatus());

        if (dto.getEnterpriseId() != null) {
            Enterprise enterprise = enterpriseRepository.findById(dto.getEnterpriseId())
                    .orElseThrow(() -> new ResourceNotFoundException("Empresa não encontrada com id: " + dto.getEnterpriseId()));
            existing.setEnterprise(enterprise);
        }

        if (dto.getParticipantIds() != null) {
            existing.setParticipants(resolveParticipants(dto.getParticipantIds()));
        }

        existing = meetingRepository.save(existing);
        return meetingMapper.toDTO(existing);
    }

    @Transactional
    public void delete(Long id) {
        Meeting meeting = findMeetingOrThrow(id);
        meetingRepository.delete(meeting);
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
}

