package com.squad20.sistema_climbe.domain.cargo.mapper;

import com.squad20.sistema_climbe.domain.cargo.dto.CargoCreateRequest;
import com.squad20.sistema_climbe.domain.cargo.dto.CargoDTO;
import com.squad20.sistema_climbe.domain.cargo.entity.Cargo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface CargoMapper {

    CargoDTO toDTO(Cargo cargo);

    @Mapping(target = "id", ignore = true)
    Cargo toEntity(CargoCreateRequest request);
}
