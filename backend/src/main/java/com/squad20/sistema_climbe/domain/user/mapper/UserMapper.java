package com.squad20.sistema_climbe.domain.user.mapper;

import com.squad20.sistema_climbe.domain.user.dto.UserCreateRequest;
import com.squad20.sistema_climbe.domain.user.dto.UserDTO;
import com.squad20.sistema_climbe.domain.user.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface UserMapper {

    UserDTO toDTO(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "passwordHash", ignore = true)
    @Mapping(target = "permissions", ignore = true)
    User toEntity(UserCreateRequest request);
}
