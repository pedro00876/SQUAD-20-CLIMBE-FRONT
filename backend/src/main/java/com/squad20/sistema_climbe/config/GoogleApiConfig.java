package com.squad20.sistema_climbe.config;

import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.http.HttpRequestInitializer;
import com.google.api.client.http.HttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
import com.google.api.services.calendar.Calendar;
import com.google.api.services.gmail.Gmail;
import com.google.api.services.sheets.v4.Sheets;
import com.google.auth.http.HttpCredentialsAdapter;
import com.google.auth.oauth2.AccessToken;
import com.google.auth.oauth2.GoogleCredentials;
import com.google.auth.oauth2.UserCredentials;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.security.GeneralSecurityException;

@Configuration
public class GoogleApiConfig {

    private static final String APPLICATION_NAME = "Sistema Climbe";
    private static final JsonFactory JSON_FACTORY = GsonFactory.getDefaultInstance();

    @Value("${spring.security.oauth2.client.registration.google.client-id}")
    private String clientId;

    @Value("${spring.security.oauth2.client.registration.google.client-secret}")
    private String clientSecret;

    private HttpRequestInitializer createRequestInitializer(String accessTokenStr) {
        AccessToken accessToken = new AccessToken(accessTokenStr, null);
        GoogleCredentials credentials = GoogleCredentials.create(accessToken);
        return new HttpCredentialsAdapter(credentials);
    }

    public Calendar getCalendarService(String accessTokenStr) throws GeneralSecurityException, IOException {
        final HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        return new Calendar.Builder(httpTransport, JSON_FACTORY, createRequestInitializer(accessTokenStr))
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    public Gmail getGmailService(String accessTokenStr) throws GeneralSecurityException, IOException {
        final HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        return new Gmail.Builder(httpTransport, JSON_FACTORY, createRequestInitializer(accessTokenStr))
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    public Sheets getSheetsService(String accessTokenStr) throws GeneralSecurityException, IOException {
        final HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        return new Sheets.Builder(httpTransport, JSON_FACTORY, createRequestInitializer(accessTokenStr))
                .setApplicationName(APPLICATION_NAME)
                .build();
    }

    public Calendar getCalendarServiceFromRefreshToken(String refreshTokenStr) throws GeneralSecurityException, IOException {
        final HttpTransport httpTransport = GoogleNetHttpTransport.newTrustedTransport();
        GoogleCredentials credentials = UserCredentials.newBuilder()
                .setClientId(clientId)
                .setClientSecret(clientSecret)
                .setRefreshToken(refreshTokenStr)
                .build();
        return new Calendar.Builder(httpTransport, JSON_FACTORY, new HttpCredentialsAdapter(credentials))
                .setApplicationName(APPLICATION_NAME)
                .build();
    }
}
