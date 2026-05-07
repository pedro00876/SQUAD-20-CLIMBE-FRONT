package com.squad20.sistema_climbe.domain.user.entity;

import com.squad20.sistema_climbe.domain.common.entity.BaseEntity;
import com.squad20.sistema_climbe.domain.permission.entity.Permission;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.SQLRestriction;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Set;


@SQLRestriction("deleted_at IS NULL")
@Entity
@Table(name = "usuarios")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class User extends BaseEntity implements UserDetails {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_usuario")
    private Long id;

    @Column(name = "nome_completo", nullable = false, length = 255)
    private String fullName;

    // unique=true removido: substituído por partial index no banco (ver soft-delete-indexes.sql)
    @Column(nullable = false, length = 14)
    private String cpf;

    // unique=true removido: substituído por partial index no banco (ver soft-delete-indexes.sql)
    @Column(nullable = false, length = 255)
    private String email;

    @Column(name = "contato", length = 50)
    private String phone;

    @Column(name = "situacao", length = 255)
    private String status;

    @Column(name = "senha_hash", length = 60)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "cargo")
    private Role role;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "usuario_permissoes",
            joinColumns = @JoinColumn(name = "id_usuario"),
            inverseJoinColumns = @JoinColumn(name = "id_permissao")
    )
    private Set<Permission> permissions;

    @Column(name = "google_refresh_token", length = 1000)
    private String googleRefreshToken;

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        java.util.List<GrantedAuthority> authorities = new java.util.ArrayList<>();
        if (role != null) {
            authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_" + role.name()));
        }
        if (permissions != null) {
            permissions.forEach(p -> authorities.add(new org.springframework.security.core.authority.SimpleGrantedAuthority(p.getDescription())));
        }
        return authorities;
    }

    @Override
    public String getPassword() {
        return this.passwordHash;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return UserDetails.super.isAccountNonExpired();
    }

    @Override
    public boolean isAccountNonLocked() {
        return UserDetails.super.isAccountNonLocked();
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return UserDetails.super.isCredentialsNonExpired();
    }

    // Bloqueia autenticação JWT para usuários soft-deletados.
    // Spring Security chama isEnabled() antes de validar o token.
    @Override
    public boolean isEnabled() {
        return !isDeleted();
    }
}
