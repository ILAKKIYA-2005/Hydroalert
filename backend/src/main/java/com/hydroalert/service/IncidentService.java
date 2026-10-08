package com.hydroalert.service;

import com.hydroalert.entity.Incident;
import com.hydroalert.model.IncidentStatus;
import com.hydroalert.repository.IncidentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

/**
 * Service managing incident persistence in MySQL via Spring Data JPA.
 * Strictly enforces lifecycle: ACTIVE -> ACKNOWLEDGED -> RESOLVED.
 */
@Service
@Transactional
public class IncidentService {

    private final IncidentRepository incidentRepository;
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

    public IncidentService(IncidentRepository incidentRepository) {
        this.incidentRepository = incidentRepository;
    }

    /**
     * Get all active (ACTIVE or ACKNOWLEDGED) incidents from MySQL.
     */
    @Transactional(readOnly = true)
    public List<Incident> getActiveIncidents() {
        return incidentRepository.findByStatusInOrderByIdDesc(
                List.of(IncidentStatus.ACTIVE, IncidentStatus.ACKNOWLEDGED)
        );
    }

    /**
     * Get all completed (RESOLVED) incidents from MySQL.
     */
    @Transactional(readOnly = true)
    public List<Incident> getIncidentHistory() {
        return incidentRepository.findByStatusOrderByIdDesc(IncidentStatus.RESOLVED);
    }

    /**
     * Get a specific incident by its database ID.
     */
    @Transactional(readOnly = true)
    public Optional<Incident> getIncidentById(Long id) {
        return incidentRepository.findById(id);
    }

    /**
     * Prevents duplicate incident creation in MySQL if an active/acknowledged
     * incident already exists for this location.
     */
    public Incident createIncidentIfNotActive(String location, double flowRate, String detectionTime) {
        Optional<Incident> existing = incidentRepository.findFirstByLocationAndStatusIn(
                location,
                List.of(IncidentStatus.ACTIVE, IncidentStatus.ACKNOWLEDGED)
        );

        if (existing.isPresent()) {
            Incident incident = existing.get();
            incident.setFlowRate(flowRate);
            return incidentRepository.save(incident);
        }

        return createIncident(location, flowRate, detectionTime);
    }

    /**
     * Create and persist a new Incident in MySQL with status ACTIVE.
     */
    public Incident createIncident(String location, double flowRate, String detectionTime) {
        if (detectionTime == null || detectionTime.isBlank()) {
            detectionTime = LocalDateTime.now().format(timeFormatter);
        }

        Incident incident = new Incident(location, flowRate, detectionTime);
        incident.setStatus(IncidentStatus.ACTIVE);
        return incidentRepository.save(incident);
    }

    /**
     * Strict Workflow Step 1:
     * Change status: ACTIVE -> ACKNOWLEDGED
     * Records acknowledgement time and saves in MySQL.
     */
    public Incident acknowledgeIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Incident with ID " + id + " not found in database."));

        if (incident.getStatus() != IncidentStatus.ACTIVE) {
            throw new IllegalStateException("Only ACTIVE incidents can be acknowledged. Current status: " + incident.getStatus());
        }

        String ackTime = LocalDateTime.now().format(timeFormatter);
        incident.setStatus(IncidentStatus.ACKNOWLEDGED);
        incident.setAcknowledgementTime(ackTime);
        return incidentRepository.save(incident);
    }

    /**
     * Strict Workflow Step 2:
     * Change status: ACKNOWLEDGED -> RESOLVED
     * Records resolution time and persists in MySQL.
     */
    public Incident resolveIncident(Long id) {
        Incident incident = incidentRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Incident with ID " + id + " not found in database."));

        if (incident.getStatus() != IncidentStatus.ACKNOWLEDGED) {
            throw new IllegalStateException("Only ACKNOWLEDGED incidents can be marked as RESOLVED. Current status: " + incident.getStatus());
        }

        String resTime = LocalDateTime.now().format(timeFormatter);
        incident.setStatus(IncidentStatus.RESOLVED);
        incident.setResolutionTime(resTime);
        return incidentRepository.save(incident);
    }
}
