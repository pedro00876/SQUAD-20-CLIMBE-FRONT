package com.squad20.sistema_climbe.domain.meeting.entity;

import com.squad20.sistema_climbe.domain.enterprise.entity.Enterprise;
import com.squad20.sistema_climbe.domain.user.entity.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.Set;

@Entity
@Table(name = "reunioes")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Meeting {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id_reuniao")
    private Long id;

    @Column(name = "titulo", nullable = false, length = 255)
    private String title;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "empresa_id", nullable = false)
    private Enterprise enterprise;

    @Column(name = "data")
    private LocalDate date;

    @Column(name = "hora")
    private LocalTime time;

    @Column(name = "presencial")
    private Boolean inPerson;

    @Column(name = "local", length = 500)
    private String location;

    @Column(name = "pauta", length = 2000)
    private String agenda;

    @Column(name = "status", length = 50)
    private String status;

    @ManyToMany(fetch = FetchType.LAZY)
    @JoinTable(
            name = "participantes_reuniao",
            joinColumns = @JoinColumn(name = "id_reuniao"),
            inverseJoinColumns = @JoinColumn(name = "id_usuario")
    )
    private Set<User> participants;
}

