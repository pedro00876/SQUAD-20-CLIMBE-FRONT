package com.squad20.sistema_climbe.domain.service.mapper;

import com.squad20.sistema_climbe.domain.service.dto.ServiceDTO;
import com.squad20.sistema_climbe.domain.service.entity.OfferedService;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface OfferedServiceMapper {

    ServiceDTO toDTO(OfferedService entity);

    OfferedService toEntity(ServiceDTO dto);
}

