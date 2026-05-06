package com.squad20.sistema_climbe.domain.document.entity;

import com.squad20.sistema_climbe.domain.common.entity.BaseEntity;
import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.proposal.entity.Proposal;
import com.squad20.sistema_climbe.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;

// Filtro automático: Hibernate injeta "AND deleted_at IS NULL" em todas as queries desta entidade.
@SQLRestriction("deleted_at IS NULL")
@Entity
@Table(name = "documentos")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Document extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_documento")
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Enterprise enterprise;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "proposta_id")
    private Proposal proposal;

    @Column(name = "tipo_documento", length = 100)
    private String documentType;

    @Column(name = "url", length = 1000)
    private String url;

    @Column(name = "validado")
    private Boolean validated;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "analista_id")
    private User analyst;
}
