package com.squad20.sistema_climbe.domain.document.mapper;

import com.squad20.sistema_climbe.domain.document.dto.DocumentCreateRequest;
import com.squad20.sistema_climbe.domain.document.dto.DocumentDTO;
import com.squad20.sistema_climbe.domain.document.entity.Document;
import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface DocumentMapper {

    @Mapping(source = "enterprise.id", target = "enterpriseId")
    @Mapping(source = "enterprise", target = "enterpriseName", qualifiedByName = "enterpriseDisplayName")
    @Mapping(source = "proposal.id", target = "proposalId")
    @Mapping(source = "analyst.id", target = "analystId")
    @Mapping(source = "analyst.fullName", target = "analystName")
    DocumentDTO toDTO(Document document);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "enterprise", ignore = true)
    @Mapping(target = "proposal", ignore = true)
    @Mapping(target = "analyst", ignore = true)
    Document toEntity(DocumentCreateRequest request);

    @Named("enterpriseDisplayName")
    default String enterpriseDisplayName(Enterprise e) {
        if (e == null) return null;
        return (e.getTradeName() != null && !e.getTradeName().isEmpty())
                ? e.getTradeName() : e.getLegalName();
    }
}

