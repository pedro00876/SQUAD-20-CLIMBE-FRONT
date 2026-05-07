package com.squad20.sistema_climbe.domain.notification.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailSenderService {

    private final JavaMailSender javaMailSender;

    @Async
    public void sendEmail(String toEmail, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(toEmail);
            message.setSubject(subject);
            message.setText(body);
            // message.setFrom("seu-email-aqui@gmail.com"); // Opcional, depende das regras do provedor SMTP

            javaMailSender.send(message);
            log.info("E-mail enviado para {} com o assunto: {}", toEmail, subject);
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail para {}: {}", toEmail, e.getMessage());
            // Como é um processo assíncrono isolado, a exceção não quebra o sistema principal
        }
    }
}
