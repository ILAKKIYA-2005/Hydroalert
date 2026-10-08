package com.hydroalert.dto;

/**
 * Request payload to submit or check a water flow reading.
 */
public class FlowReadingRequest {
    private String location;
    private double flowRate;

    public FlowReadingRequest() {
    }

    public FlowReadingRequest(String location, double flowRate) {
        this.location = location;
        this.flowRate = flowRate;
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
}
