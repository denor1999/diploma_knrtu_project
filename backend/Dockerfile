FROM gradle:8.14-jdk21 AS build
USER root
WORKDIR /app

COPY build.gradle .
RUN gradle dependencies --no-daemon

COPY src ./src
RUN gradle bootJar --no-daemon -x test \
    && find build/libs -maxdepth 1 -type f -name '*.jar' ! -name '*-plain.jar' -exec cp {} /tmp/app.jar \;

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /tmp/app.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
