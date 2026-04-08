package com.squad20.sistema_climbe.domain.proposal.mapper;

import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.proposal.dto.ProposalDTO;
import com.squad20.sistema_climbe.domain.proposal.entity.Proposal;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingConstants;
import org.mapstruct.Named;

@Mapper(componentModel = MappingConstants.ComponentModel.SPRING)
public interface ProposalMapper {

    @Mapping(source = "enterprise.id", target = "enterpriseId")
    @Mapping(source = "enterprise", target = "enterpriseName", qualifiedByName = "enterpriseDisplayName")
    @Mapping(source = "user.id", target = "userId")
    @Mapping(source = "user.fullName", target = "userName")
    ProposalDTO toDTO(Proposal proposal);

    @Mapping(target = "enterprise", ignore = true)
    @Mapping(target = "user", ignore = true)
    Proposal toEntity(ProposalDTO dto);

    @Named("enterpriseDisplayName")
    default String enterpriseDisplayName(Enterprise e) {
        if (e == null) return null;
        return (e.getTradeName() != null && !e.getTradeName().isEmpty())
                ? e.getTradeName() : e.getLegalName();
    }
}

