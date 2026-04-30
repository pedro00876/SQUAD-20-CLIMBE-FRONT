package com.squad20.sistema_climbe.service;

import com.google.api.client.util.DateTime;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.calendar.model.Event;
import com.google.api.services.calendar.model.EventDateTime;
import com.google.api.services.calendar.model.Events;
import com.squad20.sistema_climbe.config.GoogleApiConfig;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.List;

@Service
@RequiredArgsConstructor
public class GoogleCalendarService {

    private final GoogleApiConfig googleApiConfig;

    public List<Event> listUpcomingEvents(String accessTokenStr) throws GeneralSecurityException, IOException {
        Calendar service = googleApiConfig.getCalendarService(accessTokenStr);
        DateTime now = new DateTime(System.currentTimeMillis());
        Events events = service.events().list("primary")
                .setMaxResults(10)
                .setTimeMin(now)
                .setOrderBy("startTime")
                .setSingleEvents(true)
                .execute();
        return events.getItems();
    }

    public Event createEvent(String refreshTokenStr, String summary, String description, LocalDateTime start, LocalDateTime end) throws GeneralSecurityException, IOException {
        Calendar service = googleApiConfig.getCalendarServiceFromRefreshToken(refreshTokenStr);

        Event event = new Event()
                .setSummary(summary)
                .setDescription(description);

        DateTime startDateTime = new DateTime(Date.from(start.atZone(ZoneId.systemDefault()).toInstant()));
        EventDateTime startEventDateTime = new EventDateTime().setDateTime(startDateTime).setTimeZone(ZoneId.systemDefault().getId());
        event.setStart(startEventDateTime);

        DateTime endDateTime = new DateTime(Date.from(end.atZone(ZoneId.systemDefault()).toInstant()));
        EventDateTime endEventDateTime = new EventDateTime().setDateTime(endDateTime).setTimeZone(ZoneId.systemDefault().getId());
        event.setEnd(endEventDateTime);

        return service.events().insert("primary", event).execute();
    }
}
