package com.squad20.sistema_climbe.service;

import com.google.api.services.gmail.Gmail;
import com.google.api.services.gmail.model.Message;
import com.squad20.sistema_climbe.config.GoogleApiConfig;
import jakarta.mail.Session;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Base64;
import java.util.Properties;

@Service
@RequiredArgsConstructor
public class GoogleGmailService {

    private final GoogleApiConfig googleApiConfig;

    public Message sendEmail(String accessTokenStr, String toEmailAddress, String subject, String bodyText) throws GeneralSecurityException, IOException, jakarta.mail.MessagingException {
        Gmail service = googleApiConfig.getGmailService(accessTokenStr);

        Properties props = new Properties();
        Session session = Session.getDefaultInstance(props, null);

        MimeMessage email = new MimeMessage(session);
        email.setFrom(new InternetAddress("me")); // "me" é a referência nativa da própria conta logada no OAuth.
        email.addRecipient(jakarta.mail.Message.RecipientType.TO, new InternetAddress(toEmailAddress));
        email.setSubject(subject);
        email.setText(bodyText);

        ByteArrayOutputStream buffer = new ByteArrayOutputStream();
        email.writeTo(buffer);
        byte[] bytes = buffer.toByteArray();
        String encodedEmail = Base64.getUrlEncoder().encodeToString(bytes);

        Message message = new Message();
        message.setRaw(encodedEmail);

        return service.users().messages().send("me", message).execute();
    }
}
