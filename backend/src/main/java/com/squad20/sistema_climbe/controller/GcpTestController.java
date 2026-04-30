package com.squad20.sistema_climbe.controller;

import com.squad20.sistema_climbe.service.GoogleCloudStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Tag(name = "Teste GCP Storage", description = "Endpoints temporários para testar conexão com o Google Cloud Storage")
@RestController
@RequestMapping("/api/gcp-test")
@RequiredArgsConstructor
public class GcpTestController {

    private final GoogleCloudStorageService storageService;

    @Operation(summary = "Fazer um upload teste", description = "Sobe um arquivo para o seu Bucket e devolve um link temporário para certificar que funcionou.")
    @PostMapping(value = "/upload", consumes = "multipart/form-data")
    public ResponseEntity<String> testUpload(@RequestParam("file") MultipartFile file) {
        try {
            // 1. Faz o upload e pega o caminho interno no GCP
            String pathBanco = storageService.uploadPrivateFile(file, "pasta_teste");
            
            // 2. Transforma o caminho interno numa URL assinada de 30 minutos
            String urlVisualizacao = storageService.generateSignedUrl(pathBanco);
            
            return ResponseEntity.ok(
                "SUCESSO! Objeto criado como: " + pathBanco + 
                "\n\nLink temporário para clicar e ver o arquivo na nuvem:\n" + urlVisualizacao
            );
        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body("Erro ao subir para o GCP. Verifique se o JSON é válido! Erro: " + e.getMessage());
        }
    }
}
