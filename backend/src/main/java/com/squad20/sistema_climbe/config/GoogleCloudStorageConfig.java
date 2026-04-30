package com.squad20.sistema_climbe.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.cloud.storage.Storage;
import com.google.cloud.storage.StorageOptions;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.IOException;
import java.io.InputStream;

@Configuration
public class GoogleCloudStorageConfig {

    @Value("${gcp.credentials.file.path}")
    private String credentialsFilePath;

    @Bean
    public Storage googleCloudStorage() throws IOException {
        InputStream credentialsStream;

        if (credentialsFilePath.startsWith("classpath:")) {
            String path = credentialsFilePath.replace("classpath:", "");
            credentialsStream = getClass().getClassLoader().getResourceAsStream(path);
            
            if (credentialsStream == null) {
                System.err.println("[GCP Storage] ATENÇÃO: Arquivo de credenciais não encontrado em: " + path);
                System.err.println("Certifique-se de baixar seu arquivo JSON do GCP e colar na pasta src/main/resources com este nome exato.");
                // Retornar fallback sem segurança caso esteja ainda configurando (pode quebrar depois se tentar usar sem proxy auth)
                return StorageOptions.getDefaultInstance().getService();
            }
        } else {
            credentialsStream = new java.io.FileInputStream(credentialsFilePath);
        }

        GoogleCredentials credentials = GoogleCredentials.fromStream(credentialsStream)
                .createScoped("https://www.googleapis.com/auth/cloud-platform");

        return StorageOptions.newBuilder()
                .setCredentials(credentials)
                .build()
                .getService();
    }
}
