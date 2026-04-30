package com.squad20.sistema_climbe.domain.report.mapper;

import com.squad20.sistema_climbe.domain.report.dto.ReportCreateRequest;
import com.squad20.sistema_climbe.domain.report.dto.ReportDTO;
import com.squad20.sistema_climbe.domain.report.entity.Report;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ReportMapper {

    @Mapping(source = "contract.id", target = "contractId")
    ReportDTO toDTO(Report report);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "contract", ignore = true)
    Report toEntity(ReportCreateRequest request);
}
