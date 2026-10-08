package com.hydroalert.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;
import java.time.Instant;
import java.util.LinkedHashMap;
import java.util.Map;

/**
 * Health Check REST Controller:
 * GET /api/health
 *
 * Provides a lightweight, unauthenticated health check endpoint
 * suitable for container healthchecks, DevOps monitoring, and frontend verification.
 */
@RestController
@RequestMapping("/api/health")
public class HealthController {

    private final DataSource dataSource;

    public HealthController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("status", "UP");
        health.put("service", "HydroAlert Backend API");
        health.put("version", "1.0.0");
        health.put("timestamp", Instant.now().toString());

        // Evaluate database connection status
        try (Connection connection = dataSource.getConnection()) {
            boolean isDbValid = connection.isValid(2);
            health.put("database", isDbValid ? "CONNECTED" : "UNHEALTHY");
            health.put("databaseProduct", connection.getMetaData().getDatabaseProductName());
        } catch (Exception ex) {
            health.put("database", "DISCONNECTED");
            health.put("databaseError", ex.getMessage());
        }

        return ResponseEntity.ok(health);
    }
}
