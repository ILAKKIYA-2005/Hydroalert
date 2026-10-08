# ========================================================
# Dockerfile for HydroAlert Spring Boot Backend
# Multi-Stage Build:
#   Stage 1: Build the runnable JAR using Maven & Java 17
#   Stage 2: Run the lightweight application with JRE 17
# ========================================================

# --------------------------------------------------------
# Stage 1: Build JAR package
# --------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17-alpine AS builder

WORKDIR /build

# Copy pom.xml and cache dependencies
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy source code and package the application
COPY src ./src
RUN mvn clean package -DskipTests -B

# --------------------------------------------------------
# Stage 2: Runtime Environment
# --------------------------------------------------------
FROM eclipse-temurin:17-jre-alpine

LABEL maintainer="HydroAlert Team"
LABEL description="HydroAlert - Real-Time Water Leakage Detection & Alert Backend API"

WORKDIR /app

# Create a non-root system user for security
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser

# Copy the executable fat jar from the builder stage
COPY --from=builder /build/target/hydroalert-backend-*.jar app.jar

# Expose Spring Boot port
EXPOSE 8080

# Environment variables with sensible defaults (can be overridden at runtime)
ENV SPRING_DATASOURCE_URL="jdbc:mysql://localhost:3306/hydroalert_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true" \
    SPRING_DATASOURCE_USERNAME="root" \
    SPRING_DATASOURCE_PASSWORD="root" \
    HYDROALERT_APP_JWTSECRET="HydroAlertWaterLeakageDetectionSecretKey2026SecureJWTKeyCollegeFinalYearProjectSecret"

# Container health check using the /api/health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:8080/api/health || exit 1

# Launch the Spring Boot application
ENTRYPOINT ["java", "-jar", "app.jar"]
