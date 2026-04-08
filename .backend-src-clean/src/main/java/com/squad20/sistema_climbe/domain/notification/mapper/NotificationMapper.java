package com.squad20.sistema_climbe.domain.notification.mapper;

import com.squad20.sistema_climbe.domain.notification.dto.NotificationDTO;
import com.squad20.sistema_climbe.domain.notification.entity.Notification;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface NotificationMapper {

    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "userName")
    NotificationDTO toDTO(Notification notification);

    @Mapping(target = "user", ignore = true)
    Notification toEntity(NotificationDTO dto);
}

