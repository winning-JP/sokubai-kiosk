FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /app
COPY app/backend/pom.xml .
RUN mvn -B -q -DskipTests dependency:go-offline
COPY app/backend/src ./src
COPY app/kiosk ./src/main/resources/static
COPY 企画書.html ./src/main/resources/static/proposal.html
RUN mvn -B -q -DskipTests package

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/kiosk-0.0.1-SNAPSHOT.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
