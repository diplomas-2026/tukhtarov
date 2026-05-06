FROM eclipse-temurin:17-jdk AS builder

WORKDIR /workspace/tukhtarov-api

COPY tukhtarov-api/gradlew ./gradlew
COPY tukhtarov-api/gradle ./gradle
COPY tukhtarov-api/build.gradle ./build.gradle
COPY tukhtarov-api/settings.gradle ./settings.gradle
COPY tukhtarov-api/src ./src

RUN chmod +x ./gradlew && ./gradlew bootJar --no-daemon

FROM eclipse-temurin:17-jre

WORKDIR /app

COPY --from=builder /workspace/tukhtarov-api/build/libs/*.jar /app/app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "/app/app.jar"]
