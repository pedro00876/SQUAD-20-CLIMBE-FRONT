package com.squad20.sistema_climbe.domain.common.entity;

import jakarta.persistence.Column;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@MappedSuperclass
@Getter
@Setter
public abstract class BaseEntity {

    // Preenchido automaticamente ao persistir; nunca atualizado
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    // NULL = ativo. Não-NULL = deletado. Definido pelo service ao deletar.
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }

    public boolean isDeleted() {
        return deletedAt != null;
    }
}
