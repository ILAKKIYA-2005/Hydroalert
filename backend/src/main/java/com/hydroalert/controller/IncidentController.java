package com.hydroalert.controller;

import com.hydroalert.dto.FlowReadingRequest;
import com.hydroalert.entity.Incident;
import com.hydroalert.service.IncidentService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.NoSuchElementException;

/**
 * REST Controller for Incident Lifecycle Management persisted in MySQL.
 *
 * Base Path: /api/incidents
 */
@RestController
@RequestMapping("/api/incidents")
public class IncidentController {

    private final IncidentService incidentService;

    public IncidentController(IncidentService incidentService) {
        this.incidentService = incidentService;
    }

    /**
     * GET /api/incidents/active
     * Returns all currently active or acknowledged incidents requiring attention from MySQL.
     */
    @GetMapping("/active")
    public ResponseEntity<List<Incident>> getActiveIncidents() {
        return ResponseEntity.ok(incidentService.getActiveIncidents());
    }

    /**
     * GET /api/incidents/history
     * Returns all completed incidents archived in MySQL history with status RESOLVED.
     */
    @GetMapping("/history")
    public ResponseEntity<List<Incident>> getIncidentHistory() {
        return ResponseEntity.ok(incidentService.getIncidentHistory());
    }

    /**
     * GET /api/incidents/{id}
     * Returns details of a specific incident by its database ID.
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getIncidentById(@PathVariable Long id) {
        return incidentService.getIncidentById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * POST /api/incidents
     * Creates and saves a new incident in MySQL with status ACTIVE.
     *
     * Request Body:
     * {
     *   "location": "Block B - 2nd Floor",
     *   "flowRate": 9.5
     * }
     */
    @PostMapping
    public ResponseEntity<Incident> createIncident(@RequestBody FlowReadingRequest request) {
        if (request.getLocation() == null || request.getLocation().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        Incident created = incidentService.createIncident(request.getLocation(), request.getFlowRate(), null);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * PUT /api/incidents/{id}/acknowledge
     * Strictly transitions an incident from ACTIVE to ACKNOWLEDGED.
     * Records the acknowledgement timestamp and updates MySQL.
     */
    @PutMapping("/{id}/acknowledge")
    public ResponseEntity<?> acknowledgeIncident(@PathVariable Long id) {
        try {
            Incident acknowledged = incidentService.acknowledgeIncident(id);
            return ResponseEntity.ok(acknowledged);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * PUT /api/incidents/{id}/resolve
     * Strictly transitions an incident from ACKNOWLEDGED to RESOLVED.
     * Records resolution timestamp and updates MySQL.
     */
    @PutMapping("/{id}/resolve")
    public ResponseEntity<?> resolveIncident(@PathVariable Long id) {
        try {
            Incident resolved = incidentService.resolveIncident(id);
            return ResponseEntity.ok(resolved);
        } catch (NoSuchElementException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("error", e.getMessage()));
        } catch (IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("error", e.getMessage()));
        }
    }
}
