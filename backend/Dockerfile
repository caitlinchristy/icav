# backend/Dockerfile
# Use Docker BuildKit syntax
# syntax=docker/dockerfile:1.6

##########
# Build
##########
FROM gradle:8.5-jdk17 AS build
WORKDIR /app

# Copy Gradle wrapper and build files
COPY gradle/wrapper/ gradle/wrapper/
COPY gradlew gradlew.bat ./
COPY build.gradle ./

# Warm Gradle cache to avoid re-downloading dependencies
RUN --mount=type=cache,target=/home/gradle/.gradle \
    ./gradlew --no-daemon --version

# Copy source code
COPY src src

# Build the JAR with Gradle
RUN --mount=type=cache,target=/home/gradle/.gradle \
    ./gradlew --no-daemon clean bootJar

##########
# Runtime
##########
FROM eclipse-temurin:17-jdk-jammy
WORKDIR /app

# Copy the built JAR from the build stage
COPY --from=build /app/build/libs/notes-app-1.0.jar app.jar

# Optionally copy Gradle wrapper and source (if you want to allow in-container builds)
COPY --from=build /app/gradlew /app/gradlew.bat ./
COPY --from=build /app/gradle ./gradle
COPY --from=build /app/build.gradle ./
COPY --from=build /app/src ./src

# Make Gradle wrapper executable
RUN chmod +x ./gradlew

EXPOSE 8080
ENTRYPOINT ["java","-jar","/app/app.jar"]