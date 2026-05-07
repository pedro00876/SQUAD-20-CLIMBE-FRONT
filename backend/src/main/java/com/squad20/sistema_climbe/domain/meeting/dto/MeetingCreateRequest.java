package com.squad20.sistema_climbe.domain.meeting.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MeetingCreateRequest {

    @NotNull(message = "ID da empresa é obrigatório")
    private Long enterpriseId;

    @NotBlank(message = "Título da reunião é obrigatório")
    @Size(max = 255)
    private String title;

    private LocalDate date;

    private LocalTime time;

    private LocalTime endTime;

    private Boolean inPerson;

    @Size(max = 500)
    private String location;

    @Size(max = 2000)
    private String agenda;

    @Size(max = 50)
    private String status;

    private List<Long> participantIds;
}
