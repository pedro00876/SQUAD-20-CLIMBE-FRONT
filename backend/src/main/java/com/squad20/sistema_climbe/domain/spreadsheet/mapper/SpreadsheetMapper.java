package com.squad20.sistema_climbe.domain.spreadsheet.mapper;

import com.squad20.sistema_climbe.domain.spreadsheet.dto.SpreadsheetCreateRequest;
import com.squad20.sistema_climbe.domain.spreadsheet.dto.SpreadsheetDTO;
import com.squad20.sistema_climbe.domain.spreadsheet.entity.Spreadsheet;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface SpreadsheetMapper {

    @Mapping(source = "contract.id", target = "contractId")
    SpreadsheetDTO toDTO(Spreadsheet spreadsheet);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    Spreadsheet toEntity(SpreadsheetCreateRequest request);
}

