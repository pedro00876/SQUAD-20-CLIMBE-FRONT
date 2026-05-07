package com.squad20.sistema_climbe.domain.enterprise.mapper;

import com.squad20.sistema_climbe.domain.enterprise.dto.AddressCreateRequest;
import com.squad20.sistema_climbe.domain.enterprise.dto.AddressDTO;
import com.squad20.sistema_climbe.domain.enterprise.entity.Address;
import org.mapstruct.Mapper;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface AddressMapper {

    AddressDTO toDTO(Address address);

    Address toEntity(AddressCreateRequest request);
}
