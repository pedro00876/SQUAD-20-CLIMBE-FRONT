package com.squad20.sistema_climbe.domain.meeting.mapper;

import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.meeting.dto.MeetingDTO;
import com.squad20.sistema_climbe.domain.meeting.entity.Meeting;
import com.squad20.sistema_climbe.domain.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

import java.util.List;
import java.util.Set;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface MeetingMapper {

    @Mapping(source = "enterprise.id", target = "enterpriseId")
    @Mapping(source = "enterprise", target = "enterpriseName", qualifiedByName = "enterpriseDisplayName")
    @Mapping(source = "participants", target = "participantIds", qualifiedByName = "participantIds")
    MeetingDTO toDTO(Meeting meeting);

    @Mapping(target = "enterprise", ignore = true)
    @Mapping(target = "participants", ignore = true)
    Meeting toEntity(MeetingDTO dto);

    @Named("enterpriseDisplayName")
    default String enterpriseDisplayName(Enterprise e) {
        if (e == null) return null;
        return (e.getTradeName() != null && !e.getTradeName().isEmpty())
                ? e.getTradeName() : e.getLegalName();
    }

    @Named("participantIds")
    default List<Long> participantIds(Set<User> participants) {
        if (participants == null) return List.of();
        return participants.stream().map(User::getId).toList();
    }
}

