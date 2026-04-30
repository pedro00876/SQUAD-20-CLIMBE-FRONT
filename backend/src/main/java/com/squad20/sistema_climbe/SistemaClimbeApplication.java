package com.squad20.sistema_climbe;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.scheduling.annotation.EnableAsync;

@EnableAsync
@SpringBootApplication
public class SistemaClimbeApplication {

    public static void main(String[] args) {
        SpringApplication.run(SistemaClimbeApplication.class, args);
    }

}
