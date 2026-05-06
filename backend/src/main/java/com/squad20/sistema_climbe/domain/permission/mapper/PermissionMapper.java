package com.squad20.sistema_climbe.domain.permission.mapper;

import com.squad20.sistema_climbe.domain.permission.dto.PermissionCreateRequest;
import com.squad20.sistema_climbe.domain.permission.dto.PermissionDTO;
import com.squad20.sistema_climbe.domain.permission.entity.Permission;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface PermissionMapper {

    PermissionDTO toDTO(Permission permission);

    @Mapping(target = "id", ignore = true)
    Permission toEntity(PermissionCreateRequest request);
}

