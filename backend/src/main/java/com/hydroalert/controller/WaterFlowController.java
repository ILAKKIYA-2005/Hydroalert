package com.hydroalert.controller;

import com.hydroalert.dto.FlowReadingRequest;
import com.hydroalert.dto.FlowReadingResponse;
import com.hydroalert.model.LeakageStatus;
import com.hydroalert.service.WaterFlowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Water Flow Readings & Leakage Detection.
 *
 * Base Path: /api/flow
 */
@RestController
@RequestMapping("/api/flow")
public class WaterFlowController {

    private final WaterFlowService waterFlowService;

    public WaterFlowController(WaterFlowService waterFlowService) {
        this.waterFlowService = waterFlowService;
    }

    /**
     * GET /api/flow/readings
     * Returns the latest water flow readings and leakage statuses for all monitored locations.
     */
    @GetMapping("/readings")
    public ResponseEntity<List<FlowReadingResponse>> getAllReadings() {
        List<FlowReadingResponse> readings = waterFlowService.getAllReadings();
        return ResponseEntity.ok(readings);
    }

    /**
     * GET /api/flow/simulate
     * Generates a new simulated telemetry reading using project sample values (2.5, 3.0, 3.5, 5.0, 8.5, 9.5).
     */
    @GetMapping("/simulate")
    public ResponseEntity<List<FlowReadingResponse>> simulateNewReadings() {
        List<FlowReadingResponse> updated = waterFlowService.simulateNextReadings();
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/flow/reading
     * Ingests a new water-flow telemetry reading for a location.
     * Automatically evaluates the 8.0 L/min threshold and generates an ACTIVE incident if breached.
     *
     * Request Body:
     * {
     *   "location": "Block B - 2nd Floor",
     *   "flowRate": 9.5
     * }
     */
    @PostMapping("/reading")
    public ResponseEntity<FlowReadingResponse> submitReading(@RequestBody FlowReadingRequest request) {
        if (request.getLocation() == null || request.getLocation().isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        FlowReadingResponse response = waterFlowService.processReading(request.getLocation(), request.getFlowRate());
        return ResponseEntity.ok(response);
    }

    /**
     * GET /api/flow/check?flowRate=9.5
     * Helper endpoint to evaluate whether an arbitrary flow rate is Normal or Possible Leakage.
     */
    @GetMapping("/check")
    public ResponseEntity<Map<String, Object>> checkLeakageThreshold(@RequestParam double flowRate) {
        LeakageStatus status = waterFlowService.evaluateStatus(flowRate);
        return ResponseEntity.ok(Map.of(
                "flowRate", flowRate,
                "threshold", waterFlowService.getLeakageThreshold(),
                "status", status.getDisplayName(),
                "isLeakage", status == LeakageStatus.POSSIBLE_LEAKAGE
        ));
    }

    /**
     * GET /api/flow/threshold
     * Returns the system leakage threshold configuration.
     */
    @GetMapping("/threshold")
    public ResponseEntity<Map<String, Object>> getThreshold() {
        return ResponseEntity.ok(Map.of(
                "thresholdLitersPerMin", waterFlowService.getLeakageThreshold(),
                "rule", "Flow rate < 8.0 L/min -> Normal | Flow rate >= 8.0 L/min -> Possible Leakage"
        ));
    }
}
