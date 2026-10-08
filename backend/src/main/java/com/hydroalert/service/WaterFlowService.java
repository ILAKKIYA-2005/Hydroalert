package com.hydroalert.service;

import com.hydroalert.dto.FlowReadingResponse;
import com.hydroalert.entity.WaterReading;
import com.hydroalert.model.LeakageStatus;
import com.hydroalert.repository.WaterReadingRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Service managing water flow telemetry, 8.0 L/min leakage detection,
 * and persisting water readings to MySQL 'water_readings' table.
 */
@Service
@Transactional
public class WaterFlowService {

    @Value("${hydroalert.leakage-threshold:8.0}")
    private double leakageThreshold = 8.0;

    private static final double[] SIMULATED_SAMPLE_VALUES = {2.5, 3.0, 3.5, 5.0, 8.5, 9.5};

    private final WaterReadingRepository waterReadingRepository;
    private final IncidentService incidentService;
    private final Random random = new Random();
    private final DateTimeFormatter timeFormatter = DateTimeFormatter.ofPattern("hh:mm a");

    // Monitored locations list
    private static final List<String> MONITORED_LOCATIONS = List.of(
            "Block A - 1st Floor",
            "Block B - 2nd Floor",
            "Block C - Ground Floor"
    );

    public WaterFlowService(WaterReadingRepository waterReadingRepository, IncidentService incidentService) {
        this.waterReadingRepository = waterReadingRepository;
        this.incidentService = incidentService;
    }

    /**
     * Rule:
     * - Flow rate < 8.0 L/min  -> Normal
     * - Flow rate >= 8.0 L/min -> Possible Leakage
     */
    public LeakageStatus evaluateStatus(double flowRate) {
        if (flowRate >= leakageThreshold) {
            return LeakageStatus.POSSIBLE_LEAKAGE;
        } else {
            return LeakageStatus.NORMAL;
        }
    }

    /**
     * Get the latest reading for each monitored location from MySQL.
     */
    @Transactional(readOnly = true)
    public List<FlowReadingResponse> getAllReadings() {
        List<FlowReadingResponse> responses = new ArrayList<>();
        String fallbackTime = LocalDateTime.now().format(timeFormatter);

        for (String location : MONITORED_LOCATIONS) {
            Optional<WaterReading> latest = waterReadingRepository.findFirstByLocationOrderByIdDesc(location);
            if (latest.isPresent()) {
                WaterReading wr = latest.get();
                LeakageStatus status = evaluateStatus(wr.getFlowRate());
                responses.add(new FlowReadingResponse(location, wr.getFlowRate(), status, wr.getTimestamp()));
            } else {
                // Fallback default if not yet seeded
                responses.add(new FlowReadingResponse(location, 3.0, LeakageStatus.NORMAL, fallbackTime));
            }
        }

        return responses;
    }

    /**
     * Process an incoming water flow reading, persist it to MySQL,
     * and automatically trigger an incident if >= 8.0 L/min.
     */
    public FlowReadingResponse processReading(String location, double flowRate) {
        LeakageStatus status = evaluateStatus(flowRate);
        String timestamp = LocalDateTime.now().format(timeFormatter);

        // 1. Save telemetry reading to MySQL table 'water_readings'
        WaterReading reading = new WaterReading(location, flowRate, timestamp, status.getDisplayName());
        waterReadingRepository.save(reading);

        // 2. Trigger Active Incident if Possible Leakage detected
        if (status == LeakageStatus.POSSIBLE_LEAKAGE) {
            incidentService.createIncidentIfNotActive(location, flowRate, timestamp);
        }

        return new FlowReadingResponse(location, flowRate, status, timestamp);
    }

    /**
     * Simulate a new telemetry reading from sample values (2.5, 3.0, 3.5, 5.0, 8.5, 9.5),
     * persist it in MySQL, and return current status.
     */
    public List<FlowReadingResponse> simulateNextReadings() {
        String targetLocation = MONITORED_LOCATIONS.get(random.nextInt(MONITORED_LOCATIONS.size()));
        double newRate = SIMULATED_SAMPLE_VALUES[random.nextInt(SIMULATED_SAMPLE_VALUES.length)];

        processReading(targetLocation, newRate);
        return getAllReadings();
    }

    public double getLeakageThreshold() {
        return leakageThreshold;
    }
}
