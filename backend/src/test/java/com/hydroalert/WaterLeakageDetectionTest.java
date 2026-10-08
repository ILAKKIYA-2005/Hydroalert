package com.hydroalert;

import com.hydroalert.dto.FlowReadingResponse;
import com.hydroalert.entity.Incident;
import com.hydroalert.model.IncidentStatus;
import com.hydroalert.model.LeakageStatus;
import com.hydroalert.repository.IncidentRepository;
import com.hydroalert.service.WaterFlowService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Automated tests for Water Leakage Detection logic.
 *
 * Requirements covered:
 * 1. Flow rate below 8.0 L/min should be NORMAL.
 * 2. Flow rate 8.0 L/min or above should be detected as POSSIBLE_LEAKAGE.
 * 3. Leakage detection should create an ACTIVE incident.
 */
@SpringBootTest
@Transactional
class WaterLeakageDetectionTest {

    @Autowired
    private WaterFlowService waterFlowService;

    @Autowired
    private IncidentRepository incidentRepository;

    @Test
    @DisplayName("Requirement 1: Flow rate below 8.0 L/min should be NORMAL")
    void testFlowRateBelowThresholdIsNormal() {
        // Values lower than 8.0 L/min threshold
        assertEquals(LeakageStatus.NORMAL, waterFlowService.evaluateStatus(2.5));
        assertEquals(LeakageStatus.NORMAL, waterFlowService.evaluateStatus(3.0));
        assertEquals(LeakageStatus.NORMAL, waterFlowService.evaluateStatus(3.5));
        assertEquals(LeakageStatus.NORMAL, waterFlowService.evaluateStatus(5.0));
        assertEquals(LeakageStatus.NORMAL, waterFlowService.evaluateStatus(7.9));
    }

    @Test
    @DisplayName("Requirement 2: Flow rate 8.0 L/min or above should be detected as POSSIBLE_LEAKAGE")
    void testFlowRateAtOrAboveThresholdIsPossibleLeakage() {
        // Values at or above 8.0 L/min threshold
        assertEquals(LeakageStatus.POSSIBLE_LEAKAGE, waterFlowService.evaluateStatus(8.0));
        assertEquals(LeakageStatus.POSSIBLE_LEAKAGE, waterFlowService.evaluateStatus(8.5));
        assertEquals(LeakageStatus.POSSIBLE_LEAKAGE, waterFlowService.evaluateStatus(9.5));
        assertEquals(LeakageStatus.POSSIBLE_LEAKAGE, waterFlowService.evaluateStatus(15.0));
    }

    @Test
    @DisplayName("Requirement 3: Leakage detection should create an ACTIVE incident")
    void testLeakageDetectionCreatesActiveIncident() {
        String testLocation = "Block C - Ground Floor";
        double anomalousFlowRate = 9.5;

        // Process a spiked flow rate (9.5 L/min >= 8.0 L/min)
        FlowReadingResponse response = waterFlowService.processReading(testLocation, anomalousFlowRate);

        // Verify response status is POSSIBLE_LEAKAGE
        assertEquals(LeakageStatus.POSSIBLE_LEAKAGE, response.getStatus());
        assertTrue(response.isLeakage());

        // Verify an ACTIVE incident was created and saved in the database
        List<Incident> activeIncidents = incidentRepository.findByStatusInOrderByIdDesc(
                List.of(IncidentStatus.ACTIVE)
        );

        boolean incidentFound = activeIncidents.stream()
                .anyMatch(i -> testLocation.equals(i.getLocation()) &&
                               i.getFlowRate() == anomalousFlowRate &&
                               i.getStatus() == IncidentStatus.ACTIVE);

        assertTrue(incidentFound, "Expected an ACTIVE incident to be created for " + testLocation);
    }
}
