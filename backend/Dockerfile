# Build stage: compila o JAR dentro do container usando Gradle Wrapper
FROM eclipse-temurin:21-jdk-jammy AS builder

WORKDIR /app

# Copiar arquivos necessários para o Gradle Wrapper e configuração
COPY gradlew gradlew
COPY gradle gradle
COPY build.gradle settings.gradle ./

# Copiar código-fonte
COPY src src

# Garantir permissão de execução e gerar o JAR
RUN chmod +x gradlew && ./gradlew clean bootJar --no-daemon

# Runtime stage: imagem enxuta para executar o JAR
FROM eclipse-temurin:21-jre-jammy

WORKDIR /app

# Copiar o JAR gerado do estágio de build
COPY --from=builder /app/build/libs/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]