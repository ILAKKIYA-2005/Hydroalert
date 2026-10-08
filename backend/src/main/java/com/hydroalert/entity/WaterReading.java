package com.hydroalert.entity;

import jakarta.persistence.*;

/**
 * JPA Entity representing a water flow telemetry record stored in MySQL 'water_readings' table.
 */
@Entity
@Table(name = "water_readings")
public class WaterReading {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String location;

    @Column(nullable = false)
    private double flowRate;

    @Column(nullable = false, length = 50)
    private String timestamp;

    @Column(nullable = false, length = 50)
    private String leakageStatus;

    public WaterReading() {
    }

    public WaterReading(String location, double flowRate, String timestamp, String leakageStatus) {
        this.location = location;
        this.flowRate = flowRate;
        this.timestamp = timestamp;
        this.leakageStatus = leakageStatus;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getLeakageStatus() {
        return leakageStatus;
    }

    public void setLeakageStatus(String leakageStatus) {
        this.leakageStatus = leakageStatus;
    }
}
