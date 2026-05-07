package com.squad20.sistema_climbe.service;

import com.google.cloud.storage.BlobId;
import com.google.cloud.storage.BlobInfo;
import com.google.cloud.storage.HttpMethod;
import com.google.cloud.storage.Storage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.URL;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class GoogleCloudStorageService {

    private final Storage storage;

    @Value("${gcp.bucket.name}")
    private String bucketName;

    public GoogleCloudStorageService(Storage storage) {
        this.storage = storage;
    }

    /**
     * Faz o upload de um arquivo para o bucket de forma privada.
     * Retorna o Caminho físico (path) salvo no bucket (Esse nome que vc guarda no banco de dados).
     */
    public String uploadPrivateFile(MultipartFile file, String folderName) throws IOException {
        String originalName = file.getOriginalFilename();
        // Gerar um UUID pra evitar sobrepor arquivos que o dono salva com mesmo nome.
        String uniqueFileName = folderName + "/" + UUID.randomUUID() + "-" + originalName;

        BlobId blobId = BlobId.of(bucketName, uniqueFileName);
        BlobInfo blobInfo = BlobInfo.newBuilder(blobId)
                .setContentType(file.getContentType()) // Ex: "image/png" ou "application/pdf"
                .build();

        // Envia efetivamente pro google cloud
        storage.create(blobInfo, file.getBytes());

        return uniqueFileName;
    }

    /**
     * Gera uma "Signed URL" (URL Assinada).
     * Esse é o segredo de arquivos privados: É um link válido por apenas 30 minutos
     * que você manda pro Front-End. O seu front exibe a imagem ou faz o download usando esse Link.
     * Qualquer pessoa que tentar usar o link depois de 30 mins vai levar erro de 'AccessDenied'.
     */
    public String generateSignedUrl(String pathNoBucket) {
        BlobInfo blobInfo = BlobInfo.newBuilder(BlobId.of(bucketName, pathNoBucket)).build();

        URL url = storage.signUrl(
                blobInfo,
                30, TimeUnit.MINUTES,
                Storage.SignUrlOption.httpMethod(HttpMethod.GET),
                Storage.SignUrlOption.withV4Signature()
        );

        return url.toString();
    }

    /**
     * Apaga um arquivo fisicamente do bucket.
     * Chame esse método caso um usuário apague seu perfil ou documento do seu Banco pra não pagar infra inútil.
     */
    public boolean deleteFile(String pathNoBucket) {
        BlobId blobId = BlobId.of(bucketName, pathNoBucket);
        return storage.delete(blobId);
    }
}
