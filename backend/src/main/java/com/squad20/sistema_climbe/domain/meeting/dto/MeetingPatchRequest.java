package com.squad20.sistema_climbe.domain.meeting.dto;

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
public class MeetingPatchRequest {

    private Long enterpriseId;

    @Size(min = 1, max = 255, message = "O título deve ter entre 1 e 255 caracteres")
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
