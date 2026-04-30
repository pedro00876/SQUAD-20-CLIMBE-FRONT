package com.squad20.sistema_climbe.domain.enterprise.mapper;

import com.squad20.sistema_climbe.domain.enterprise.dto.EnterpriseCreateRequest;
import com.squad20.sistema_climbe.domain.enterprise.dto.EnterpriseDTO;
import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING, uses = AddressMapper.class)
public interface EnterpriseMapper {

    EnterpriseDTO toDTO(Enterprise enterprise);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "services", ignore = true)
    Enterprise toEntity(EnterpriseCreateRequest request);
}
