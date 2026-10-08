package com.hydroalert;

import com.hydroalert.entity.Incident;
import com.hydroalert.model.IncidentStatus;
import com.hydroalert.repository.IncidentRepository;
import com.hydroalert.service.IncidentService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Automated tests for Incident Lifecycle Management.
 *
 * Requirements covered:
 * 4. ACTIVE incident should be changed to ACKNOWLEDGED.
 * 5. ACKNOWLEDGED incident should be changed to RESOLVED.
 * 6. Resolved incidents should be available in incident history.
 */
@SpringBootTest
@Transactional
class IncidentLifecycleWorkflowTest {

    @Autowired
    private IncidentService incidentService;

    @Autowired
    private IncidentRepository incidentRepository;

    @Test
    @DisplayName("Requirement 4: ACTIVE incident should be changed to ACKNOWLEDGED")
    void testActiveIncidentCanBeAcknowledged() {
        // Step 1: Create an incident in ACTIVE state
        Incident created = incidentService.createIncident("Block A - 1st Floor", 8.8, "10:00 AM");
        assertNotNull(created.getId());
        assertEquals(IncidentStatus.ACTIVE, created.getStatus());
        assertNull(created.getAcknowledgementTime());

        // Step 2: Transition from ACTIVE -> ACKNOWLEDGED
        Incident acknowledged = incidentService.acknowledgeIncident(created.getId());

        // Assertions
        assertEquals(IncidentStatus.ACKNOWLEDGED, acknowledged.getStatus());
        assertNotNull(acknowledged.getAcknowledgementTime(), "Acknowledgement timestamp must be recorded");
        assertNull(acknowledged.getResolutionTime(), "Resolution time should still be null");

        // Verify state directly in database repository
        Incident fromDb = incidentRepository.findById(created.getId()).orElseThrow();
        assertEquals(IncidentStatus.ACKNOWLEDGED, fromDb.getStatus());
    }

    @Test
    @DisplayName("Requirement 5: ACKNOWLEDGED incident should be changed to RESOLVED")
    void testAcknowledgedIncidentCanBeResolved() {
        // Step 1: Create an ACTIVE incident and acknowledge it
        Incident created = incidentService.createIncident("Block B - 2nd Floor", 9.2, "10:15 AM");
        Incident acknowledged = incidentService.acknowledgeIncident(created.getId());
        assertEquals(IncidentStatus.ACKNOWLEDGED, acknowledged.getStatus());

        // Step 2: Transition from ACKNOWLEDGED -> RESOLVED
        Incident resolved = incidentService.resolveIncident(acknowledged.getId());

        // Assertions
        assertEquals(IncidentStatus.RESOLVED, resolved.getStatus());
        assertNotNull(resolved.getResolutionTime(), "Resolution timestamp must be recorded");

        // Verify state in database repository
        Incident fromDb = incidentRepository.findById(created.getId()).orElseThrow();
        assertEquals(IncidentStatus.RESOLVED, fromDb.getStatus());
    }

    @Test
    @DisplayName("Requirement 6: Resolved incidents should be available in incident history")
    void testResolvedIncidentsAvailableInHistory() {
        // Create, acknowledge, and resolve a new incident
        Incident incident = incidentService.createIncident("Block C - Ground Floor", 8.6, "11:00 AM");
        incidentService.acknowledgeIncident(incident.getId());
        incidentService.resolveIncident(incident.getId());

        // Query incident history
        List<Incident> historyList = incidentService.getIncidentHistory();
        assertNotNull(historyList);
        assertFalse(historyList.isEmpty(), "Incident history must not be empty");

        // Ensure the newly resolved incident is present in history
        boolean existsInHistory = historyList.stream()
                .anyMatch(i -> i.getId().equals(incident.getId()) && i.getStatus() == IncidentStatus.RESOLVED);

        assertTrue(existsInHistory, "Resolved incident should be accessible in incident history");

        // Ensure the resolved incident is NO LONGER present in the active queue
        List<Incident> activeList = incidentService.getActiveIncidents();
        boolean existsInActive = activeList.stream()
                .anyMatch(i -> i.getId().equals(incident.getId()));

        assertFalse(existsInActive, "Resolved incident must not appear in the active queue");
    }

    @Test
    @DisplayName("Strict Workflow Enforced: Cannot jump directly from ACTIVE to RESOLVED")
    void testCannotSkipAcknowledgeStep() {
        // Create an ACTIVE incident
        Incident incident = incidentService.createIncident("Block A - 1st Floor", 9.0, "11:30 AM");

        // Attempting to resolve directly without acknowledging first must fail
        assertThrows(IllegalStateException.class, () -> {
            incidentService.resolveIncident(incident.getId());
        }, "Should throw IllegalStateException when trying to resolve an ACTIVE incident directly");
    }
}
