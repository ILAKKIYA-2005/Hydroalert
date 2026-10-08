package com.hydroalert.dto;

import com.hydroalert.model.LeakageStatus;

/**
 * DTO returned by flow reading endpoints.
 */
public class FlowReadingResponse {
    private String location;
    private double flowRate;
    private String status;
    private boolean isLeakage;
    private String timestamp;

    public FlowReadingResponse() {
    }

    public FlowReadingResponse(String location, double flowRate, LeakageStatus status, String timestamp) {
        this.location = location;
        this.flowRate = flowRate;
        this.status = status.getDisplayName();
        this.isLeakage = status == LeakageStatus.POSSIBLE_LEAKAGE;
        this.timestamp = timestamp;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }

    public double getFlowRate() {
        return flowRate;
    }

    public void setFlowRate(double flowRate) {
        this.flowRate = flowRate;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public boolean isLeakage() {
        return isLeakage;
    }

    public void setLeakage(boolean leakage) {
        isLeakage = leakage;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }
}
